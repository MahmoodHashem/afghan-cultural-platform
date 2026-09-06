"use client";

import { CameraIcon, TrashIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
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
import type { ProfileOwner } from "@/features/profile/api/profile-api";
import {
  useProfileIdentityMutation,
  useProfileImageDeleteMutation,
  useProfileImageUploadMutation,
} from "@/features/profile/hooks/use-profile-mutations";
import {
  type ProfileIdentityValues,
  profileIdentitySchema,
} from "@/features/profile/schemas/profile-schema";
import { normalizeProfileImage } from "@/features/profile/utils/normalize-profile-image";
import { isApiError } from "@/lib/api/api-error";
import { getPersianFieldErrorMessage } from "@/lib/api/api-field-errors";
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGE_SIZE_MB } from "@/lib/images/image-upload-limits";
import { cn } from "@/lib/utils";
import { formatPersianNumber } from "@/lib/utils/formatters";
import { createUserInitials, getUserAvatarColorClass } from "@/lib/utils/user";

const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function ProfileEditDialog({
  user,
  open,
  onOpenChange,
}: {
  user: ProfileOwner;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isNormalizingImage, setIsNormalizingImage] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const identityMutation = useProfileIdentityMutation();
  const imageUploadMutation = useProfileImageUploadMutation();
  const imageDeleteMutation = useProfileImageDeleteMutation();
  const pending =
    isNormalizingImage ||
    identityMutation.isPending ||
    imageUploadMutation.isPending ||
    imageDeleteMutation.isPending;
  const form = useForm<ProfileIdentityValues>({
    resolver: zodResolver(profileIdentitySchema),
    defaultValues: { displayName: user.displayName },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ displayName: user.displayName });
    setFile(null);
    setFileError(null);
    setIsNormalizingImage(false);
  }, [form, open, user.displayName]);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const submit = form.handleSubmit(async (values) => {
    try {
      if (file) {
        await imageUploadMutation.mutateAsync(file);
      }

      if (values.displayName.trim() !== user.displayName) {
        await identityMutation.mutateAsync({ displayName: values.displayName });
      }

      onOpenChange(false);
    } catch (error) {
      if (isApiError(error)) {
        const displayNameError = error.fieldErrors.find((item) => item.field === "displayName");
        if (displayNameError) {
          form.setError("displayName", {
            type: "server",
            message: getPersianFieldErrorMessage(displayNameError),
          });
        }
      }
    }
  });
  const shownImage = previewUrl ?? user.profileImageUrl;

  return (
    <>
      <Dialog open={open} onOpenChange={pending ? undefined : onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ویرایش پروفایل</DialogTitle>
            <DialogDescription>نام و تصویر نمایشی حساب خود را تغییر دهید.</DialogDescription>
          </DialogHeader>

          <form id="profile-edit-form" onSubmit={submit} className="space-y-5">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="size-24 border-4 border-card bg-primary-light shadow-sm">
                {shownImage ? <AvatarImage src={shownImage} alt="" /> : null}
                <AvatarFallback
                  className={cn("text-[22px] font-bold", getUserAvatarColorClass(user.id))}
                >
                  {createUserInitials(form.watch("displayName") || user.displayName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-wrap justify-center gap-2">
                <label
                  htmlFor="profile-image-input"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "cursor-pointer",
                    pending && "pointer-events-none opacity-60",
                  )}
                >
                  <CameraIcon className="size-4" aria-hidden="true" />
                  {isNormalizingImage
                    ? "در حال آماده‌سازی..."
                    : user.profileImageUrl
                      ? "تغییر تصویر"
                      : "انتخاب تصویر"}
                </label>
                <input
                  id="profile-image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={pending}
                  onChange={async (event) => {
                    const nextFile = event.target.files?.[0] ?? null;
                    event.target.value = "";

                    if (nextFile && !ACCEPTED_IMAGE_TYPES.has(nextFile.type)) {
                      setFile(null);
                      setFileError("فقط تصویر JPEG، PNG یا WebP انتخاب کنید.");
                      return;
                    }

                    if (nextFile && nextFile.size > MAX_IMAGE_SIZE_BYTES) {
                      setFile(null);
                      setFileError(
                        `حجم تصویر نباید بیشتر از ${formatPersianNumber(MAX_IMAGE_SIZE_MB)} مگابایت باشد.`,
                      );
                      return;
                    }

                    if (!nextFile) {
                      return;
                    }

                    setIsNormalizingImage(true);
                    setFileError(null);

                    try {
                      setFile(await normalizeProfileImage(nextFile));
                    } catch {
                      setFile(null);
                      setFileError("آماده‌سازی این تصویر انجام نشد. تصویر دیگری انتخاب کنید.");
                    } finally {
                      setIsNormalizingImage(false);
                    }
                  }}
                />
                {user.profileImageUrl && !file ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <TrashIcon className="size-4" aria-hidden="true" />
                    حذف تصویر
                  </Button>
                ) : null}
              </div>
              <p className="text-center text-[12px] text-muted-foreground">
                JPEG، PNG یا WebP تا {formatPersianNumber(MAX_IMAGE_SIZE_MB)} مگابایت؛ تصویر پیش از
                بارگذاری به اندازه مناسب تبدیل می‌شود.
              </p>
              {isNormalizingImage ? (
                <p className="text-[12px] text-primary" role="status">
                  در حال آماده‌سازی تصویر...
                </p>
              ) : null}
              {fileError ? <p className="text-[12px] text-destructive">{fileError}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-display-name">نام نمایشی</Label>
              <Input
                id="profile-display-name"
                autoComplete="name"
                disabled={pending}
                aria-invalid={Boolean(form.formState.errors.displayName)}
                aria-describedby={
                  form.formState.errors.displayName ? "profile-display-name-error" : undefined
                }
                {...form.register("displayName")}
              />
              {form.formState.errors.displayName ? (
                <p id="profile-display-name-error" className="text-[12px] text-destructive">
                  {form.formState.errors.displayName.message}
                </p>
              ) : null}
            </div>
          </form>

          <DialogFooter className="sm:justify-start">
            <Button type="submit" form="profile-edit-form" disabled={pending || Boolean(fileError)}>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="text-start">
            <AlertDialogTitle>تصویر پروفایل حذف شود؟</AlertDialogTitle>
            <AlertDialogDescription>
              پس از حذف، حروف اول نام شما به‌جای تصویر نمایش داده می‌شود.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={imageDeleteMutation.isPending}>انصراف</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={imageDeleteMutation.isPending}
              onClick={async (event) => {
                event.preventDefault();
                try {
                  await imageDeleteMutation.mutateAsync();
                  setIsDeleteDialogOpen(false);
                } catch {
                  // The mutation owns the controlled Persian error message.
                }
              }}
            >
              {imageDeleteMutation.isPending ? "در حال حذف..." : "حذف تصویر"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { ProfileEditDialog };
