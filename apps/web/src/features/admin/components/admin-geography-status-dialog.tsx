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

function AdminGeographyStatusDialog({
  item,
  singular,
  open,
  pending,
  onOpenChange,
  onConfirm,
}: {
  item: { name: string; isActive: boolean } | null;
  singular: "ولایت" | "ولسوالی";
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const enabling = item ? !item.isActive : false;
  return (
    <AlertDialog open={open} onOpenChange={pending ? undefined : onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-xl p-5 sm:max-w-md">
        <AlertDialogHeader className="place-items-start text-start">
          <AlertDialogTitle>
            {enabling ? `فعال‌کردن ${singular}` : `غیرفعال‌کردن ${singular}`}
          </AlertDialogTitle>
          <AlertDialogDescription className="leading-7">
            {enabling
              ? `${singular} «${item?.name ?? ""}» دوباره در انتخاب‌ها و صفحه‌های عمومی دیده می‌شود.`
              : `${singular} «${item?.name ?? ""}» از انتخاب‌های جدید و صفحه‌های عمومی کنار گذاشته می‌شود. مطالب قبلی حذف نخواهند شد.`}
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

export { AdminGeographyStatusDialog };
