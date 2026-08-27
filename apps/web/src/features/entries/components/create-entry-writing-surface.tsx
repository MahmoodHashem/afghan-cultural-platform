"use client";

import dynamic from "next/dynamic";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { CreateEntryFormValues } from "@/features/entries/schemas/create-entry-schema";
import { getFieldErrorMessage } from "@/features/entries/utils/create-entry-form-utils";
import { FieldError } from "./create-entry-editor-layout";

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
  return (
    <section className="space-y-9 md:space-y-12">
      <div className="space-y-2 border-b border-border pb-3">
        <label htmlFor="entry-title" className="text-small text-foreground">
          عنوان مطلب
        </label>
        <FieldError message={errors.title?.message} />
        <Input
          id="entry-title"
          placeholder="عنوان خود را بنویسید..."
          aria-invalid={Boolean(errors.title)}
          className="h-auto rounded-none border-0 bg-transparent px-0 py-2 text-right text-[29px] leading-[1.45] shadow-none outline-none placeholder:text-muted-foreground/25 focus-visible:ring-0 aria-invalid:border-none aria-invalid:ring-0 md:text-4xl"
          {...register("title", {
            onChange: onDirty,
          })}
        />
      </div>

      <div className="space-y-2 border-b border-border">
        <label htmlFor="entry-summary" className="text-small text-foreground">
          خلاصه
        </label>
        <FieldError message={errors.summary?.message} />
        <Textarea
          id="entry-summary"
          placeholder="در چند جمله بگویید این مطلب درباره چیست..."
          aria-invalid={Boolean(errors.summary)}
          className="min-h-20 resize-none rounded-none border-0 bg-transparent px-0 text-[17px] leading-8 shadow-none placeholder:text-muted-foreground/25 focus-visible:ring-0 aria-invalid:border-none aria-invalid:ring-0 md:min-h-8 md:text-xl md:leading-9"
          {...register("summary", {
            onChange: onDirty,
          })}
        />
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
              editorClassName="min-h-[62dvh] rounded-none bg-background px-0 py-0 text-[17px] leading-9 focus-visible:ring-0 placeholder:text-white md:min-h-[45vh] md:text-[18px]"
            />
          )}
        />
        <FieldError message={getFieldErrorMessage(errors.contentJson)} />
      </div>
    </section>
  );
}
