"use client";

import { useEffect, useState } from "react";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AdminEntryListItem } from "@/features/admin/types/admin-entries";

function AdminEntryLifecycleDialog({
  entry,
  open,
  pending,
  onOpenChange,
  onConfirm,
}: {
  entry: Pick<AdminEntryListItem, "id" | "title" | "status"> | null;
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const restoring = entry?.status === "ARCHIVED";
  useEffect(() => {
    if (!open) setReason("");
  }, [open]);
  return (
    <AlertDialog open={open} onOpenChange={pending ? undefined : onOpenChange}>
      <AlertDialogContent className="max-w-lg rounded-xl p-5 sm:max-w-lg">
        <AlertDialogHeader className="place-items-start text-start">
          <AlertDialogTitle>{restoring ? "بازگردانی مطلب" : "بایگانی مطلب"}</AlertDialogTitle>
          <AlertDialogDescription className="leading-7">
            {restoring
              ? `مطلب «${entry?.title ?? ""}» دوباره در سایت منتشر می‌شود.`
              : `مطلب «${entry?.title ?? ""}» از دسترس عمومی خارج و بایگانی می‌شود.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="admin-entry-lifecycle-reason">دلیل تصمیم</Label>
          <Textarea
            id="admin-entry-lifecycle-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={600}
            disabled={pending}
            className="min-h-28 resize-none"
            placeholder="دلیل این تصمیم را کوتاه و روشن بنویسید..."
          />
          <p className="text-[12px] text-muted-foreground">
            این توضیح در تاریخچه بررسی مطلب ثبت می‌شود.
          </p>
        </div>
        <AlertDialogFooter className="mt-3 sm:justify-start">
          <AlertDialogCancel disabled={pending}>انصراف</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending || reason.trim().length < 3}
            className={
              restoring
                ? undefined
                : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            }
            onClick={(event) => {
              event.preventDefault();
              onConfirm(reason);
            }}
          >
            {pending ? "در حال ثبت..." : restoring ? "بازگردانی" : "بایگانی"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { AdminEntryLifecycleDialog };
