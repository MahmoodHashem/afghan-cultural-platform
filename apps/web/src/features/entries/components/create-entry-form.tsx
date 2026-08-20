"use client";

import {
  ArrowRightIcon,
  ArrowSmallDownIcon,
  ArrowSmallUpIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, domAnimation, LazyMotion, m } from "motion/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Control, UseFormRegister, UseFormSetError } from "react-hook-form";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { applyApiFieldErrors } from "@/features/auth/utils/form-errors";
import type { ContributionTaxonomyData } from "@/features/entries/api/contribution-taxonomy-api";
import {
  createEntryDraft,
  createEntrySource,
  deleteEntryImage,
  deleteEntrySource,
  type EntryDraftPayload,
  type EntryImage,
  type EntrySourceInput,
  type GeographicScope,
  replaceEntryTags,
  submitEntryForReview,
  updateEntryDraft,
  updateEntrySource,
  uploadEntryImage,
  upsertEntryYouTubeVideo,
} from "@/features/entries/api/entry-drafts-api";
import {
  type CreateEntryFormValues,
  createEntryFormSchema,
  geographicScopeLabels,
  SOURCE_TYPE_VALUES,
  sourceTypeLabels,
} from "@/features/entries/schemas/create-entry-schema";
import {
  createEmptyTiptapDocument,
  extractTiptapPlainText,
} from "@/features/entries/utils/tiptap-content";
import { isApiError } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";
import { CreateEntrySelect, type SelectOption, TagMultiSelect } from "./create-entry-select";

const LazyRichTextEditor = dynamic(
  () => import("@/components/common/rich-text-editor").then((module) => module.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4 rounded-xl border border-border bg-background p-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-[52vh] w-full" />
      </div>
    ),
  },
);

type CreateEntryFormProps = {
  taxonomy: ContributionTaxonomyData;
};

type SaveState = "idle" | "saving" | "saved" | "unsaved" | "submitted";

type StagedImage = {
  clientId: string;
  file: File;
  previewUrl: string;
  altText: string;
  caption: string;
  photographerOrSource: string;
  permissionConfirmed: boolean;
  status: "pending" | "uploading" | "uploaded" | "error";
  error?: string;
  uploadedImage?: EntryImage;
};

type WatchedEntryValues = {
  title?: string;
  summary?: string;
  contentJson?: unknown;
  geographicScope?: GeographicScope;
  provinceId?: string;
  categoryId?: string;
  contentTypeId?: string;
};

const fieldNameMap = {
  title: "title",
  summary: "summary",
  contentJson: "contentJson",
  geographicScope: "geographicScope",
  provinceId: "provinceId",
  districtId: "districtId",
  categoryId: "categoryId",
  contentTypeId: "contentTypeId",
  villageOrLocation: "villageOrLocation",
} satisfies Partial<Record<string, keyof CreateEntryFormValues>>;

