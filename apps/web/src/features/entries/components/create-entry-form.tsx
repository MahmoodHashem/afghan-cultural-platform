"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { domAnimation, LazyMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { applyApiFieldErrors } from "@/features/auth/utils/form-errors";
import type { ContributionTaxonomyData } from "@/features/entries/api/contribution-taxonomy-api";
import {
  createEntryDraft,
  createEntrySource,
  deleteEntrySource,
  getOwnEntry,
  replaceEntryTags,
  submitEntryForReview,
  updateEntryDraft,
  updateEntrySource,
  upsertEntryYouTubeVideo,
} from "@/features/entries/api/entry-drafts-api";
import { useStagedEntryImages } from "@/features/entries/hooks/use-staged-entry-images";
import {
  type CreateEntryFormValues,
  createEntryFormSchema,
} from "@/features/entries/schemas/create-entry-schema";
import type { SaveState } from "@/features/entries/types/create-entry-form";
import { getEntryFormErrorMessage } from "@/features/entries/utils/create-entry-errors";
import {
  createEntryFieldNameMap,
  createMetadataSummary,
  emptyToUndefined,
  isUsefulSource,
  toCreateEntryFormDefaults,
  toDraftPayload,
  toSelectOptions,
  toSourceInput,
  validateDistrictProvince,
} from "@/features/entries/utils/create-entry-form-utils";
import { profileQueryKeys } from "@/features/profile/constants/profile-query-keys";
import { formatPersianNumber } from "@/lib/utils/formatters";
import { CreateEntryEditorHeader, CreateEntryEditorSection } from "./create-entry-editor-layout";
import {
  DetailsSection,
  ImagesSection,
  SourcesSection,
  YouTubeSection,
} from "./create-entry-sections";
import { CreateEntryWritingSurface } from "./create-entry-writing-surface";

type CreateEntryFormProps = {
  initialDraftId?: string;
  taxonomy: ContributionTaxonomyData;
};

const editableEntryStatuses = new Set(["DRAFT", "CHANGES_REQUESTED"]);

