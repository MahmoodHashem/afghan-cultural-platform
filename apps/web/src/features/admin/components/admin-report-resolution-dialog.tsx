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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  commentReportActions,
  entryReportActions,
} from "@/features/admin/constants/admin-report-meta";
import {
  type AdminReportResolutionValues,
  adminReportResolutionSchema,
} from "@/features/admin/schemas/admin-report-resolution-schema";
import type {
  ReportResolutionAction,
  ReportTargetType,
} from "@/features/moderation/types/content-moderation";
import { reportActionLabels } from "@/features/moderation/utils/content-moderation-labels";

function AdminReportResolutionDialog({
  open,
  targetType,
  action,
  pending,
  onActionChange,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  targetType: ReportTargetType;
  action: ReportResolutionAction;
  pending: boolean;
  onActionChange: (action: ReportResolutionAction) => void;
  onOpenChange: (open: boolean) => void;
  onConfirm: (notes: string) => Promise<void>;
}) {
  const actions = targetType === "COMMENT" ? commentReportActions : entryReportActions;
  const form = useForm<AdminReportResolutionValues>({
    resolver: zodResolver(adminReportResolutionSchema),
    defaultValues: { notes: "" },
  });

  useEffect(() => {
    if (open) form.reset({ notes: "" });
  }, [form, open]);

  const submit = form.handleSubmit(async ({ notes }) => {
    try {
      await onConfirm(notes);
    } catch {
      // The mutation owns controlled error presentation and the reason remains editable.
    }
  });

  return (
    <Dialog open={open} onOpenChange={pending ? undefined : onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg" dir="rtl">
        <DialogHeader className="border-b px-5 py-5 text-start">
          <DialogTitle>ثبت نتیجه گزارش</DialogTitle>
          <DialogDescription>
            تصمیم و دلیل آن در تاریخچه نظارت ثبت می‌شود و پس از ثبت قابل تکرار نیست.
          </DialogDescription>
        </DialogHeader>
        <form id="admin-report-resolution-form" className="space-y-5 p-5" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="admin-report-action">تصمیم</Label>
            <Select
              value={action}
              onValueChange={(value) => value && onActionChange(value as ReportResolutionAction)}
              disabled={pending}
            >
              <SelectTrigger id="admin-report-action" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectGroup>
                  {actions.map((value) => (
                    <SelectItem key={value} value={value}>
                      {reportActionLabels[value]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-report-notes">دلیل تصمیم</Label>
            <Textarea
              id="admin-report-notes"
              rows={5}
              maxLength={1200}
              autoFocus
              aria-invalid={Boolean(form.formState.errors.notes)}
              {...form.register("notes")}
            />
            {form.formState.errors.notes ? (
              <p className="text-[12px] text-destructive" role="alert">
                {form.formState.errors.notes.message}
              </p>
            ) : null}
          </div>
        </form>
        <DialogFooter className="border-t px-5 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            انصراف
          </Button>
          <Button type="submit" form="admin-report-resolution-form" disabled={pending}>
            {pending ? "در حال ثبت..." : "ثبت نتیجه"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { AdminReportResolutionDialog };