function CreateEntryForm({ taxonomy }: CreateEntryFormProps) {
  const [draftId, setDraftId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSyncingMedia, setIsSyncingMedia] = useState(false);
  const [images, setImages] = useState<StagedImage[]>([]);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const imagesRef = useRef<StagedImage[]>([]);

  const form = useForm<CreateEntryFormValues>({
    resolver: zodResolver(createEntryFormSchema),
    mode: "onBlur",
    defaultValues: {
      title: "",
      summary: "",
      contentJson: createEmptyTiptapDocument(),
      geographicScope: "PROVINCE",
      provinceId: "",
      districtId: "",
      categoryId: "",
      contentTypeId: "",
      villageOrLocation: "",
      tagIds: [],
      sources: [],
      youtubeUrl: "",
      youtubeTitle: "",
      youtubeDescription: "",
    },
  });

  const {
    control,
    formState: { errors, isDirty },
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
  const hasPendingImages = images.some(
    (image) => image.status === "pending" || image.status === "error",
  );
  const isBusy = saveState === "saving" || isSyncingMedia;
  const hasUnsavedChanges = isDirty || hasPendingImages || saveState === "unsaved";

  const provinceOptions = useMemo(() => toOptions(taxonomy.provinces), [taxonomy.provinces]);
  const categoryOptions = useMemo(() => toOptions(taxonomy.categories), [taxonomy.categories]);
  const contentTypeOptions = useMemo(
    () => toOptions(taxonomy.contentTypes),
    [taxonomy.contentTypes],
  );
  const tagOptions = useMemo(() => toOptions(taxonomy.tags), [taxonomy.tags]);
  const districtOptions = useMemo(
    () =>
      toOptions(
        taxonomy.districts.filter(
          (district) => !selectedProvinceId || district.provinceId === selectedProvinceId,
        ),
      ),
    [selectedProvinceId, taxonomy.districts],
  );

  const readiness = useMemo(() => calculateReadiness(watchedValues), [watchedValues]);
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

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      for (const image of imagesRef.current) {
        URL.revokeObjectURL(image.previewUrl);
      }
    };
  }, []);

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
      toast.success("مطلب برای بررسی فرستاده شد.");
    } catch (error) {
      applyApiFieldErrors(error, setError, fieldNameMap);
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
      return null;
    }

    const payload = toDraftPayload(values);
    setSaveState("saving");

    try {
      const savedDraft = draftId
        ? await updateEntryDraft(draftId, payload)
        : await createEntryDraft(payload);

      setDraftId(savedDraft.id);
      await syncRelatedContent(savedDraft.id, values);
      form.reset(form.getValues());
      setLastSavedAt(new Date());
      setSaveState("saved");

      if (showSuccessToast) {
        toast.success("پیش‌نویس ذخیره شد.");
      }

      return savedDraft;
    } catch (error) {
      applyApiFieldErrors(error, setError, fieldNameMap);
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
      await syncPendingImages(entryId);
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

  async function syncPendingImages(entryId: string) {
    for (const [index, image] of images.entries()) {
      if (image.status === "uploaded" || image.status === "uploading") {
        continue;
      }

      if (!image.altText.trim()) {
        updateImageState(image.clientId, {
          status: "error",
          error: "متن جایگزین تصویر را بنویسید.",
        });
        continue;
      }

      if (!image.permissionConfirmed) {
        updateImageState(image.clientId, {
          status: "error",
          error: "اجازه استفاده از تصویر را تأیید کنید.",
        });
        continue;
      }

      try {
        updateImageState(image.clientId, { status: "uploading", error: undefined });
        const uploadedImage = await uploadEntryImage(entryId, {
          file: image.file,
          altText: image.altText.trim(),
          caption: emptyToUndefined(image.caption),
          photographerOrSource: emptyToUndefined(image.photographerOrSource),
          permissionConfirmed: image.permissionConfirmed,
          displayOrder: index,
        });
        updateImageState(image.clientId, {
          status: "uploaded",
          error: undefined,
          uploadedImage,
        });
      } catch (error) {
        updateImageState(image.clientId, {
          status: "error",
          error: getEntryFormErrorMessage(error),
        });
        toast.error("پیش‌نویس ذخیره شد، اما یک تصویر بارگذاری نشد.");
      }
    }
  }

  function handleImageSelection(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    const remainingSlots = Math.max(0, 6 - images.length);
    const selectedFiles = Array.from(files).slice(0, remainingSlots);

    if (selectedFiles.length < files.length) {
      toast.error("برای هر مطلب حداکثر ۶ تصویر می‌توانید اضافه کنید.");
    }

    const title = form.getValues("title");
    const nextImages = selectedFiles.map((file) => ({
      clientId: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      altText: title ? `تصویر مربوط به ${title}` : "",
      caption: "",
      photographerOrSource: "",
      permissionConfirmed: false,
      status: "pending" as const,
    }));

    setImages((currentImages) => [...currentImages, ...nextImages]);
    setSaveState("unsaved");
  }

  async function handleRemoveImage(image: StagedImage) {
    if (draftId && image.uploadedImage) {
      try {
        await deleteEntryImage(draftId, image.uploadedImage.id);
      } catch (error) {
        toast.error(getEntryFormErrorMessage(error));
        return;
      }
    }

    URL.revokeObjectURL(image.previewUrl);
    setImages((currentImages) =>
      currentImages.filter((currentImage) => currentImage.clientId !== image.clientId),
    );
    setSaveState("unsaved");
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

  function updateImageState(clientId: string, patch: Partial<StagedImage>) {
    setImages((currentImages) =>
      currentImages.map((image) => (image.clientId === clientId ? { ...image, ...patch } : image)),
    );
  }

  function moveImage(clientId: string, direction: "up" | "down") {
    setImages((currentImages) => {
      const currentIndex = currentImages.findIndex((image) => image.clientId === clientId);
      const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= currentImages.length) {
        return currentImages;
      }

      const nextImages = [...currentImages];
      const [image] = nextImages.splice(currentIndex, 1);

      if (!image) {
        return currentImages;
      }

      nextImages.splice(nextIndex, 0, image);

      return nextImages;
    });
    setSaveState("unsaved");
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-background text-foreground">
        <EditorHeader
          readiness={readiness}
          saveState={saveState}
          lastSavedAt={lastSavedAt}
          isBusy={isBusy}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmitForReview}
        />

        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">


          <form className="bg-background px-0 py-6 sm:px-8 lg:px-14" noValidate>
            <section className="space-y-12">
              <div className="space-y-2 border-b border-border pb-3">
                <label htmlFor="entry-title" className="text-small text-muted-foreground ">
                  عنوان مطلب
                </label>
                <FieldError message={errors.title?.message} />
                <Input
                  id="entry-title"
                  placeholder="عنوان خود را بنویسید..."
                  aria-invalid={Boolean(errors.title)}
                  className="h-auto border-0 bg-transparent px-0 py-2 text-right text-4xl leading-tight shadow-none outline-none placeholder:text-muted-foreground/25 focus-visible:ring-0 md:text-4xl  aria-invalid:border-none  aria-invalid:ring-0 rounded-none "
                  {...register("title", {
                    onChange: () => setSaveState("unsaved"),
                  })}
                />

              </div>

              <div className="space-y-2 border-b border-border ">
                <label htmlFor="entry-summary" className="text-small text-muted-foreground">
                  خلاصه
                </label>
                <FieldError message={errors.summary?.message} />
                <Textarea
                  id="entry-summary"
                  placeholder="در چند جمله بگویید این مطلب درباره چیست..."
                  aria-invalid={Boolean(errors.summary)}
                  className="min-h-8 resize-none border-0 bg-transparent px-0 text-xl leading-9 shadow-none placeholder:text-muted-foreground/25 focus-visible:ring-0 aria-invalid:border-none  aria-invalid:ring-0 rounded-none md:text-xl"
                  {...register("summary", {
                    onChange: () => setSaveState("unsaved"),
                  })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-small text-muted-foreground">متن مطلب</h2>
                  </div>
                </div>
                <Controller
                  control={control}
                  name="contentJson"
                  render={({ field }) => (
                    <LazyRichTextEditor
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        setSaveState("unsaved");
                      }}
                      placeholder="متن مطلب را بنویسید..."
                      characterLimit={25_000}
                      toolbarMode="toggle"
                      showCharacterCount={false}
                      className="rounded-none border-0 bg-transparent"
                      editorClassName="min-h-[45vh] rounded-none bg-background px-0 py-0 text-[18px] leading-9 focus-visible:ring-0 placeholder:text-white"
                    />
                  )}
                />
                <FieldError message={getFieldErrorMessage(errors.contentJson)} />
              </div>
            </section>

            <section className="mt-8 divide-y divide-border border-y border-border">
              <EditorSection title="جزئیات مطلب" summary={detailsSummary}>
                <div className="grid gap-5 md:grid-cols-2">
                  <Controller
                    control={control}
                    name="contentTypeId"
                    render={({ field }) => (
                      <CreateEntrySelect
                        id="content-type"
                        label="نوع مطلب"
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSaveState("unsaved");
                        }}
                        options={contentTypeOptions}
                        placeholder="نوع مطلب را انتخاب کنید"
                        error={errors.contentTypeId?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="categoryId"
                    render={({ field }) => (
                      <CreateEntrySelect
                        id="category"
                        label="موضوع"
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSaveState("unsaved");
                        }}
                        options={categoryOptions}
                        placeholder="موضوع را انتخاب کنید"
                        error={errors.categoryId?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="geographicScope"
                    render={({ field }) => (
                      <CreateEntrySelect
                        id="geographic-scope"
                        label="محدوده جغرافیایی"
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value as GeographicScope);
                          setSaveState("unsaved");
                        }}
                        options={Object.entries(geographicScopeLabels).map(([value, label]) => ({
                          value,
                          label,
                        }))}
                        placeholder="محدوده را انتخاب کنید"
                        error={errors.geographicScope?.message}
                      />
                    )}
                  />
                  {selectedScope === "PROVINCE" ? (
                    <>
                      <Controller
                        control={control}
                        name="provinceId"
                        render={({ field }) => (
                          <CreateEntrySelect
                            id="province"
                            label="ولایت"
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSaveState("unsaved");
                            }}
                            options={provinceOptions}
                            placeholder="ولایت را انتخاب کنید"
                            error={errors.provinceId?.message}
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name="districtId"
                        render={({ field }) => (
                          <CreateEntrySelect
                            id="district"
                            label="ولسوالی"
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSaveState("unsaved");
                            }}
                            options={districtOptions}
                            placeholder="در صورت نیاز انتخاب کنید"
                            error={errors.districtId?.message}
                            disabled={!selectedProvinceId || districtOptions.length === 0}
                          />
                        )}
                      />
                    </>
                  ) : null}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="village-or-location"
                      className="text-small font-semibold text-foreground"
                    >
                      نام محل
                    </label>
                    <Input
                      id="village-or-location"
                      placeholder="مثلاً نام قریه، محله یا مکان مشخص"
                      className="mt-2 h-11 border-border"
                      {...register("villageOrLocation", {
                        onChange: () => setSaveState("unsaved"),
                      })}
                    />
                    <FieldError message={errors.villageOrLocation?.message} />
                  </div>
                  <div className="md:col-span-2">
                    <Controller
                      control={control}
                      name="tagIds"
                      render={({ field }) => (
                        <TagMultiSelect
                          label="برچسب‌ها"
                          selectedValues={field.value}
                          options={tagOptions}
                          onChange={(values) => {
                            field.onChange(values);
                            setSaveState("unsaved");
                          }}
                          error={errors.tagIds?.message}
                        />
                      )}
                    />
                  </div>
                </div>
              </EditorSection>

              <EditorSection
                title="تصاویر"
                summary={`${images.length.toLocaleString("fa-AF")} تصویر`}
              >
                <div className="space-y-5">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      handleImageSelection(event.target.files);
                      event.target.value = "";
                    }}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="max-w-xl text-small leading-7 text-muted-foreground">
                      تا ۶ تصویر JPEG، PNG یا WebP می‌توانید اضافه کنید. بارگذاری واقعی بعد از ذخیره
                      پیش‌نویس انجام می‌شود.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={images.length >= 6}
                    >
                      <PhotoIcon aria-hidden="true" />
                      افزودن تصویر
                    </Button>
                  </div>
                  <ImageList
                    images={images}
                    onChange={updateImageState}
                    onMove={moveImage}
                    onRemove={handleRemoveImage}
                  />
                </div>
              </EditorSection>

              <EditorSection
                title="منابع"
                summary={`${sourceFields.fields.length.toLocaleString("fa-AF")} منبع`}
              >
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-small leading-7 text-muted-foreground">
                      اگر منبع مکتوب، شفاهی یا تجربه شخصی دارید، آن را جداگانه ثبت کنید.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        sourceFields.append({
                          type: "WEBSITE",
                          title: "",
                          authorOrProvider: "",
                          publicationDate: "",
                          websiteUrl: "",
                          bookOrArticleDetails: "",
                          interviewDate: "",
                          explanation: "",
                        });
                        setSaveState("unsaved");
                      }}
                    >
                      <PlusIcon aria-hidden="true" />
                      افزودن منبع
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {sourceFields.fields.length > 0 ? (
                      sourceFields.fields.map((field, index) => (
                        <SourceFields
                          key={field.fieldKey}
                          index={index}
                          register={register}
                          control={control}
                          canMoveUp={index > 0}
                          canMoveDown={index < sourceFields.fields.length - 1}
                          onMoveUp={() => {
                            sourceFields.move(index, index - 1);
                            setSaveState("unsaved");
                          }}
                          onMoveDown={() => {
                            sourceFields.move(index, index + 1);
                            setSaveState("unsaved");
                          }}
                          onRemove={() => handleRemoveSource(index)}
                          onDirty={() => setSaveState("unsaved")}
                        />
                      ))
                    ) : (
                      <EmptyRow text="هنوز منبعی اضافه نشده است." />
                    )}
                  </div>
                </div>
              </EditorSection>

              <EditorSection
                title="ویدیوی مرتبط"
                summary={watchedValues.youtubeUrl ? "ویدیو اضافه شده" : "اختیاری"}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label
                      htmlFor="youtube-url"
                      className="text-small font-semibold text-foreground"
                    >
                      نشانی یوتیوب
                    </label>
                    <Input
                      id="youtube-url"
                      dir="ltr"
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="mt-2 h-11 text-left"
                      aria-invalid={Boolean(errors.youtubeUrl)}
                      {...register("youtubeUrl", {
                        onChange: () => setSaveState("unsaved"),
                      })}
                    />
                    <FieldError message={errors.youtubeUrl?.message} />
                  </div>
                  <div>
                    <label
                      htmlFor="youtube-title"
                      className="text-small font-semibold text-foreground"
                    >
                      عنوان ویدیو
                    </label>
                    <Input
                      id="youtube-title"
                      className="mt-2 h-11"
                      {...register("youtubeTitle", {
                        onChange: () => setSaveState("unsaved"),
                      })}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="youtube-description"
                      className="text-small font-semibold text-foreground"
                    >
                      توضیح کوتاه
                    </label>
                    <Input
                      id="youtube-description"
                      className="mt-2 h-11"
                      {...register("youtubeDescription", {
                        onChange: () => setSaveState("unsaved"),
                      })}
                    />
                  </div>
                </div>
              </EditorSection>
            </section>
          </form>
        </main>
      </div>
    </LazyMotion>
  );
}

