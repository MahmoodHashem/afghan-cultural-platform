"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type AdminTagFormValues, adminTagSchema } from "@/features/admin/schemas/admin-tag-schema";
import type { AdminTag } from "@/features/admin/types/admin-tags";
import { isApiError } from "@/lib/api/api-error";
import { getPersianFieldErrorMessage } from "@/lib/api/api-field-errors";

const EMPTY_VALUES: AdminTagFormValues = { name: "", isActive: true };

function AdminTagFormSheet({
  tag,
  open,
  pending,
  onOpenChange,
  onSubmit,
}: {
  tag: AdminTag | null;
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AdminTagFormValues) => Promise<void>;
}) {
  const form = useForm<AdminTagFormValues>({
    resolver: zodResolver(adminTagSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) form.reset(tag ? { name: tag.name, isActive: tag.isActive } : EMPTY_VALUES);
  }, [form, open, tag]);

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      if (!isApiError(error)) return;
      for (const fieldError of error.fieldErrors) {
        if (fieldError.field === "name" || fieldError.field === "isActive") {
          form.setError(fieldError.field, {
            type: "server",
            message: getPersianFieldErrorMessage(fieldError),
          });
        }
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={pending ? undefined : onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border px-5 py-5 text-start">
          <DialogTitle className="text-[18px] font-semibold">
            {tag ? "ویرایش برچسب" : "برچسب جدید"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            برچسب‌ها برای پیوند دادن مطالب هم‌موضوع و پیدا کردن دقیق‌تر محتوا استفاده می‌شوند.
          </DialogDescription>
        </DialogHeader>

        <form id="admin-tag-form" onSubmit={submit} className="space-y-5 p-5">
          <div className="space-y-2">
            <Label htmlFor="admin-tag-name">
              نام برچسب <span className="text-destructive">*</span>
            </Label>
            <Input
              id="admin-tag-name"
              {...form.register("name")}
              autoFocus
              disabled={pending}
              aria-invalid={Boolean(form.formState.errors.name)}
              placeholder="برای نمونه: معماری تیموری"
            />
            {form.formState.errors.name && (
              <p className="text-[12px] text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <label
            htmlFor="admin-tag-active"
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3.5"
          >
            <Checkbox
              id="admin-tag-active"
              {...form.register("isActive")}
              disabled={pending}
              className="mt-0.5"
            />
            <span className="space-y-0.5">
              <span className="block text-[13px] font-semibold">برچسب فعال باشد</span>
              <span className="block text-[12px] leading-6 text-muted-foreground">
                برچسب فعال برای مطالب جدید قابل انتخاب است.
              </span>
            </span>
          </label>
        </form>

        <div className="border-t border-border bg-muted/25 sm:justify-start p-4">
          <Button type="submit" form="admin-tag-form" disabled={pending}>
            {pending ? "در حال ذخیره..." : tag ? "ذخیره تغییرات" : "ساخت برچسب"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            انصراف
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { AdminTagFormSheet };
