"use client";

import {
  ArrowSmallDownIcon,
  ArrowSmallUpIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { type DragEvent, type RefObject, useRef, useState } from "react";
import type { Control, FieldErrors, UseFieldArrayReturn, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";

import { PersianDatePicker } from "@/components/common/persian-date-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { GeographicScope } from "@/features/entries/api/entry-drafts-api";
import {
  type CreateEntryFormValues,
  geographicScopeLabels,
  SOURCE_TYPE_VALUES,
  sourceTypeLabels,
} from "@/features/entries/schemas/create-entry-schema";
import type { StagedImage } from "@/features/entries/types/create-entry-form";
import { cn } from "@/lib/utils";
import { formatPersianNumber } from "@/lib/utils/formatters";
import { EmptyRow, FieldError } from "./create-entry-editor-layout";
import { CreateEntrySelect, type SelectOption, TagMultiSelect } from "./create-entry-select";

type DetailsSectionProps = {
  categoryOptions: SelectOption[];
  contentTypeOptions: SelectOption[];
  control: Control<CreateEntryFormValues>;
  districtOptions: SelectOption[];
  errors: FieldErrors<CreateEntryFormValues>;
  provinceOptions: SelectOption[];
  register: UseFormRegister<CreateEntryFormValues>;
  selectedProvinceId?: string;
  selectedScope: GeographicScope;
  tagOptions: SelectOption[];
  onDirty: () => void;
};

export function DetailsSection({
  categoryOptions,
  contentTypeOptions,
  control,
  districtOptions,
  errors,
  provinceOptions,
  register,
  selectedProvinceId,
  selectedScope,
  tagOptions,
  onDirty,
}: DetailsSectionProps) {
  return (
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
              onDirty();
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
              onDirty();
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
              onDirty();
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
                  onDirty();
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
                  onDirty();
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
        <label htmlFor="village-or-location" className="text-small font-semibold text-foreground">
          نام محل
        </label>
        <Input
          id="village-or-location"
          placeholder="مثلاً نام قریه، محله یا مکان مشخص"
          className="mt-2 h-11 border-border"
          {...register("villageOrLocation", {
            onChange: onDirty,
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
                onDirty();
              }}
              error={errors.tagIds?.message}
            />
          )}
        />
      </div>
    </div>
  );
}

type ImagesSectionProps = {
  imageInputRef: RefObject<HTMLInputElement | null>;
  images: StagedImage[];
  onAddImages: (files: FileList | null) => void;
  onChangeImage: (clientId: string, patch: Partial<StagedImage>) => void;
  onMoveImage: (clientId: string, direction: "up" | "down") => void;
  onRemoveImage: (image: StagedImage) => void;
};

export function ImagesSection({
  imageInputRef,
  images,
  onAddImages,
  onChangeImage,
  onMoveImage,
  onRemoveImage,
}: ImagesSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragDepthRef = useRef(0);
  const isImageLimitReached = images.length >= 6;

  function handleDragEnter(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();

    if (isImageLimitReached) {
      return;
    }

    dragDepthRef.current += 1;
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);

    if (dragDepthRef.current === 0) {
      setIsDragging(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDragging(false);

    if (!isImageLimitReached) {
      onAddImages(event.dataTransfer.files);
    }
  }

  return (
    <div className="space-y-5">
      <input
        ref={imageInputRef}
        id="entry-images"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(event) => {
          onAddImages(event.target.files);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => imageInputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={isImageLimitReached}
        className={cn(
          "flex min-h-44 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-background/40 px-6 py-8 text-center transition-colors hover:border-primary/40 hover:bg-primary/[0.03] focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
          isDragging && "border-primary bg-primary/5",
        )}
        aria-label="انتخاب یا رها کردن تصاویر مطلب"
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <PhotoIcon className="size-6" aria-hidden="true" />
        </span>
        <span className="font-semibold text-foreground">
          {isDragging ? "تصویرها را اینجا رها کنید" : "تصویرها را بکشید و اینجا رها کنید"}
        </span>
        <span className="text-small text-muted-foreground">
          یا برای انتخاب تصویر کلیک کنید
        </span>
        <span className="text-[12px] leading-6 text-muted-foreground">
          حداکثر ۶ تصویر JPEG، PNG یا WebP؛ بارگذاری پس از ذخیره پیش‌نویس انجام می‌شود.
        </span>
      </button>
      <ImageList
        images={images}
        onChange={onChangeImage}
        onMove={onMoveImage}
        onRemove={onRemoveImage}
      />
    </div>
  );
}

type SourcesSectionProps = {
  control: Control<CreateEntryFormValues>;
  register: UseFormRegister<CreateEntryFormValues>;
  sourceFields: UseFieldArrayReturn<CreateEntryFormValues, "sources", "fieldKey">;
  onDirty: () => void;
  onRemoveSource: (index: number) => void;
};

export function SourcesSection({
  control,
  register,
  sourceFields,
  onDirty,
  onRemoveSource,
}: SourcesSectionProps) {
  return (
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
            onDirty();
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
                onDirty();
              }}
              onMoveDown={() => {
                sourceFields.move(index, index + 1);
                onDirty();
              }}
              onRemove={() => onRemoveSource(index)}
              onDirty={onDirty}
            />
          ))
        ) : (
          <EmptyRow text="هنوز منبعی اضافه نشده است." />
        )}
      </div>
    </div>
  );
}

type YouTubeSectionProps = {
  errors: FieldErrors<CreateEntryFormValues>;
  register: UseFormRegister<CreateEntryFormValues>;
  onDirty: () => void;
};

export function YouTubeSection({ errors, register, onDirty }: YouTubeSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <label htmlFor="youtube-url" className="text-small font-semibold text-foreground">
          نشانی یوتیوب
        </label>
        <Input
          id="youtube-url"
          dir="ltr"
          placeholder="https://www.youtube.com/watch?v=..."
          className="mt-2 h-11 text-left"
          aria-invalid={Boolean(errors.youtubeUrl)}
          {...register("youtubeUrl", {
            onChange: onDirty,
          })}
        />
        <FieldError message={errors.youtubeUrl?.message} />
      </div>
      <div>
        <label htmlFor="youtube-title" className="text-small font-semibold text-foreground">
          عنوان ویدیو
        </label>
        <Input
          id="youtube-title"
          className="mt-2 h-11"
          {...register("youtubeTitle", {
            onChange: onDirty,
          })}
        />
      </div>
      <div>
        <label htmlFor="youtube-description" className="text-small font-semibold text-foreground">
          توضیح کوتاه
        </label>
        <Input
          id="youtube-description"
          className="mt-2 h-11"
          {...register("youtubeDescription", {
            onChange: onDirty,
          })}
        />
      </div>
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
        <p className="font-semibold text-foreground">منبع {formatPersianNumber(index + 1)}</p>
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
          <Controller
            control={control}
            name={`sources.${index}.publicationDate`}
            render={({ field }) => (
              <PersianDatePicker
                id={`source-date-${index}`}
                value={field.value}
                onBlur={field.onBlur}
                onValueChange={(value) => {
                  field.onChange(value);
                  onDirty();
                }}
                className="mt-2"
              />
            )}
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
