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

type CommentDeleteDialogProps = {
  open: boolean;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
};

function CommentDeleteDialog({
  open,
  isDeleting,
  onOpenChange,
  onConfirm,
}: CommentDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-xl border-border bg-card">
        <AlertDialogHeader className="place-items-start text-start">
          <AlertDialogTitle>دیدگاه حذف شود؟</AlertDialogTitle>
          <AlertDialogDescription className="leading-7">
            اگر دیدگاه پاسخی داشته باشد، جای آن برای پیوستگی گفتگو باقی می‌ماند اما متن و نام شما
            نمایش داده نمی‌شود.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-start">
          <AlertDialogCancel disabled={isDeleting}>انصراف</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? "در حال حذف..." : "حذف دیدگاه"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { CommentDeleteDialog };
