"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
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
  type AdminProvinceImageValues,
  adminProvinceImageSchema,
} from "@/features/admin/schemas/admin-geography-schema";
import type { AdminProvinceImage } from "@/features/admin/types/admin-provinces";
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGE_SIZE_MB } from "@/lib/images/image-upload-limits";
import { formatPersianNumber } from "@/lib/utils/formatters";

function AdminProvinceImageDialog({
  image,
  open,
  pending,
  onOpenChange,
  onSubmit,
}: {
  image: AdminProvinceImage | null;
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: { file: File | null; altText: string }) => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const form = useForm<AdminProvinceImageValues>({
    resolver: zodResolver(adminProvinceImageSchema),
    defaultValues: { altText: image?.altText ?? "" },
  });

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setFileError(null);
    form.reset({ altText: image?.altText ?? "" });
  }, [form, image, open]);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const submit = form.handleSubmit(async (values) => {
    if (!image && !file) {
      setFileError("یک تصویر انتخاب کنید.");
      return;
    }
    await onSubmit({ file, altText: values.altText });
    onOpenChange(false);
  });
  const shownImage = previewUrl ?? image?.secureUrl ?? null;

  return (
    <Dialog open={open} onOpenChange={pending ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{image ? "ویرایش تصویر ولایت" : "افزودن تصویر ولایت"}</DialogTitle>
          <DialogDescription>
            تصویر JPEG، PNG یا WebP تا {formatPersianNumber(MAX_IMAGE_SIZE_MB)} مگابایت انتخاب کنید.
          </DialogDescription>
        </DialogHeader>
        <form id="admin-province-image-form" onSubmit={submit} className="space-y-4">
          {shownImage ? (
            <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-muted">
              <Image
                src={shownImage}
                alt="پیش‌نمایش تصویر ولایت"
                fill
                sizes="480px"
                className="object-cover"
                unoptimized={Boolean(previewUrl)}
              />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="province-image">{image ? "تصویر جایگزین" : "تصویر"}</Label>
            <Input
              id="province-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={pending}
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;
                if (nextFile && nextFile.size > MAX_IMAGE_SIZE_BYTES) {
                  setFile(null);
                  setFileError(
                    `حجم تصویر بیشتر از ${formatPersianNumber(MAX_IMAGE_SIZE_MB)} مگابایت است.`,
                  );
                  event.target.value = "";
                  return;
                }
                setFile(nextFile);
                setFileError(null);
              }}
            />
            {fileError ? <p className="text-[12px] text-destructive">{fileError}</p> : null}
            {image ? (
              <p className="text-[12px] text-muted-foreground">
                اگر فایل تازه‌ای انتخاب نکنید، تنها متن جایگزین تغییر می‌کند.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="province-image-alt">متن جایگزین تصویر</Label>
            <Input
              id="province-image-alt"
              {...form.register("altText")}
              disabled={pending}
              aria-invalid={Boolean(form.formState.errors.altText)}
              placeholder="مثلاً نمایی از ولایت هرات"
            />
            {form.formState.errors.altText ? (
              <p className="text-[12px] text-destructive">
                {form.formState.errors.altText.message}
              </p>
            ) : null}
          </div>
        </form>
        <DialogFooter className="sm:justify-start">
          <Button type="submit" form="admin-province-image-form" disabled={pending}>
            {pending ? "در حال ذخیره..." : "ذخیره تصویر"}
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

export { AdminProvinceImageDialog };
