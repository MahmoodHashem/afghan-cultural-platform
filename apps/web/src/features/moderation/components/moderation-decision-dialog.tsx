"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type ModerationReasonValues,
  moderationReasonSchema,
} from "@/features/moderation/schemas/moderation-decision-schema";
import type { ModerationDecision } from "@/features/moderation/types/moderation";

type ModerationDecisionDialogProps = {
  decision: ModerationDecision | null;
  entryTitle: string;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => Promise<void>;
};

const decisionCopy = {
  APPROVE: {
    title: "این مطلب تأیید شود؟",
    description: "پس از تأیید، مطلب بی‌درنگ در سایت منتشر می‌شود.",
    action: "تأیید و انتشار",
  },
  REQUEST_CHANGES: {
    title: "چه چیزی باید اصلاح شود؟",
    description: "نظر شما برای نویسنده نمایش داده می‌شود تا همین مطلب را اصلاح و دوباره بفرستد.",
    action: "فرستادن برای اصلاح",
  },
  REJECT: {
    title: "این مطلب رد شود؟",
    description: "نسخه فرستاده‌شده در تاریخچه می‌ماند و دلیل شما برای نویسنده نمایش داده می‌شود.",
    action: "رد مطلب",
  },
} as const;

function ModerationDecisionDialog({
  decision,
  entryTitle,
  isPending,
  onOpenChange,
  onConfirm,
}: ModerationDecisionDialogProps) {
  const needsReason = decision === "REQUEST_CHANGES" || decision === "REJECT";
  const copy = decision ? decisionCopy[decision] : null;
  const form = useForm<ModerationReasonValues>({
    resolver: zodResolver(moderationReasonSchema),
    defaultValues: { reason: "" },
  });

  useEffect(() => {
    if (decision) {
      form.reset({ reason: "" });
    }
  }, [decision, form]);

  if (!copy) {
    return null;
  }

  async function handleSubmit(values?: ModerationReasonValues) {
    await onConfirm(values?.reason.trim());
  }

  return (
    <AlertDialog open={Boolean(decision)} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg rounded-xl border border-border bg-card p-5 text-foreground shadow-[0_24px_70px_rgba(31,41,55,0.16)] sm:max-w-lg">
        <form
          onSubmit={
            needsReason
              ? form.handleSubmit(handleSubmit)
              : (event) => {
                  event.preventDefault();
                  void handleSubmit();
                }
          }
        >
          <AlertDialogHeader className="place-items-start text-start">
            <AlertDialogTitle className="text-[19px] font-bold text-foreground">
              {copy.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[14px] leading-7 text-muted-foreground">
              <span className="font-semibold text-foreground">{entryTitle}</span>
              <br />
              {copy.description}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {needsReason ? (
            <div className="mt-5 space-y-2">
              <Label htmlFor="moderation-reason">دلیل و توضیح</Label>
              <Textarea
                id="moderation-reason"
                rows={6}
                maxLength={1200}
                placeholder={
                  decision === "REQUEST_CHANGES"
                    ? "مواردی را که باید اصلاح شوند، روشن و دقیق بنویسید..."
                    : "دلیل رد مطلب را بنویسید..."
                }
                aria-invalid={Boolean(form.formState.errors.reason)}
                aria-describedby={
                  form.formState.errors.reason ? "moderation-reason-error" : undefined
                }
                className="mt-2 resize-y leading-7"
                {...form.register("reason")}
              />
              {form.formState.errors.reason ? (
                <p id="moderation-reason-error" className="text-[13px] text-destructive">
                  {form.formState.errors.reason.message}
                </p>
              ) : null}
            </div>
          ) : null}

          <AlertDialogFooter className="mt-5 -mx-5 -mb-5 border-border bg-muted/40 px-5 py-4 sm:justify-start">
            <AlertDialogCancel className="rounded-full" disabled={isPending}>
              انصراف
            </AlertDialogCancel>
            <Button
              type="submit"
              disabled={isPending}
              variant={decision === "REJECT" ? "destructive" : "default"}
              className="rounded-full"
            >
              {isPending ? "در حال ثبت..." : copy.action}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ModerationDecisionDialog };
