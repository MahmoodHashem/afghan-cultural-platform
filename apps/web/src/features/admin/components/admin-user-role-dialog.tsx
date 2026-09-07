"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type AdminUserRoleReasonValues,
  adminUserRoleReasonSchema,
} from "@/features/admin/schemas/admin-user-role-schema";
import type { AdminUserListItem, AdminUserRole } from "@/features/admin/types/admin-users";

function AdminUserRoleDialog({
  user,
  targetRole,
  open,
  pending,
  onOpenChange,
  onConfirm,
}: {
  user: AdminUserListItem | null;
  targetRole: Extract<AdminUserRole, "USER" | "MODERATOR">;
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => Promise<void>;
}) {
  const isPromotion = targetRole === "MODERATOR";
  const form = useForm<AdminUserRoleReasonValues>({
    resolver: zodResolver(adminUserRoleReasonSchema),
    defaultValues: { reason: "" },
  });

  useEffect(() => {
    if (open) form.reset({ reason: "" });
  }, [form, open]);

  const submit = form.handleSubmit(async ({ reason }) => {
    try {
      await onConfirm(reason);
    } catch {
      // The mutation hook presents the controlled error and the form stays intact.
    }
  });

  return (
    <Dialog open={open} onOpenChange={pending ? undefined : onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg" dir="rtl">
        <DialogHeader className="border-b border-border px-5 py-5 text-start">
          <DialogTitle className="text-[18px] font-semibold">
            {isPromotion ? "افزودن ناظر" : "برداشتن دسترسی ناظر"}
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-7">
            {isPromotion
              ? `${user?.displayName ?? "این کاربر"} به صف‌های بررسی و ابزارهای نظارت دسترسی خواهد داشت.`
              : `${user?.displayName ?? "این ناظر"} به نقش کاربر عادی بازمی‌گردد. سوابق بررسی او حفظ می‌شود.`}
          </DialogDescription>
        </DialogHeader>

        <form id="admin-user-role-form" onSubmit={submit} className="space-y-2 p-5">
          <Label htmlFor="admin-user-role-reason">
            دلیل تغییر نقش <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="admin-user-role-reason"
            {...form.register("reason")}
            autoFocus
            maxLength={600}
            disabled={pending}
            aria-invalid={Boolean(form.formState.errors.reason)}
            aria-describedby="admin-user-role-reason-help admin-user-role-reason-error"
            placeholder="دلیل این تصمیم را کوتاه و روشن بنویسید..."
            className="min-h-28 resize-none"
          />
          <p id="admin-user-role-reason-help" className="text-[12px] text-muted-foreground">
            این توضیح در تاریخچه مدیریتی حساب ثبت می‌شود.
          </p>
          {form.formState.errors.reason ? (
            <p id="admin-user-role-reason-error" className="text-[12px] text-destructive">
              {form.formState.errors.reason.message}
            </p>
          ) : null}
        </form>

        <DialogFooter className="sm:justify-start">
          <Button type="submit" form="admin-user-role-form" disabled={pending}>
            {pending ? "در حال ثبت..." : isPromotion ? "تأیید و افزودن" : "برداشتن دسترسی"}
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

export { AdminUserRoleDialog };
