"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { domAnimation, LazyMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { type UseFormReturn, useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { applyApiFieldErrors } from "@/features/auth/utils/form-errors";
import type { ContributionTaxonomyData } from "@/features/entries/api/contribution-taxonomy-api";
import {
  createEntryDraft,
  createEntryRevisionSource,
  createEntrySource,
  deleteEntryRevisionSource,
  deleteEntrySource,
  getEntryRevision,
  getOwnEntry,
  removeEntryRevisionYouTubeVideo,
  replaceEntryRevisionTags,
  replaceEntryTags,
  submitEntryForReview,
  submitEntryRevision,
  updateEntryDraft,
  updateEntryRevision,
  updateEntryRevisionSource,
  updateEntrySource,
  upsertEntryRevisionYouTubeVideo,
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
import { useIsMobile } from "@/hooks/use-mobile";
import { formatPersianNumber } from "@/lib/utils/formatters";
import {
  CreateEntryEditorHeader,
  CreateEntryEditorSection,
  MobileEditorSaveAction,
} from "./create-entry-editor-layout";
import {
  EntryPreviewDialog,
  type ReadinessIssue,
  SubmissionReadinessDrawer,
  UnsavedEntryDialog,
} from "./create-entry-overlays";
import {
  DetailsSection,
  ImagesSection,
  SourcesSection,
  YouTubeSection,
} from "./create-entry-sections";
import { CreateEntryWritingSurface } from "./create-entry-writing-surface";

type CreateEntryFormProps = {
  initialDraftId?: string;
  revisionMode?: boolean;
  taxonomy: ContributionTaxonomyData;
};

const editableEntryStatuses = new Set(["DRAFT", "CHANGES_REQUESTED"]);
const editableRevisionStatuses = new Set(["DRAFT", "CHANGES_REQUESTED", "REJECTED"]);
type EditorSectionKey = "details" | "images" | "sources" | "video";

function CreateEntryForm({ initialDraftId, revisionMode = false, taxonomy }: CreateEntryFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [draftId, setDraftId] = useState<string | null>(initialDraftId ?? null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [isSyncingMedia, setIsSyncingMedia] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState<EditorSectionKey | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewValues, setPreviewValues] = useState<CreateEntryFormValues>(() =>
    toCreateEntryFormDefaults(),
  );
  const [readinessOpen, setReadinessOpen] = useState(false);
  const [readinessIssues, setReadinessIssues] = useState<ReadinessIssue[]>([]);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const draftQuery = useQuery({
    queryKey: [revisionMode ? "entry-revision" : "entry-draft", initialDraftId],
    queryFn: ({ signal }) =>
      revisionMode
        ? getEntryRevision(initialDraftId as string, signal)
        : getOwnEntry(initialDraftId as string, signal),
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
    setFocus,
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
    revisionMode,
  });
  const { hasPendingImages, imageInputRef, images } = stagedImages;
  const isDraftLoading = Boolean(initialDraftId && draftQuery.isLoading);
  const isDraftUnavailable = Boolean(initialDraftId && draftQuery.isError);
  const effectiveEditorStatus = revisionMode ? initialDraft?.revisionStatus : initialDraft?.status;
  const isDraftLocked = Boolean(
    initialDraft &&
      !(revisionMode ? editableRevisionStatuses : editableEntryStatuses).has(
        effectiveEditorStatus ?? "",
      ),
  );
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
      if (revisionMode) {
        await submitEntryRevision(savedDraft.id);
        setDraftId(savedDraft.id);
      } else {
        const submission = await submitEntryForReview(savedDraft.id);
        setDraftId(submission.entry.id);
      }
      setSaveState("submitted");
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.all });
      toast.success(
        revisionMode ? "تغییرات برای بررسی فرستاده شد." : "مطلب برای بررسی فرستاده شد.",
      );
      router.replace(
        revisionMode ? "/profile?tab=entries" : "/profile?tab=entries&status=PENDING_REVIEW",
      );
    } catch (error) {
      applyApiFieldErrors(error, setError, createEntryFieldNameMap);
      setSaveState("unsaved");
      toast.error(getEntryFormErrorMessage(error));
    }
  }

  function handlePreview() {
    setPreviewValues(getValues());
    setPreviewOpen(true);
  }

  async function handleRequestSubmit() {
    if (!isMobile) {
      await handleSubmitForReview();
      return;
    }

    await form.trigger();
    validateDistrictProvince(form.getValues(), taxonomy.districts, setError);
    setReadinessIssues(getReadinessIssues(form, selectedScope));
    setReadinessOpen(true);
  }

  function handleSelectReadinessIssue(issue: ReadinessIssue) {
    setReadinessOpen(false);

    if (issue.section === "details") {
      setOpenMobileSection("details");
    }

    window.setTimeout(() => {
      if (issue.field === "contentJson") {
        document.querySelector<HTMLElement>("[contenteditable='true']")?.focus();
        document.querySelector<HTMLElement>("[contenteditable='true']")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        return;
      }

      setFocus(issue.field, { shouldSelect: true });
      const fieldId = getEntryFieldId(issue.field);
      if (fieldId) {
        document.getElementById(fieldId)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 240);
  }

  function handleBack() {
    if (hasUnsavedChanges) {
      setLeaveDialogOpen(true);
      return;
    }

    router.push("/explore");
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
        ? await (revisionMode ? updateEntryRevision : updateEntryDraft)(draftId, payload)
        : await createEntryDraft(payload);
      const wasNewDraft = !draftId;

      setDraftId(savedDraft.id);

      if (wasNewDraft) {
        router.replace(`/entries/${savedDraft.id}/edit`);
      }

      const relatedContentSynced = await syncRelatedContent(savedDraft.id, values);

      if (!relatedContentSynced) {
        setSaveState("unsaved");
        return null;
      }

      form.reset(form.getValues());
      setSaveState("saved");

      if (showSuccessToast) {
        toast.success(revisionMode ? "تغییرات ذخیره شد." : "پیش‌نویس ذخیره شد.");
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
      await (revisionMode ? replaceEntryRevisionTags : replaceEntryTags)(entryId, values.tagIds);
      await syncSources(entryId, values);
      await syncYouTubeVideo(entryId, values);
      const imagesSynced = await stagedImages.syncPendingImages(entryId);
      return imagesSynced;
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
          return (revisionMode ? updateEntryRevisionSource : updateEntrySource)(
            entryId,
            id,
            source,
          );
        }

        const createdSource = await (revisionMode ? createEntryRevisionSource : createEntrySource)(
          entryId,
          source,
        );

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
      if (revisionMode && initialDraft?.youtubeVideo) {
        await removeEntryRevisionYouTubeVideo(entryId);
      }
      return;
    }

    await (revisionMode ? upsertEntryRevisionYouTubeVideo : upsertEntryYouTubeVideo)(entryId, {
      url: values.youtubeUrl.trim(),
      title: emptyToUndefined(values.youtubeTitle),
      description: emptyToUndefined(values.youtubeDescription),
    });
  }

  async function handleRemoveSource(index: number) {
    const source = form.getValues(`sources.${index}`);

    if (draftId && source?.id) {
      try {
        await (revisionMode ? deleteEntryRevisionSource : deleteEntrySource)(draftId, source.id);
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
          title={
            revisionMode ? "ویرایش مطلب منتشرشده" : initialDraftId ? "ویرایش مطلب" : "مطلب جدید"
          }
          isBusy={isBusy}
          saveState={saveState}
          saveLabel={revisionMode ? "ذخیره تغییرات" : undefined}
          submitLabel={
            revisionMode
              ? initialDraft?.revisionStatus === "CHANGES_REQUESTED" ||
                initialDraft?.revisionStatus === "REJECTED"
                ? "ارسال دوباره تغییرات"
                : "ارسال تغییرات برای بررسی"
              : initialDraft?.status === "CHANGES_REQUESTED"
                ? "ارسال دوباره برای بررسی"
                : undefined
          }
          onBack={handleBack}
          onPreview={handlePreview}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleRequestSubmit}
        />

        <main className="mx-auto max-w-5xl px-4 pt-5 pb-28 sm:px-6 sm:py-10 lg:px-8">
          {isDraftLoading ? <DraftEditorLoadingState /> : null}
          {isDraftUnavailable ? <DraftEditorErrorState /> : null}
          {isDraftLocked ? <DraftEditorLockedState /> : null}
          {!isDraftLoading && !isDraftUnavailable && !isDraftLocked ? (
            <form className="bg-background px-0 py-6 sm:px-8 lg:px-14" noValidate>
              {((revisionMode &&
                (initialDraft?.revisionStatus === "CHANGES_REQUESTED" ||
                  initialDraft?.revisionStatus === "REJECTED")) ||
                (!revisionMode &&
                  (initialDraft?.status === "CHANGES_REQUESTED" ||
                    initialDraft?.status === "REJECTED"))) &&
              (initialDraft.requestFeedback || initialDraft.latestModerationReview?.comments) ? (
                <div className="mb-8 rounded-xl border border-terracotta/20 bg-terracotta/5 px-4 py-4 text-[14px] leading-7">
                  <p className="font-semibold text-foreground">نظر بررسی‌کننده</p>
                  <p className="mt-1 text-muted-foreground">
                    {initialDraft.requestFeedback ?? initialDraft.latestModerationReview?.comments}
                  </p>
                </div>
              ) : null}
              <CreateEntryWritingSurface
                control={control}
                errors={errors}
                register={register}
                onDirty={markUnsaved}
              />

              <section className="mt-8 divide-y divide-border border-y border-border">
                <CreateEntryEditorSection
                  title="جزئیات مطلب"
                  summary={detailsSummary}
                  open={isMobile ? openMobileSection === "details" : undefined}
                  onOpenChange={
                    isMobile ? (open) => setOpenMobileSection(open ? "details" : null) : undefined
                  }
                >
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
                  open={isMobile ? openMobileSection === "images" : undefined}
                  onOpenChange={
                    isMobile ? (open) => setOpenMobileSection(open ? "images" : null) : undefined
                  }
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
                  open={isMobile ? openMobileSection === "sources" : undefined}
                  onOpenChange={
                    isMobile ? (open) => setOpenMobileSection(open ? "sources" : null) : undefined
                  }
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
                  open={isMobile ? openMobileSection === "video" : undefined}
                  onOpenChange={
                    isMobile ? (open) => setOpenMobileSection(open ? "video" : null) : undefined
                  }
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

        {!isDraftLoading && !isDraftUnavailable && !isDraftLocked ? (
          <MobileEditorSaveAction
            isBusy={isBusy}
            saveState={saveState}
            saveLabel={revisionMode ? "ذخیره تغییرات" : undefined}
            submitLabel={
              revisionMode
                ? "ارسال تغییرات"
                : initialDraft?.status === "CHANGES_REQUESTED"
                  ? "ارسال دوباره"
                  : "ارسال برای بررسی"
            }
            onSaveDraft={handleSaveDraft}
            onSubmit={handleRequestSubmit}
          />
        ) : null}

        <EntryPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          values={previewValues}
          images={images}
          taxonomy={taxonomy}
        />
        <SubmissionReadinessDrawer
          open={readinessOpen}
          onOpenChange={setReadinessOpen}
          issues={readinessIssues}
          isBusy={isBusy}
          submitLabel={
            revisionMode
              ? "ارسال تغییرات برای بررسی"
              : initialDraft?.status === "CHANGES_REQUESTED"
                ? "ارسال دوباره برای بررسی"
                : "ارسال برای بررسی"
          }
          onSelectIssue={handleSelectReadinessIssue}
          onConfirm={async () => {
            setReadinessOpen(false);
            await handleSubmitForReview();
          }}
        />
        <UnsavedEntryDialog
          open={leaveDialogOpen}
          onOpenChange={setLeaveDialogOpen}
          onLeave={() => router.push("/explore")}
        />
      </div>
    </LazyMotion>
  );
}

function getReadinessIssues(
  form: UseFormReturn<CreateEntryFormValues>,
  geographicScope: CreateEntryFormValues["geographicScope"],
): ReadinessIssue[] {
  const candidates: ReadinessIssue[] = [
    { field: "title", label: "عنوان مطلب", section: "writing" },
    { field: "summary", label: "خلاصه مطلب", section: "writing" },
    { field: "contentJson", label: "متن مطلب", section: "writing" },
    { field: "contentTypeId", label: "نوع مطلب", section: "details" },
    { field: "categoryId", label: "موضوع", section: "details" },
    { field: "geographicScope", label: "محدوده جغرافیایی", section: "details" },
  ];

  if (geographicScope === "PROVINCE") {
    candidates.push({ field: "provinceId", label: "ولایت", section: "details" });
    candidates.push({ field: "districtId", label: "ولسوالی انتخاب‌شده", section: "details" });
  }

  return candidates.filter((issue) => Boolean(form.getFieldState(issue.field).error));
}

function getEntryFieldId(field: keyof CreateEntryFormValues) {
  const ids: Partial<Record<keyof CreateEntryFormValues, string>> = {
    title: "entry-title",
    summary: "entry-summary",
    contentTypeId: "content-type",
    categoryId: "category",
    geographicScope: "geographic-scope",
    provinceId: "province",
    districtId: "district",
  };

  return ids[field];
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
