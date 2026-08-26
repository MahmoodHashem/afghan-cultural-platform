"use client";

import { PaperAirplaneIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommentEmojiPicker } from "@/features/engagement/components/comment-emoji-picker";
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
  helperText?: string;
  onSubmit: (body: string) => Promise<void>;
  onCancel?: () => void;
};

function CommentComposer({
  mode = "root",
  authorName,
  initialBody = "",
  isPending,
  autoFocus = false,
  helperText,
  onSubmit,
  onCancel,
}: CommentComposerProps) {
  const compact = mode !== "root";
  const [isExpanded, setIsExpanded] = useState(
    compact || autoFocus || initialBody.trim().length > 0,
  );
  const fieldId = useId();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<EntryCommentFormValues>({
    resolver: zodResolver(entryCommentSchema),
    defaultValues: { body: initialBody },
  });
  const body = watch("body") ?? "";
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const selectionRef = useRef({ start: initialBody.length, end: initialBody.length });
  const { ref: bodyFieldRef, ...bodyField } = register("body");

  useEffect(() => {
    reset({ body: initialBody });
    selectionRef.current = { start: initialBody.length, end: initialBody.length };
    if (initialBody.trim().length > 0 || autoFocus) setIsExpanded(true);
  }, [autoFocus, initialBody, reset]);

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

  function rememberSelection(element: HTMLTextAreaElement) {
    selectionRef.current = {
      start: element.selectionStart,
      end: element.selectionEnd,
    };
  }

  function insertEmoji(emoji: string) {
    const currentBody = getValues("body") ?? "";
    const { start, end } = selectionRef.current;
    const nextBody = `${currentBody.slice(0, start)}${emoji}${currentBody.slice(end)}`;

    if (nextBody.length > 1000) {
      return;
    }

    const nextCursorPosition = start + emoji.length;
    selectionRef.current = { start: nextCursorPosition, end: nextCursorPosition };
    setValue("body", nextBody, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(nextCursorPosition, nextCursorPosition);
    });
  }

  const errorId = `${fieldId}-error`;

  return (
    <form
      onSubmit={handleSubmit(submit)}
      onFocus={() => setIsExpanded(true)}
      className={cn(
        "bg-card transition-[padding,box-shadow] duration-200",
        compact
          ? "space-y-3 rounded-xl border border-border p-3"
          : isExpanded
            ? "rounded-xl border border-border p-4 shadow-[0_6px_22px_rgba(31,41,55,0.06)] sm:p-5"
            : "rounded-xl border border-border p-3 sm:p-4",
      )}
    >
      <div className={cn("flex items-start gap-3", !compact && "sm:gap-4")}>
        <Avatar
          className={cn(
            "bg-primary-light transition-[width,height] duration-200",
            compact ? "size-9" : isExpanded ? "size-11" : "size-9",
          )}
        >
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
            rows={compact ? 3 : isExpanded ? 4 : 2}
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
              compact
                ? "min-h-24"
                : isExpanded
                  ? "min-h-28 sm:min-h-32"
                  : "min-h-18 resize-none border-transparent bg-transparent",
            )}
            {...bodyField}
            ref={(element) => {
              bodyFieldRef(element);
              textareaRef.current = element;
            }}
            onSelect={(event) => rememberSelection(event.currentTarget)}
            onClick={(event) => rememberSelection(event.currentTarget)}
            onKeyUp={(event) => rememberSelection(event.currentTarget)}
          />
          {errors.body ? (
            <p id={errorId} role="alert" className="mt-2 text-[13px] text-destructive">
              {errors.body.message}
            </p>
          ) : null}
        </div>
      </div>

      {compact || isExpanded ? (
        <div
          className={cn(
            "mt-4 flex flex-wrap items-center justify-between gap-3",
            compact && "mt-3",
          )}
        >
          {!compact ? (
            <p className="inline-flex items-center gap-2 text-[12px] leading-6 text-muted-foreground sm:text-[13px]">
              <ShieldCheckIcon className="size-5 shrink-0 text-primary" aria-hidden="true" />
              {helperText ?? "لطفاً با احترام و مرتبط با موضوع، نظر خود را بنویسید."}
            </p>
          ) : (
            <span className="text-[12px] text-muted-foreground">
              {formatPersianNumber(body.length)}/۱۰۰۰
            </span>
          )}
          <div className="ms-auto flex items-center gap-2">
            <CommentEmojiPicker
              disabled={isPending || body.length >= 1000}
              onSelect={insertEmoji}
            />
            {!compact ? (
              <span className="text-[12px] text-muted-foreground">
                {formatPersianNumber(body.length)}/۱۰۰۰
              </span>
            ) : null}
            {onCancel ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={onCancel}
              >
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
      ) : null}
    </form>
  );
}

export { CommentComposer };
