"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
  type AdminProvinceFormInput,
  type AdminProvinceFormValues,
  adminProvinceSchema,
} from "@/features/admin/schemas/admin-geography-schema";
import type { AdminProvinceDetail } from "@/features/admin/types/admin-provinces";
import { isApiError } from "@/lib/api/api-error";

function AdminProvinceFormSheet({
  province,
  open,
  pending,
  onOpenChange,
  onSubmit,
}: {
  province: AdminProvinceDetail;
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AdminProvinceFormValues) => Promise<void>;
}) {
  const form = useForm<AdminProvinceFormInput, unknown, AdminProvinceFormValues>({
    resolver: zodResolver(adminProvinceSchema),
    defaultValues: {
      name: province.name,
      description: province.description ?? "",
      sortOrder: province.sortOrder,
      isActive: province.isActive,
    },
  });

  useEffect(() => {
    if (open)
      form.reset({
        name: province.name,
        description: province.description ?? "",
        sortOrder: province.sortOrder,
        isActive: province.isActive,
      });
  }, [form, open, province]);

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      if (!isApiError(error)) return;
      for (const fieldError of error.fieldErrors) {
        if (["name", "description", "sortOrder", "isActive"].includes(fieldError.field)) {
          form.setError(fieldError.field as keyof AdminProvinceFormInput, {
            type: "server",
            message: fieldError.message,
          });
        }
      }
    }
  });

  return (
    <Sheet open={open} onOpenChange={pending ? undefined : onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-5">
          <SheetTitle>ویرایش ولایت</SheetTitle>
          <SheetDescription>اطلاعات عمومی و ترتیب نمایش ولایت را ویرایش کنید.</SheetDescription>
        </SheetHeader>
        <form
          id="admin-province-form"
          onSubmit={submit}
          className="flex-1 space-y-5 overflow-y-auto p-5"
        >
          <Field label="نام ولایت" error={form.formState.errors.name?.message}>
            <Input
              {...form.register("name")}
              autoFocus
              aria-invalid={Boolean(form.formState.errors.name)}
              disabled={pending}
            />
          </Field>
          <Field label="توضیح کوتاه" error={form.formState.errors.description?.message}>
            <Textarea
              {...form.register("description")}
              className="min-h-36 resize-none"
              aria-invalid={Boolean(form.formState.errors.description)}
              disabled={pending}
              placeholder="معرفی کوتاه و روشن این ولایت..."
            />
          </Field>
          <Field label="ترتیب نمایش" error={form.formState.errors.sortOrder?.message}>
            <Input
              {...form.register("sortOrder")}
              type="number"
              min={0}
              max={1_000_000}
              dir="ltr"
              disabled={pending}
            />
          </Field>
          <label
            htmlFor="admin-province-active"
            className="flex cursor-pointer items-start gap-3 rounded-lg border p-3.5"
          >
            <Checkbox
              id="admin-province-active"
              {...form.register("isActive")}
              disabled={pending}
              className="mt-0.5"
            />
            <span>
              <span className="block text-[13px] font-semibold">ولایت فعال باشد</span>
              <span className="text-[12px] leading-6 text-muted-foreground">
                ولایت فعال در انتخاب‌ها و صفحه‌های عمومی دیده می‌شود.
              </span>
            </span>
          </label>
        </form>
        <SheetFooter className="border-t bg-muted/25 p-4 sm:flex-row sm:justify-start">
          <Button type="submit" form="admin-province-form" disabled={pending}>
            {pending ? "در حال ذخیره..." : "ذخیره تغییرات"}
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

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-[12px] text-destructive">{error}</p> : null}
    </div>
  );
}

export { AdminProvinceFormSheet };
