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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type AdminDistrictFormInput,
  type AdminDistrictFormValues,
  adminDistrictSchema,
} from "@/features/admin/schemas/admin-geography-schema";
import type { AdminDistrict } from "@/features/admin/types/admin-provinces";
import { isApiError } from "@/lib/api/api-error";
import { getPersianFieldErrorMessage } from "@/lib/api/api-field-errors";

const EMPTY_VALUES: AdminDistrictFormValues = { name: "", sortOrder: 0, isActive: true };

function AdminDistrictFormDialog({
  district,
  open,
  pending,
  onOpenChange,
  onSubmit,
}: {
  district: AdminDistrict | null;
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AdminDistrictFormValues) => Promise<void>;
}) {
  const form = useForm<AdminDistrictFormInput, unknown, AdminDistrictFormValues>({
    resolver: zodResolver(adminDistrictSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      district
        ? { name: district.name, sortOrder: district.sortOrder, isActive: district.isActive }
        : EMPTY_VALUES,
    );
  }, [district, form, open]);

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      if (!isApiError(error)) return;
      for (const fieldError of error.fieldErrors) {
        if (["name", "sortOrder", "isActive"].includes(fieldError.field)) {
          form.setError(fieldError.field as keyof AdminDistrictFormInput, {
            type: "server",
            message: getPersianFieldErrorMessage(fieldError),
          });
        }
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={pending ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{district ? "ویرایش ولسوالی" : "افزودن ولسوالی"}</DialogTitle>
          <DialogDescription>
            نام و ترتیب نمایش ولسوالی را ثبت کنید. نشانی به‌صورت خودکار ساخته می‌شود.
          </DialogDescription>
        </DialogHeader>
        <form id="admin-district-form" onSubmit={submit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="district-name">نام ولسوالی</Label>
            <Input
              id="district-name"
              {...form.register("name")}
              autoFocus
              disabled={pending}
              aria-invalid={Boolean(form.formState.errors.name)}
            />
            {form.formState.errors.name ? (
              <p className="text-[12px] text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="district-sort-order">ترتیب نمایش</Label>
            <Input
              id="district-sort-order"
              {...form.register("sortOrder")}
              type="number"
              min={0}
              max={1_000_000}
              dir="ltr"
              disabled={pending}
            />
          </div>
          <label
            htmlFor="district-active"
            className="flex cursor-pointer items-center gap-3 rounded-lg border p-3"
          >
            <Checkbox id="district-active" {...form.register("isActive")} disabled={pending} />
            <span className="text-[13px] font-medium">ولسوالی فعال باشد</span>
          </label>
        </form>
        <DialogFooter className="sm:justify-start">
          <Button type="submit" form="admin-district-form" disabled={pending}>
            {pending ? "در حال ذخیره..." : district ? "ذخیره تغییرات" : "افزودن ولسوالی"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            انصراف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { AdminDistrictFormDialog };
