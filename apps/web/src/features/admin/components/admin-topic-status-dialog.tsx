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
import type { AdminTopic } from "@/features/admin/types/admin-topics";

function AdminTopicStatusDialog({
  topic,
  open,
  pending,
  onOpenChange,
  onConfirm,
}: {
  topic: AdminTopic | null;
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const enabling = topic ? !topic.isActive : false;
  return (
    <AlertDialog open={open} onOpenChange={pending ? undefined : onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-xl p-5 sm:max-w-md">
        <AlertDialogHeader className="place-items-start text-start">
          <AlertDialogTitle>{enabling ? "فعال‌کردن موضوع" : "غیرفعال‌کردن موضوع"}</AlertDialogTitle>
          <AlertDialogDescription className="leading-7">
            {enabling
              ? `موضوع «${topic?.name ?? ""}» دوباره در انتخاب‌ها و صفحه‌های عمومی دیده می‌شود.`
              : `موضوع «${topic?.name ?? ""}» از انتخاب‌های جدید و صفحه موضوع‌ها کنار گذاشته می‌شود. مطالب قبلی حذف نخواهند شد.`}
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

export { AdminTopicStatusDialog };
