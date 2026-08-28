"use client";

import {
  ArrowRightIcon,
  ChevronDownIcon,
  EyeIcon as StaticEyeIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, m } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { CheckCircleIcon } from "@/components/icons/animated/check-circle";
import { EyeIcon } from "@/components/icons/animated/eye";
import { PaperAirplaneIcon } from "@/components/icons/animated/paper-airplane";
import { Button } from "@/components/ui/button";
import type { SaveState } from "@/features/entries/types/create-entry-form";
import { useAnimatedIcon } from "@/hooks/use-animated-icon";
import { useVirtualKeyboard } from "@/hooks/use-virtual-keyboard";
import { cn } from "@/lib/utils";

type CreateEntryEditorHeaderProps = {
  isBusy: boolean;
  saveState: SaveState;
  submitLabel?: string;
  title?: string;
  onBack: () => void;
  onPreview: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
};

export function CreateEntryEditorHeader({
  isBusy,
  submitLabel = "ارسال برای بررسی",
  title = "مطلب جدید",
  onBack,
  onPreview,
  onSaveDraft,
  onSubmit,
}: CreateEntryEditorHeaderProps) {
  const previewAnimation = useAnimatedIcon();
  const saveAnimation = useAnimatedIcon();
  const submitAnimation = useAnimatedIcon();

  return (
    <header className="sticky top-2 rounded-full mx-2 z-40 border-b border-border bg-card/96 pt-[env(safe-area-inset-top)] backdrop-blur-xl md:top-5 md:mx-auto md:max-w-5xl md:rounded-full md:pt-0">
      <div className="mx-auto flex h-14 items-center justify-between gap-3 px-3 md:h-auto md:flex-col md:px-6 md:py-3 lg:flex-row lg:px-8">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
            <ArrowRightIcon aria-hidden="true" />
            <span className="sr-only">بازگشت</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            render={<Link href="/explore" />}
          >
            <ArrowRightIcon aria-hidden="true" />
            <span className="sr-only">بازگشت</span>
          </Button>
          <div>
            <h1 className="text-[14px] font-bold text-foreground md:text-base">{title}</h1>
          </div>
        </div>
        <div className="hidden items-center gap-2 md:flex lg:justify-end">
          <Button
            type="button"
            variant="ghost"
            disabled={isBusy}
            onClick={onPreview}
            {...previewAnimation.triggerProps}
          >
            <EyeIcon ref={previewAnimation.iconRef} size={20} aria-hidden="true" />
            پیش‌نمایش
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={isBusy}
            onClick={onSaveDraft}
            {...saveAnimation.triggerProps}
          >
            <CheckCircleIcon ref={saveAnimation.iconRef} size={20} aria-hidden="true" />
            {isBusy ? "در حال ذخیره..." : "ذخیره پیش‌نویس"}
          </Button>
          <Button
            type="button"
            className="rounded-full"
            disabled={isBusy}
            onClick={onSubmit}
            {...submitAnimation.triggerProps}
          >
            <PaperAirplaneIcon ref={submitAnimation.iconRef} size={20} aria-hidden="true" />
            {submitLabel}
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="پیش‌نمایش مطلب"
          onClick={onPreview}
        >
          <StaticEyeIcon aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}

export function MobileEditorSaveAction({
  isBusy,
  saveState,
  submitLabel,
  onSaveDraft,
  onSubmit,
}: {
  isBusy: boolean;
  saveState: SaveState;
  submitLabel: string;
  onSaveDraft: () => void;
  onSubmit: () => void;
}) {
  const { isOpen: isKeyboardOpen } = useVirtualKeyboard();
  const saveAnimation = useAnimatedIcon();
  const submitAnimation = useAnimatedIcon();
  const previousSaveStateRef = useRef(saveState);

  useEffect(() => {
    if (previousSaveStateRef.current !== "saved" && saveState === "saved") {
      saveAnimation.playStateChange();
    }
    previousSaveStateRef.current = saveState;
  }, [saveAnimation.playStateChange, saveState]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "fixed inset-x-2 bottom-2 z-40  pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-[transform,opacity] duration-200 md:hidden",
        isKeyboardOpen && "pointer-events-none translate-y-full opacity-0",
      )}
      aria-hidden={isKeyboardOpen}
      inert={isKeyboardOpen}
    >
      <div className="mx-auto grid max-w-xl grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 min-w-0 rounded-full shadow border"
          disabled={isBusy}
          onClick={onSaveDraft}
        >
          <CheckCircleIcon ref={saveAnimation.iconRef} size={20} aria-hidden="true" />
          <span className="truncate">
            {saveState === "saving" ? "در حال ذخیره..." : "ذخیره پیش‌نویس"}
          </span>
        </Button>
        <Button
          type="button"
          className="h-11 min-w-0 rounded-full shadow border"
          disabled={isBusy}
          onClick={() => {
            submitAnimation.playStateChange();
            onSubmit();
          }}
        >
          <PaperAirplaneIcon ref={submitAnimation.iconRef} size={20} aria-hidden="true" />
          <span className="truncate">{submitLabel}</span>
        </Button>
      </div>
    </div>,
    document.body,
  );
}

type EditorSectionProps = {
  title: string;
  summary?: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CreateEntryEditorSection({
  title,
  summary,
  children,
  open: controlledOpen,
  onOpenChange,
}: EditorSectionProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const contentId = `entry-section-${title.replace(/\s+/g, "-")}`;

  function setOpen(nextOpen: boolean) {
    if (onOpenChange) {
      onOpenChange(nextOpen);
      return;
    }

    setInternalOpen(nextOpen);
  }

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 py-5 text-right"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen(!open)}
      >
        <span>
          <span className="block font-semibold text-foreground">{title}</span>
          {summary ? (
            <span className="mt-1 block text-small text-muted-foreground">{summary}</span>
          ) : null}
        </span>
        <ChevronDownIcon
          aria-hidden="true"
          className={cn("size-5 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <m.div
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pb-8">{children}</div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-small text-destructive">{message}</p>;
}

export function EmptyRow({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-background/50 px-4 py-8 text-center text-small text-muted-foreground">
      {text}
    </div>
  );
}