type EditorHeaderProps = {
  readiness: { completed: number; total: number; ready: boolean };
  saveState: SaveState;
  lastSavedAt: Date | null;
  isBusy: boolean;
  onSaveDraft: () => void;
  onSubmit: () => void;
};

function EditorHeader({
  isBusy,
  onSaveDraft,
  onSubmit,
}: EditorHeaderProps) {

  return (
    <header className="sticky top-5 z-40 border-b border-border bg-card/94 backdrop-blur-md max-w-5xl mx-auto rounded-full">
      <div className="mx-auto flex  flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" render={<Link href="/" />}>
            <ArrowRightIcon aria-hidden="true" />
            <span className="sr-only">بازگشت</span>
          </Button>
          <div>
            <h1 className="text-base font-bold text-foreground">مطلب جدید</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:justify-end">

          <Button type="button" variant="outline" className={"rounded-full"} disabled={isBusy} onClick={onSaveDraft}>
            <CheckCircleIcon aria-hidden="true" />
            {isBusy ? "در حال ذخیره..." : "ذخیره پیش‌نویس"}
          </Button>
          <Button type="button" className={"rounded-full"} disabled={isBusy} onClick={onSubmit}>
            <PaperAirplaneIcon aria-hidden="true" />
            ارسال برای بررسی
          </Button>
        </div>
      </div>
    </header>
  );
}

