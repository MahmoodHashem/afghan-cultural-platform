"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  type AdminTopicFormInput,
  type AdminTopicFormValues,
  adminTopicSchema,
} from "@/features/admin/schemas/admin-topic-schema";
import type { AdminTopic } from "@/features/admin/types/admin-topics";
import { isApiError } from "@/lib/api/api-error";

const EMPTY_VALUES: AdminTopicFormValues = {
  name: "",
  slug: "",
  description: "",
  sortOrder: 0,
  isActive: true,
};

function AdminTopicFormSheet({
  topic,
  open,
  pending,
  onOpenChange,
  onSubmit,
}: {
  topic: AdminTopic | null;
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AdminTopicFormValues) => Promise<void>;
}) {
  const form = useForm<AdminTopicFormInput, unknown, AdminTopicFormValues>({
    resolver: zodResolver(adminTopicSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      topic
        ? {
            name: topic.name,
            slug: topic.slug,
            description: topic.description ?? "",
            sortOrder: topic.sortOrder,
            isActive: topic.isActive,
          }
        : EMPTY_VALUES,
    );
  }, [form, open, topic]);

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      if (!isApiError(error)) return;
      for (const fieldError of error.fieldErrors) {
        if (isTopicField(fieldError.field)) {
          form.setError(fieldError.field, { type: "server", message: fieldError.message });
        }
      }
    }
  });

  return (
    <Sheet open={open} onOpenChange={pending ? undefined : onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-5">
          <SheetTitle className="text-[18px] font-semibold">
            {topic ? "ویرایش موضوع" : "موضوع جدید"}
          </SheetTitle>
          <SheetDescription className="leading-6">
            موضوع‌ها در سایت برای دسته‌بندی مطالب فرهنگی استفاده می‌شوند.
          </SheetDescription>
        </SheetHeader>

        <form
          id="admin-topic-form"
          onSubmit={submit}
          className="flex-1 space-y-5 overflow-y-auto p-5"
        >
          <TopicField label="نام موضوع" error={form.formState.errors.name?.message} required>
            <Input
              {...form.register("name")}
              autoFocus
              aria-invalid={Boolean(form.formState.errors.name)}
              placeholder="برای نمونه: مکان‌های تاریخی"
              disabled={pending}
            />
          </TopicField>

          <TopicField
            label="نشانی لاتین"
            hint="اگر خالی بماند، سرور آن را از نام موضوع می‌سازد."
            error={form.formState.errors.slug?.message}
          >
            <Input
              {...form.register("slug")}
              dir="ltr"
              aria-invalid={Boolean(form.formState.errors.slug)}
              placeholder="historical-places"
              disabled={pending}
            />
          </TopicField>

          <TopicField
            label="توضیح کوتاه"
            hint="این توضیح در صفحه موضوع‌ها به خواننده کمک می‌کند."
            error={form.formState.errors.description?.message}
          >
            <Textarea
              {...form.register("description")}
              aria-invalid={Boolean(form.formState.errors.description)}
              className="min-h-28 resize-none"
              placeholder="یک توضیح روشن و کوتاه درباره این موضوع..."
              disabled={pending}
            />
          </TopicField>

          <TopicField label="ترتیب نمایش" error={form.formState.errors.sortOrder?.message}>
            <Input
              {...form.register("sortOrder")}
              type="number"
              min={0}
              max={1_000_000}
              dir="ltr"
              aria-invalid={Boolean(form.formState.errors.sortOrder)}
              disabled={pending}
            />
          </TopicField>

          <label
            htmlFor="admin-topic-active"
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3.5"
          >
            <Checkbox
              id="admin-topic-active"
              {...form.register("isActive")}
              disabled={pending}
              className="mt-0.5"
            />
            <span className="space-y-0.5">
              <span className="block text-[13px] font-semibold">موضوع فعال باشد</span>
              <span className="block text-[12px] leading-6 text-muted-foreground">
                موضوع‌های فعال در انتخاب‌ها و صفحه‌های عمومی دیده می‌شوند.
              </span>
            </span>
          </label>
        </form>

        <SheetFooter className="border-t border-border bg-muted/25 p-4 sm:flex-row sm:justify-start">
          <Button type="submit" form="admin-topic-form" disabled={pending}>
            {pending ? "در حال ذخیره..." : topic ? "ذخیره تغییرات" : "ساخت موضوع"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            انصراف
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function TopicField({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
      {error ? <p className="text-[12px] leading-5 text-destructive">{error}</p> : null}
      {!error && hint ? (
        <p className="text-[12px] leading-5 text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function isTopicField(field: string): field is keyof AdminTopicFormInput {
  return ["name", "slug", "description", "sortOrder", "isActive"].includes(field);
}

export { AdminTopicFormSheet };
