"use client";

import { PaperAirplaneIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId } from "react";
import { useForm } from "react-hook-form";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  type EntryCommentFormValues,
  entryCommentSchema,
} from "@/features/engagement/schemas/entry-comment-schema";
import { isApiError } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";
import { formatPersianNumber } from "@/lib/utils/formatters";
import { createUserInitials } from "@/lib/utils/user";

type CommentComposerProps = {
  mode?: "root" | "reply" | "edit";
  authorName: string;
  initialBody?: string;
  isPending: boolean;
  autoFocus?: boolean;
  onSubmit: (body: string) => Promise<void>;
  onCancel?: () => void;
};

function CommentComposer({
  mode = "root",
  authorName,
  initialBody = "",
  isPending,
  autoFocus = false,
  onSubmit,
  onCancel,
}: CommentComposerProps) {
  const compact = mode !== "root";
  const fieldId = useId();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm<EntryCommentFormValues>({
    resolver: zodResolver(entryCommentSchema),
    defaultValues: { body: initialBody },
  });
  const body = watch("body") ?? "";

  useEffect(() => reset({ body: initialBody }), [initialBody, reset]);

  async function submit(values: EntryCommentFormValues) {
    try {
      await onSubmit(values.body);
      if (mode !== "edit") reset({ body: "" });
    } catch (error) {
      if (isApiError(error)) {
        const fieldError = error.fieldErrors.find((item) => item.field === "body");
        if (fieldError) {
          setError("body", { type: "server", message: fieldError.message }, { shouldFocus: true });
        }
      }
    }
  }

  const errorId = `${fieldId}-error`;

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className={cn(
        "bg-card",
        compact
          ? "space-y-3 rounded-xl border border-border p-3"
          : "rounded-xl border border-border p-4 sm:p-5",
      )}
    >
      <div className={cn("flex items-start gap-3", !compact && "sm:gap-4")}>
        <Avatar className={cn("bg-primary-light", compact ? "size-9" : "size-11")}>
          <AvatarFallback className="bg-primary-light font-bold text-primary">
            {createUserInitials(authorName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <label htmlFor={fieldId} className="sr-only">
            {mode === "reply" ? "نوشتن پاسخ" : mode === "edit" ? "ویرایش دیدگاه" : "نوشتن دیدگاه"}
          </label>
          <Textarea
            id={fieldId}
            rows={compact ? 3 : 4}
            maxLength={1000}
            autoFocus={autoFocus}
            placeholder={
              mode === "reply"
                ? "پاسخ خود را بنویسید..."
                : "دیدگاه خود را درباره این مطلب بنویسید..."
            }
            aria-invalid={Boolean(errors.body)}
            aria-describedby={errors.body ? errorId : undefined}
            className={cn(
              "resize-y border-border bg-background leading-8 shadow-none",
              compact ? "min-h-24" : "min-h-28 sm:min-h-32",
            )}
            {...register("body")}
          />
          {errors.body ? (
            <p id={errorId} role="alert" className="mt-2 text-[13px] text-destructive">
              {errors.body.message}
            </p>
          ) : null}
        </div>
      </div>

      <div
        className={cn("mt-4 flex flex-wrap items-center justify-between gap-3", compact && "mt-3")}
      >
        {!compact ? (
          <p className="inline-flex items-center gap-2 text-[12px] leading-6 text-muted-foreground sm:text-[13px]">
            <ShieldCheckIcon className="size-5 shrink-0 text-primary" aria-hidden="true" />
            لطفاً با احترام و مرتبط با موضوع، نظر خود را بنویسید.
          </p>
        ) : (
          <span className="text-[12px] text-muted-foreground">
            {formatPersianNumber(body.length)}/۱۰۰۰
          </span>
        )}
        <div className="ms-auto flex items-center gap-2">
          {!compact ? (
            <span className="text-[12px] text-muted-foreground">
              {formatPersianNumber(body.length)}/۱۰۰۰
            </span>
          ) : null}
          {onCancel ? (
            <Button type="button" variant="ghost" size="sm" disabled={isPending} onClick={onCancel}>
              انصراف
            </Button>
          ) : null}
          <Button type="submit" size={compact ? "sm" : "default"} disabled={isPending}>
            {isPending
              ? "در حال ثبت..."
              : mode === "edit"
                ? "ذخیره تغییرات"
                : mode === "reply"
                  ? "ارسال پاسخ"
                  : "ارسال دیدگاه"}
            {mode !== "edit" ? (
              <PaperAirplaneIcon className="size-4 rtl:-scale-x-100" aria-hidden="true" />
            ) : null}
          </Button>
        </div>
      </div>
    </form>
  );
}

export { CommentComposer };