function CreateEntryForm({ initialDraftId, taxonomy }: CreateEntryFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [draftId, setDraftId] = useState<string | null>(initialDraftId ?? null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [isSyncingMedia, setIsSyncingMedia] = useState(false);
  const draftQuery = useQuery({
    queryKey: ["entry-draft", initialDraftId],
    queryFn: ({ signal }) => getOwnEntry(initialDraftId as string, signal),
    enabled: Boolean(initialDraftId),
  });
  const initialDraft = draftQuery.data;

  const form = useForm<CreateEntryFormValues>({
    resolver: zodResolver(createEntryFormSchema),
    mode: "onBlur",
    defaultValues: toCreateEntryFormDefaults(),
  });

  const {
    control,
    formState: { errors, isDirty },
    getValues,
    register,
    setError,
    setValue,
  } = form;
  const sourceFields = useFieldArray({
    control,
    name: "sources",
    keyName: "fieldKey",
  });
  const watchedValues = useWatch({ control });
  const selectedProvinceId = watchedValues.provinceId;
  const selectedScope = watchedValues.geographicScope ?? "PROVINCE";
  const selectedTagIds = watchedValues.tagIds ?? [];
  const markUnsaved = () => setSaveState("unsaved");
  const stagedImages = useStagedEntryImages({
    draftId,
    getTitle: () => form.getValues("title"),
    initialImages: initialDraft?.images,
    onDirty: markUnsaved,
  });
  const { hasPendingImages, imageInputRef, images } = stagedImages;
  const isDraftLoading = Boolean(initialDraftId && draftQuery.isLoading);
  const isDraftUnavailable = Boolean(initialDraftId && draftQuery.isError);
  const isDraftLocked = Boolean(initialDraft && !editableEntryStatuses.has(initialDraft.status));
  const isBusy = saveState === "saving" || isSyncingMedia || isDraftLoading || isDraftLocked;
  const hasUnsavedChanges = isDirty || hasPendingImages || saveState === "unsaved";

  useEffect(() => {
    if (!initialDraft) {
      return;
    }

    setDraftId(initialDraft.id);
    form.reset(toCreateEntryFormDefaults(initialDraft));
    setSaveState("saved");
  }, [form, initialDraft]);

  const provinceOptions = useMemo(() => toSelectOptions(taxonomy.provinces), [taxonomy.provinces]);
  const categoryOptions = useMemo(
    () => toSelectOptions(taxonomy.categories),
    [taxonomy.categories],
  );
  const contentTypeOptions = useMemo(
    () => toSelectOptions(taxonomy.contentTypes),
    [taxonomy.contentTypes],
  );
  const tagOptions = useMemo(() => toSelectOptions(taxonomy.tags), [taxonomy.tags]);
  const districtOptions = useMemo(
    () =>
      toSelectOptions(
        taxonomy.districts.filter(
          (district) => !selectedProvinceId || district.provinceId === selectedProvinceId,
        ),
      ),
    [selectedProvinceId, taxonomy.districts],
  );

  const detailsSummary = useMemo(
    () =>
      createMetadataSummary({
        values: watchedValues,
        provinces: taxonomy.provinces,
        categories: taxonomy.categories,
        contentTypes: taxonomy.contentTypes,
        tagCount: selectedTagIds.length,
      }),
    [
      selectedTagIds.length,
      taxonomy.categories,
      taxonomy.contentTypes,
      taxonomy.provinces,
      watchedValues,
    ],
  );

  useEffect(() => {
    if (selectedScope !== "PROVINCE") {
      setValue("provinceId", "", { shouldDirty: true, shouldValidate: true });
      setValue("districtId", "", { shouldDirty: true, shouldValidate: true });
    }
  }, [selectedScope, setValue]);

  useEffect(() => {
    if (!selectedProvinceId || !watchedValues.districtId) {
      return;
    }

    const district = taxonomy.districts.find((item) => item.id === watchedValues.districtId);

    if (district && district.provinceId !== selectedProvinceId) {
      setValue("districtId", "", { shouldDirty: true, shouldValidate: true });
    }
  }, [selectedProvinceId, setValue, taxonomy.districts, watchedValues.districtId]);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  async function handleSaveDraft() {
    await persistDraft({ showSuccessToast: true });
  }

  async function handleSubmitForReview() {
    const savedDraft = await persistDraft({ showSuccessToast: false });

    if (!savedDraft) {
      return;
    }

    setSaveState("saving");

    try {
      const submission = await submitEntryForReview(savedDraft.id);
      setDraftId(submission.entry.id);
      setSaveState("submitted");
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.all });
      toast.success("مطلب برای بررسی فرستاده شد.");
      router.replace("/profile?tab=entries&status=PENDING_REVIEW");
    } catch (error) {
      applyApiFieldErrors(error, setError, createEntryFieldNameMap);
      setSaveState("unsaved");
      toast.error(getEntryFormErrorMessage(error));
    }
  }

  async function persistDraft({ showSuccessToast }: { showSuccessToast: boolean }) {
    const isValid = await form.trigger();

    if (!isValid) {
      setSaveState("unsaved");
      toast.error("برای ذخیره پیش‌نویس، بخش‌های ضروری را کامل کنید.");
      return null;
    }

    const values = form.getValues();

    if (!validateDistrictProvince(values, taxonomy.districts, setError)) {
      setSaveState("unsaved");
      toast.error("ولسوالی با ولایت انتخاب‌شده سازگار نیست.");
      return null;
    }

    const payload = toDraftPayload(values);
    setSaveState("saving");

    try {
      const savedDraft = draftId
        ? await updateEntryDraft(draftId, payload)
        : await createEntryDraft(payload);
      const wasNewDraft = !draftId;

      setDraftId(savedDraft.id);
      await syncRelatedContent(savedDraft.id, values);
      form.reset(form.getValues());
      setSaveState("saved");

      if (wasNewDraft) {
        router.replace(`/entries/${savedDraft.id}/edit`);
      }

      if (showSuccessToast) {
        toast.success("پیش‌نویس ذخیره شد.");
      }

      return savedDraft;
    } catch (error) {
      applyApiFieldErrors(error, setError, createEntryFieldNameMap);
      setSaveState("unsaved");
      toast.error(getEntryFormErrorMessage(error));
      return null;
    }
  }

  async function syncRelatedContent(entryId: string, values: CreateEntryFormValues) {
    setIsSyncingMedia(true);

    try {
      await replaceEntryTags(entryId, values.tagIds);
      await syncSources(entryId, values);
      await syncYouTubeVideo(entryId, values);
      await stagedImages.syncPendingImages(entryId);
    } finally {
      setIsSyncingMedia(false);
    }
  }

  async function syncSources(entryId: string, values: CreateEntryFormValues) {
    const sourceValues = values.sources.flatMap((source, index) => {
      const input = toSourceInput(source, index);

      return isUsefulSource(input) ? [{ index, input }] : [];
    });

    await Promise.all(
      sourceValues.map(async ({ index, input }) => {
        const { id, ...source } = input;

        if (id) {
          return updateEntrySource(entryId, id, source);
        }

        const createdSource = await createEntrySource(entryId, source);

        if (values.sources[index]) {
          sourceFields.update(index, {
            ...values.sources[index],
            id: createdSource.id,
          });
        }

        return createdSource;
      }),
    );
  }

  async function syncYouTubeVideo(entryId: string, values: CreateEntryFormValues) {
    if (!values.youtubeUrl?.trim()) {
      return;
    }

    await upsertEntryYouTubeVideo(entryId, {
      url: values.youtubeUrl.trim(),
      title: emptyToUndefined(values.youtubeTitle),
      description: emptyToUndefined(values.youtubeDescription),
    });
  }

  async function handleRemoveSource(index: number) {
    const source = form.getValues(`sources.${index}`);

    if (draftId && source?.id) {
      try {
        await deleteEntrySource(draftId, source.id);
      } catch (error) {
        toast.error(getEntryFormErrorMessage(error));
        return;
      }
    }

    sourceFields.remove(index);
    setSaveState("unsaved");
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-background text-foreground">
        <CreateEntryEditorHeader
          title={initialDraftId ? "ویرایش مطلب" : "مطلب جدید"}
          isBusy={isBusy}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmitForReview}
        />

        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          {isDraftLoading ? <DraftEditorLoadingState /> : null}
          {isDraftUnavailable ? <DraftEditorErrorState /> : null}
          {isDraftLocked ? <DraftEditorLockedState /> : null}
          {!isDraftLoading && !isDraftUnavailable && !isDraftLocked ? (
            <form className="bg-background px-0 py-6 sm:px-8 lg:px-14" noValidate>
              <CreateEntryWritingSurface
                control={control}
                errors={errors}
                register={register}
                onDirty={markUnsaved}
              />

              <section className="mt-8 divide-y divide-border border-y border-border">
                <CreateEntryEditorSection title="جزئیات مطلب" summary={detailsSummary}>
                  <DetailsSection
                    categoryOptions={categoryOptions}
                    contentTypeOptions={contentTypeOptions}
                    control={control}
                    districtOptions={districtOptions}
                    errors={errors}
                    provinceOptions={provinceOptions}
                    register={register}
                    selectedProvinceId={selectedProvinceId}
                    selectedScope={selectedScope}
                    tagOptions={tagOptions}
                    onDirty={markUnsaved}
                  />
                </CreateEntryEditorSection>

                <CreateEntryEditorSection
                  title="تصاویر"
                  summary={`${formatPersianNumber(images.length)} تصویر`}
                >
                  <ImagesSection
                    imageInputRef={imageInputRef}
                    images={images}
                    onAddImages={stagedImages.selectImages}
                    onChangeImage={stagedImages.updateImage}
                    onMoveImage={stagedImages.moveImage}
                    onRemoveImage={stagedImages.removeImage}
                  />
                </CreateEntryEditorSection>

                <CreateEntryEditorSection
                  title="منابع"
                  summary={`${formatPersianNumber(sourceFields.fields.length)} منبع`}
                >
                  <SourcesSection
                    control={control}
                    register={register}
                    sourceFields={sourceFields}
                    onDirty={markUnsaved}
                    onRemoveSource={handleRemoveSource}
                  />
                </CreateEntryEditorSection>

                <CreateEntryEditorSection
                  title="ویدیوی مرتبط"
                  summary={watchedValues.youtubeUrl ? "ویدیو اضافه شده" : "اختیاری"}
                >
                  <YouTubeSection
                    control={control}
                    errors={errors}
                    getValues={getValues}
                    setValue={setValue}
                    onDirty={markUnsaved}
                  />
                </CreateEntryEditorSection>
              </section>
            </form>
          ) : null}
        </main>
      </div>
    </LazyMotion>
  );
}

function DraftEditorLoadingState() {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4 text-small text-muted-foreground">
      پیش‌نویس در حال آماده‌سازی است...
    </div>
  );
}

function DraftEditorErrorState() {
  return (
    <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-5 py-4 text-small text-destructive">
      پیش‌نویس پیدا نشد یا امکان ویرایش آن وجود ندارد.
    </div>
  );
}

function DraftEditorLockedState() {
  return (
    <div className="rounded-xl border border-gold/35 bg-gold/10 px-5 py-4 text-small text-[#8A641C]">
      این مطلب در وضعیت قابل ویرایش نیست.
    </div>
  );
}

export { CreateEntryForm };
