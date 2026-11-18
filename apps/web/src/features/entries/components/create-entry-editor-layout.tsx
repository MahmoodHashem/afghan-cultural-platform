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
  saveLabel?: string;
  title?: string;
  onBack: () => void;
  onPreview: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
};

export function CreateEntryEditorHeader({
  isBusy,
  submitLabel = "ارسال برای بررسی",
  saveLabel = "ذخیره پیش‌نویس",
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
    <header className="sticky top-[max(0.5rem,env(safe-area-inset-top))] z-40 mx-2 rounded-full border border-line-soft bg-header shadow-header backdrop-blur-xl md:top-5 md:mx-6 lg:mx-auto lg:max-w-288">
      <div className="flex h-14 items-center justify-between gap-3 px-2 md:h-16 md:ps-3 md:pe-2.5">
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
            <p className="hidden text-[11.5px] text-faint md:block">میراث افغانستان · نوشتن</p>
            <h1 className="text-[14px] font-bold text-ink md:text-[15px]">{title}</h1>
          </div>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full"
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
            {isBusy ? "در حال ذخیره..." : saveLabel}
          </Button>
          <Button
            type="button"
            variant="pill"
            className="px-5"
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
  saveLabel = "ذخیره پیش‌نویس",
  onSaveDraft,
  onSubmit,
}: {
  isBusy: boolean;
  saveState: SaveState;
  submitLabel: string;
  saveLabel?: string;
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
        "fixed inset-x-2 bottom-2 z-40 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-[transform,opacity] duration-200 md:hidden",
        isKeyboardOpen && "pointer-events-none translate-y-full opacity-0",
      )}
      aria-hidden={isKeyboardOpen}
      inert={isKeyboardOpen}
    >
      <div className="mx-auto grid max-w-xl grid-cols-2 gap-2 rounded-full border border-line-soft bg-header p-1.5 shadow-lift backdrop-blur-xl">
        <Button
          type="button"
          variant="outline"
          className="h-11 min-w-0 rounded-full"
          disabled={isBusy}
          onClick={onSaveDraft}
        >
          <CheckCircleIcon ref={saveAnimation.iconRef} size={20} aria-hidden="true" />
          <span className="truncate">{saveState === "saving" ? "در حال ذخیره..." : saveLabel}</span>
        </Button>
        <Button
          type="button"
          variant="pill"
          className="h-11 min-w-0"
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
        className="flex w-full items-center justify-between gap-4 py-5 text-start outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen(!open)}
      >
        <span>
          <span className="block text-[15.5px] font-bold text-ink">{title}</span>
          {summary ? (
            <span className="mt-1 block text-small text-faint">{summary}</span>
          ) : null}
        </span>
        <ChevronDownIcon
          aria-hidden="true"
          className={cn(
            "size-8 rounded-full bg-paper p-1.5 text-faint transition-transform duration-200",
            open && "rotate-180 text-brand-ink",
          )}
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

  return <p className="text-small text-brand-ink">{message}</p>;
}

export function EmptyRow({ text }: { text: string }) {
  return (
    <div className="rounded-control border-[1.5px] border-dashed border-line bg-paper/50 px-4 py-8 text-center text-small text-faint">
      {text}
    </div>
  );
}
