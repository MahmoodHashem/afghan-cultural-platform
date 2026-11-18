"use client";

import dynamic from "next/dynamic";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Controller, useWatch } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  type CreateEntryFormValues,
  SUMMARY_MAX_LENGTH,
  TITLE_MAX_LENGTH,
} from "@/features/entries/schemas/create-entry-schema";
import { getFieldErrorMessage } from "@/features/entries/utils/create-entry-form-utils";
import { formatPersianNumber } from "@/lib/utils/formatters";
import { FieldError } from "./create-entry-editor-layout";

const LazyRichTextEditor = dynamic(
  () => import("@/components/common/rich-text-editor").then((module) => module.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4 rounded-control border border-line-soft bg-paper p-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-[52vh] w-full" />
      </div>
    ),
  },
);

type CreateEntryWritingSurfaceProps = {
  control: Control<CreateEntryFormValues>;
  errors: FieldErrors<CreateEntryFormValues>;
  register: UseFormRegister<CreateEntryFormValues>;
  onDirty: () => void;
};

export function CreateEntryWritingSurface({
  control,
  errors,
  register,
  onDirty,
}: CreateEntryWritingSurfaceProps) {
  const title = useWatch({ control, name: "title" });
  const summary = useWatch({ control, name: "summary" });

  return (
    <section className="space-y-9 md:space-y-12">
      <div className="space-y-2 border-b-2 border-line-soft pb-3 transition-colors focus-within:border-brand">
        <label htmlFor="entry-title" className="text-[12.5px] font-bold text-faint">
          عنوان مطلب
        </label>
        <Input
          id="entry-title"
          maxLength={TITLE_MAX_LENGTH}
          placeholder="عنوان خود را بنویسید..."
          aria-invalid={Boolean(errors.title)}
          className="h-auto rounded-none border-0 bg-transparent px-0 py-2 text-start text-[29px] leading-[1.45] font-bold text-ink shadow-none focus-visible:shadow-none outline-none placeholder:text-faint/45 focus-visible:ring-0 aria-invalid:border-none aria-invalid:ring-0 md:text-4xl"
          {...register("title", {
            onChange: onDirty,
          })}
        />
        <div className="text-end text-[11.5px] text-faint" aria-live="polite">
          {formatPersianNumber(title.length)} از {formatPersianNumber(TITLE_MAX_LENGTH)} حرف
        </div>
        <FieldError message={errors.title?.message} />
      </div>

      <div className="space-y-2 border-b-2 border-line-soft transition-colors focus-within:border-brand">
        <label htmlFor="entry-summary" className="text-[12.5px] font-bold text-faint">
          خلاصه
        </label>
        <Textarea
          id="entry-summary"
          maxLength={SUMMARY_MAX_LENGTH}
          placeholder="در چند جمله بگویید این مطلب درباره چیست..."
          aria-invalid={Boolean(errors.summary)}
          className="min-h-20 resize-none rounded-none border-0 bg-transparent px-0 text-[17px] leading-8 text-copy shadow-none focus-visible:shadow-none placeholder:text-faint/45 focus-visible:ring-0 aria-invalid:border-none aria-invalid:ring-0 md:min-h-8 md:text-xl md:leading-9"
          {...register("summary", {
            onChange: onDirty,
          })}
        />
        <div className="text-end text-[11.5px] text-faint" aria-live="polite">
          {formatPersianNumber(summary.length)} از {formatPersianNumber(SUMMARY_MAX_LENGTH)} حرف
        </div>
        <FieldError message={errors.summary?.message} />
      </div>

      <div className="space-y-2">
        <Controller
          control={control}
          name="contentJson"
          render={({ field }) => (
            <LazyRichTextEditor
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
                onDirty();
              }}
              placeholder="متن مطلب را بنویسید..."
              characterLimit={25_000}
              toolbarMode="responsive"
              showCharacterCount={false}
              className="rounded-none border-0 bg-transparent"
              editorClassName="min-h-[62dvh] rounded-none bg-transparent px-0 py-0 text-[17px] leading-9 focus-visible:ring-0 placeholder:text-white md:min-h-[45vh] md:text-[18px]"
            />
          )}
        />
        <FieldError message={getFieldErrorMessage(errors.contentJson)} />
      </div>
    </section>
  );
}
