"use client";

import {
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, m } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CreateEntryEditorHeaderProps = {
  isBusy: boolean;
  title?: string;
  onSaveDraft: () => void;
  onSubmit: () => void;
};

export function CreateEntryEditorHeader({
  isBusy,
  title = "مطلب جدید",
  onSaveDraft,
  onSubmit,
}: CreateEntryEditorHeaderProps) {
  return (
    <header className="sticky top-5 z-40 mx-auto max-w-5xl rounded-full border-b border-border bg-card/94 backdrop-blur-md">
      <div className="mx-auto flex flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" render={<Link href="/explore" />}>
            <ArrowRightIcon aria-hidden="true" />
            <span className="sr-only">بازگشت</span>
          </Button>
          <div>
            <h1 className="text-base font-bold text-foreground">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={isBusy}
            onClick={onSaveDraft}
          >
            <CheckCircleIcon aria-hidden="true" />
            {isBusy ? "در حال ذخیره..." : "ذخیره پیش‌نویس"}
          </Button>
          <Button type="button" className="rounded-full" disabled={isBusy} onClick={onSubmit}>
            <PaperAirplaneIcon aria-hidden="true" />
            ارسال برای بررسی
          </Button>
        </div>
      </div>
    </header>
  );
}

type EditorSectionProps = {
  title: string;
  summary?: string;
  children: ReactNode;
};

export function CreateEntryEditorSection({ title, summary, children }: EditorSectionProps) {
  const [open, setOpen] = useState(false);
  const contentId = `entry-section-${title.replace(/\s+/g, "-")}`;

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 py-5 text-right"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((current) => !current)}
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