type EditorSectionProps = {
  title: string;
  summary?: string;
  children: ReactNode;
};

function EditorSection({ title, summary, children }: EditorSectionProps) {
  const [open, setOpen] = useState(false);
  const contentId = `entry-section-${title.replace(/\s+/g, "-")}`;

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 py-5 text-right"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((current) => !current)}
      >
        <span>
          <span className="block font-semibold text-foreground">{title}</span>
          {summary ? (
            <span className="mt-1 block text-small text-muted-foreground">{summary}</span>
          ) : null}
        </span>
        <ChevronDownIcon
          aria-hidden="true"
          className={cn("size-5 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <m.div
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pb-8">{children}</div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

type SourceFieldsProps = {
  index: number;
  register: UseFormRegister<CreateEntryFormValues>;
  control: Control<CreateEntryFormValues>;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onDirty: () => void;
};

function SourceFields({
  index,
  register,
  control,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
  onDirty,
}: SourceFieldsProps) {
  return (
    <div className="rounded-xl border border-border bg-background/50 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-semibold text-foreground">
          منبع {Number(index + 1).toLocaleString("fa-AF")}
        </p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="انتقال منبع به بالا"
            disabled={!canMoveUp}
            onClick={onMoveUp}
          >
            <ArrowSmallUpIcon aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="انتقال منبع به پایین"
            disabled={!canMoveDown}
            onClick={onMoveDown}
          >
            <ArrowSmallDownIcon aria-hidden="true" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            <TrashIcon aria-hidden="true" />
            حذف
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Controller
          control={control}
          name={`sources.${index}.type`}
          render={({ field }) => (
            <CreateEntrySelect
              id={`source-type-${index}`}
              label="نوع منبع"
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                onDirty();
              }}
              options={SOURCE_TYPE_VALUES.map((value) => ({
                value,
                label: sourceTypeLabels[value],
              }))}
              placeholder="نوع منبع"
            />
          )}
        />
        <div>
          <label
            htmlFor={`source-title-${index}`}
            className="text-small font-semibold text-foreground"
          >
            عنوان
          </label>
          <Input
            id={`source-title-${index}`}
            className="mt-2 h-11"
            {...register(`sources.${index}.title`, {
              onChange: onDirty,
            })}
          />
        </div>
        <div>
          <label
            htmlFor={`source-provider-${index}`}
            className="text-small font-semibold text-foreground"
          >
            نویسنده یا نهاد
          </label>
          <Input
            id={`source-provider-${index}`}
            className="mt-2 h-11"
            {...register(`sources.${index}.authorOrProvider`, {
              onChange: onDirty,
            })}
          />
        </div>
        <div>
          <label
            htmlFor={`source-url-${index}`}
            className="text-small font-semibold text-foreground"
          >
            نشانی اینترنتی
          </label>
          <Input
            id={`source-url-${index}`}
            dir="ltr"
            className="mt-2 h-11 text-left"
            {...register(`sources.${index}.websiteUrl`, {
              onChange: onDirty,
            })}
          />
        </div>
        <div>
          <label
            htmlFor={`source-date-${index}`}
            className="text-small font-semibold text-foreground"
          >
            تاریخ نشر
          </label>
          <Input
            id={`source-date-${index}`}
            className="mt-2 h-11"
            {...register(`sources.${index}.publicationDate`, {
              onChange: onDirty,
            })}
          />
        </div>
        <div className="md:col-span-2">
          <label
            htmlFor={`source-details-${index}`}
            className="text-small font-semibold text-foreground"
          >
            توضیح یا جزئیات
          </label>
          <Textarea
            id={`source-details-${index}`}
            className="mt-2 min-h-24"
            {...register(`sources.${index}.explanation`, {
              onChange: onDirty,
            })}
          />
        </div>
      </div>
    </div>
  );
}

type ImageListProps = {
  images: StagedImage[];
  onChange: (clientId: string, patch: Partial<StagedImage>) => void;
  onMove: (clientId: string, direction: "up" | "down") => void;
  onRemove: (image: StagedImage) => void;
};

function ImageList({ images, onChange, onMove, onRemove }: ImageListProps) {
  if (images.length === 0) {
    return <EmptyRow text="هنوز تصویری اضافه نشده است." />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {images.map((image, index) => (
        <div key={image.clientId} className="rounded-xl border border-border bg-background/50 p-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
            <Image
              src={image.previewUrl}
              alt={image.altText || "پیش‌نمایش تصویر انتخاب‌شده"}
              fill
              sizes="(min-width: 768px) 420px, 100vw"
              unoptimized
              className="size-full object-cover"
            />
            <span
              className={cn(
                "absolute right-3 top-3 rounded-full px-2 py-1 text-[11px] font-semibold",
                image.status === "uploaded" && "bg-primary text-primary-foreground",
                image.status === "uploading" && "bg-gold text-foreground",
                image.status === "pending" && "bg-card text-muted-foreground",
                image.status === "error" && "bg-destructive text-destructive-foreground",
              )}
            >
              {getImageStatusLabel(image.status)}
            </span>
          </div>
          <div className="mt-3 space-y-3">
            <Input
              value={image.altText}
              onChange={(event) => onChange(image.clientId, { altText: event.target.value })}
              placeholder="متن جایگزین تصویر *"
              className="h-10"
            />
            <Input
              value={image.caption}
              onChange={(event) => onChange(image.clientId, { caption: event.target.value })}
              placeholder="شرح تصویر"
              className="h-10"
            />
            <Input
              value={image.photographerOrSource}
              onChange={(event) =>
                onChange(image.clientId, { photographerOrSource: event.target.value })
              }
              placeholder="عکاس یا منبع تصویر"
              className="h-10"
            />
            <div className="flex items-start gap-2 text-small text-muted-foreground">
              <Checkbox
                id={`image-permission-${image.clientId}`}
                checked={image.permissionConfirmed}
                onChange={(event) =>
                  onChange(image.clientId, { permissionConfirmed: event.currentTarget.checked })
                }
              />
              <label htmlFor={`image-permission-${image.clientId}`}>
                اجازه استفاده از این تصویر را دارم.
              </label>
            </div>
            {image.error ? <p className="text-small text-destructive">{image.error}</p> : null}
            <div className="flex flex-wrap items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="انتقال تصویر به بالا"
                disabled={index === 0}
                onClick={() => onMove(image.clientId, "up")}
              >
                <ArrowSmallUpIcon aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="انتقال تصویر به پایین"
                disabled={index === images.length - 1}
                onClick={() => onMove(image.clientId, "down")}
              >
                <ArrowSmallDownIcon aria-hidden="true" />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(image)}>
                <TrashIcon aria-hidden="true" />
                حذف تصویر
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}






function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-small text-destructive">{message}</p>;
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-background/50 px-4 py-8 text-center text-small text-muted-foreground">
      {text}
    </div>
  );
}

function toOptions(items: Array<{ id: string; name: string; slug?: string }>): SelectOption[] {
  return items.map((item) => ({
    value: item.id,
    label: item.name,
    description: item.slug,
  }));
}

function toDraftPayload(values: CreateEntryFormValues): EntryDraftPayload {
  const geographicScope = values.geographicScope;

  return {
    title: values.title.trim(),
    summary: values.summary.trim(),
    contentJson: values.contentJson,
    geographicScope,
    provinceId: geographicScope === "PROVINCE" ? emptyToNull(values.provinceId) : null,
    districtId: geographicScope === "PROVINCE" ? emptyToNull(values.districtId) : null,
    categoryId: values.categoryId,
    contentTypeId: values.contentTypeId,
    villageOrLocation: emptyToNull(values.villageOrLocation),
  };
}

function toSourceInput(source: CreateEntryFormValues["sources"][number], index: number) {
  return {
    id: source.id,
    type: source.type,
    title: emptyToUndefined(source.title),
    authorOrProvider: emptyToUndefined(source.authorOrProvider),
    publicationDate: emptyToUndefined(source.publicationDate),
    websiteUrl: normalizeWebsiteUrl(source.websiteUrl),
    bookOrArticleDetails: emptyToUndefined(source.bookOrArticleDetails),
    interviewDate: emptyToUndefined(source.interviewDate),
    explanation: emptyToUndefined(source.explanation),
    displayOrder: index,
  };
}

function isUsefulSource(source: EntrySourceInput & { id?: string }) {
  return Boolean(
    source.id ||
    source.title ||
    source.authorOrProvider ||
    source.publicationDate ||
    source.websiteUrl ||
    source.bookOrArticleDetails ||
    source.interviewDate ||
    source.explanation,
  );
}

function normalizeWebsiteUrl(value: string | undefined) {
  const trimmedValue = emptyToUndefined(value);

  if (!trimmedValue) {
    return undefined;
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}

function emptyToUndefined(value: string | null | undefined) {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : undefined;
}

function emptyToNull(value: string | null | undefined) {
  return emptyToUndefined(value) ?? null;
}

function validateDistrictProvince(
  values: CreateEntryFormValues,
  districts: ContributionTaxonomyData["districts"],
  setError: UseFormSetError<CreateEntryFormValues>,
) {
  if (!values.districtId || !values.provinceId) {
    return true;
  }

  const district = districts.find((item) => item.id === values.districtId);

  if (!district || district.provinceId !== values.provinceId) {
    setError(
      "districtId",
      {
        type: "validate",
        message: "ولسوالی باید مربوط به ولایت انتخاب‌شده باشد.",
      },
      {
        shouldFocus: true,
      },
    );
    toast.error("ولسوالی با ولایت انتخاب‌شده سازگار نیست.");
    return false;
  }

  return true;
}

function calculateReadiness(values: WatchedEntryValues) {
  const checks = [
    Boolean(values.title?.trim()),
    Boolean(values.summary?.trim()),
    Boolean(values.contentJson && extractTiptapPlainText(values.contentJson).length > 0),
    Boolean(values.contentTypeId),
    Boolean(values.categoryId),
    values.geographicScope === "PROVINCE"
      ? Boolean(values.provinceId)
      : Boolean(values.geographicScope),
  ];
  const completed = checks.filter(Boolean).length;

  return {
    completed,
    total: checks.length,
    ready: completed === checks.length,
  };
}

function createMetadataSummary({
  values,
  provinces,
  categories,
  contentTypes,
  tagCount,
}: {
  values: WatchedEntryValues;
  provinces: ContributionTaxonomyData["provinces"];
  categories: ContributionTaxonomyData["categories"];
  contentTypes: ContributionTaxonomyData["contentTypes"];
  tagCount: number;
}) {
  const contentTypeName = contentTypes.find((item) => item.id === values.contentTypeId)?.name;
  const categoryName = categories.find((item) => item.id === values.categoryId)?.name;
  const location =
    values.geographicScope === "PROVINCE"
      ? provinces.find((item) => item.id === values.provinceId)?.name
      : values.geographicScope
        ? geographicScopeLabels[values.geographicScope]
        : undefined;
  const tagSummary = tagCount > 0 ? `${tagCount.toLocaleString("fa-AF")} برچسب` : undefined;

  return (
    [contentTypeName, categoryName, location, tagSummary].filter(Boolean).join(" · ") ||
    "هنوز کامل نشده"
  );
}

function getSaveStatusText(saveState: SaveState, lastSavedAt: Date | null) {
  if (saveState === "saving") {
    return "در حال ذخیره...";
  }

  if (saveState === "submitted") {
    return "برای بررسی فرستاده شد";
  }

  if (saveState === "unsaved") {
    return "تغییرات ذخیره‌نشده";
  }

  if (saveState === "saved") {
    return lastSavedAt
      ? `ذخیره شد، ${lastSavedAt.toLocaleTimeString("fa-AF", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
      : "ذخیره شد";
  }

  return "هنوز ذخیره نشده";
}

function getFieldErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;

    return typeof message === "string" ? message : undefined;
  }

  return undefined;
}

function getImageStatusLabel(status: StagedImage["status"]) {
  if (status === "uploading") {
    return "در حال بارگذاری";
  }

  if (status === "uploaded") {
    return "بارگذاری شد";
  }

  if (status === "error") {
    return "خطا";
  }

  return "آماده بارگذاری";
}

function getEntryFormErrorMessage(error: unknown) {
  if (!isApiError(error)) {
    return "درخواست با خطا روبه‌رو شد.";
  }

  const messages: Record<string, string> = {
    AUTH_EMAIL_VERIFICATION_REQUIRED: "برای افزودن مطلب، ابتدا ایمیل خود را تأیید کنید.",
    AUTH_ACCOUNT_SUSPENDED: "این حساب موقتاً تعلیق شده است.",
    ENTRY_TITLE_REQUIRED: "عنوان مطلب را وارد کنید.",
    ENTRY_TAXONOMY_INVALID: "موضوع، نوع مطلب یا ولایت انتخاب‌شده معتبر نیست.",
    ENTRY_DISTRICT_PROVINCE_MISMATCH: "ولسوالی با ولایت انتخاب‌شده سازگار نیست.",
    ENTRY_CONTENT_INVALID: "متن مطلب معتبر نیست.",
    ENTRY_INVALID_STATUS: "این مطلب در وضعیت قابل ویرایش نیست.",
    ENTRY_SUBMISSION_INCOMPLETE: "برای ارسال، بخش‌های ضروری مطلب را کامل کنید.",
    ENTRY_SUBMISSION_REFERENCE_INVALID: "یکی از پیوندهای داخلی این مطلب معتبر نیست.",
    IMAGE_LIMIT_EXCEEDED: "تعداد تصاویر بیشتر از حد مجاز است.",
    IMAGE_TOO_LARGE: "حجم تصویر بیشتر از حد مجاز است.",
    IMAGE_INVALID_TYPE: "نوع فایل تصویر پشتیبانی نمی‌شود.",
    IMAGE_PERMISSION_REQUIRED: "اجازه استفاده از تصویر را تأیید کنید.",
    YOUTUBE_URL_INVALID: "نشانی یوتیوب معتبر نیست.",
    TOO_MANY_REQUESTS: "تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.",
    NETWORK_ERROR: "ارتباط با سرور برقرار نشد.",
  };

  return messages[error.code] ?? `خطایی رخ داد. شناسه درخواست: ${error.requestId ?? "نامشخص"}`;
}

export { CreateEntryForm };
