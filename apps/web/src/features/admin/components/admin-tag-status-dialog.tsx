"use client";

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
import type { AdminTag } from "@/features/admin/types/admin-tags";

function AdminTagStatusDialog({
  tag,
  open,
  pending,
  onOpenChange,
  onConfirm,
}: {
  tag: AdminTag | null;
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const enabling = tag ? !tag.isActive : false;
  return (
    <AlertDialog open={open} onOpenChange={pending ? undefined : onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-xl p-5 sm:max-w-md">
        <AlertDialogHeader className="place-items-start text-start">
          <AlertDialogTitle>{enabling ? "فعال‌کردن برچسب" : "غیرفعال‌کردن برچسب"}</AlertDialogTitle>
          <AlertDialogDescription className="leading-7">
            {enabling
              ? `برچسب «${tag?.name ?? ""}» دوباره برای مطالب جدید قابل انتخاب می‌شود.`
              : `برچسب «${tag?.name ?? ""}» از انتخاب‌های جدید کنار گذاشته می‌شود. برچسب مطالب قبلی حذف نخواهد شد.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-3 sm:justify-start">
          <AlertDialogCancel disabled={pending}>انصراف</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            className={
              enabling
                ? undefined
                : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            }
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {pending ? "در حال ثبت..." : enabling ? "فعال‌کردن" : "غیرفعال‌کردن"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { AdminTagStatusDialog };
