"use client";

import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "@/components/ui/emoji-picker";

type CommentEmojiPickerContentProps = {
  onSelect: (emoji: string) => void;
};

function CommentEmojiPickerContent({ onSelect }: CommentEmojiPickerContentProps) {
  return (
    <EmojiPicker
      className="h-[320px] w-[min(320px,calc(100vw-2rem))]"
      dir="ltr"
      onEmojiSelect={({ emoji }) => onSelect(emoji)}
    >
      <EmojiPickerSearch placeholder="Search emoji..." aria-label="Search emoji" />
      <EmojiPickerContent />
      <EmojiPickerFooter />
    </EmojiPicker>
  );
}

export { CommentEmojiPickerContent };
