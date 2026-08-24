"use client";

import { FaceSmileIcon } from "@heroicons/react/24/outline";
import { lazy, Suspense, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const LazyCommentEmojiPickerContent = lazy(() =>
  import("./comment-emoji-picker-content").then((module) => ({
    default: module.CommentEmojiPickerContent,
  })),
);

type CommentEmojiPickerProps = {
  disabled?: boolean;
  onSelect: (emoji: string) => void;
};

function CommentEmojiPicker({ disabled, onSelect }: CommentEmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            aria-label="افزودن شکلک"
          />
        }
      >
        <FaceSmileIcon className="size-5" aria-hidden="true" />
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        className="w-auto overflow-hidden p-0"
        dir="rtl"
      >
        {isOpen ? (
          <Suspense
            fallback={
              <div
                className="grid h-[320px] w-[min(320px,calc(100vw-2rem))] place-items-center text-[13px] text-muted-foreground"
                role="status"
              >
                در حال آماده‌سازی شکلک‌ها...
              </div>
            }
          >
            <LazyCommentEmojiPickerContent
              onSelect={(emoji) => {
                onSelect(emoji);
                setIsOpen(false);
              }}
            />
          </Suspense>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

export { CommentEmojiPicker };
