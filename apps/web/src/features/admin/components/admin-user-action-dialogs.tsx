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
import type {
  AdminUserListItem,
  UpdateAdminUserStatusInput,
} from "@/features/admin/types/admin-users";

function AdminUserStatusDialog({
  user,
  open,
  pending,
  onOpenChange,
  onConfirm,
}: {
  user: AdminUserListItem | null;
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (input: UpdateAdminUserStatusInput) => void;
}) {
  const [reason, setReason] = useState("");
  const isSuspending = user?.status === "ACTIVE";

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  return (
    <AlertDialog open={open} onOpenChange={pending ? undefined : onOpenChange}>
      <AlertDialogContent className="max-w-lg rounded-xl p-5 sm:max-w-lg">
        <AlertDialogHeader className="place-items-start text-start">
          <AlertDialogTitle className="text-[18px]">
            {isSuspending ? "تعلیق حساب" : "فعال‌سازی دوباره حساب"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[13px] leading-7">
            {isSuspending
              ? `با تعلیق حساب ${user?.displayName ?? "این کاربر"}، همه نشست‌های فعال او نیز پایان می‌یابد.`
              : `حساب ${user?.displayName ?? "این کاربر"} دوباره فعال می‌شود و می‌تواند وارد سایت شود.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isSuspending ? (
          <div className="space-y-2 py-2">
            <Label htmlFor="admin-suspension-reason">دلیل تعلیق</Label>
            <Textarea
              id="admin-suspension-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="دلیل این تصمیم را کوتاه و روشن بنویسید..."
              maxLength={600}
              disabled={pending}
              className="min-h-28 resize-none"
            />
            <p className="text-[12px] text-muted-foreground">
              این توضیح در تاریخچه مدیریتی حساب ثبت می‌شود.
            </p>
          </div>
        ) : null}

        <AlertDialogFooter className="mt-3 sm:justify-start">
          <AlertDialogCancel disabled={pending}>انصراف</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending || (isSuspending && reason.trim().length < 3)}
            className={
              isSuspending
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : undefined
            }
            onClick={(event) => {
              event.preventDefault();
              onConfirm({
                status: isSuspending ? "SUSPENDED" : "ACTIVE",
                reason: isSuspending ? reason : undefined,
              });
            }}
          >
            {pending ? "در حال ثبت..." : isSuspending ? "تعلیق حساب" : "فعال‌سازی حساب"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AdminRevokeSessionsDialog({
  user,
  open,
  pending,
  onOpenChange,
  onConfirm,
}: {
  user: AdminUserListItem | null;
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={pending ? undefined : onOpenChange}>
      <AlertDialogContent className="max-w-lg rounded-xl p-5 sm:max-w-lg">
        <AlertDialogHeader className="place-items-start text-start">
          <AlertDialogTitle className="text-[18px]">پایان همه نشست‌ها</AlertDialogTitle>
          <AlertDialogDescription className="text-[13px] leading-7">
            همه دستگاه‌های متصل به حساب {user?.displayName ?? "این کاربر"} خارج می‌شوند. نشست یا رمز
            امنیتی در این صفحه نمایش داده نمی‌شود.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-3 sm:justify-start">
          <AlertDialogCancel disabled={pending}>انصراف</AlertDialogCancel>
          <AlertDialogAction disabled={pending} onClick={onConfirm}>
            {pending ? "در حال انجام..." : "پایان نشست‌ها"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { AdminRevokeSessionsDialog, AdminUserStatusDialog };
