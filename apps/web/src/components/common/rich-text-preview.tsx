"use client";

import { useState } from "react";

import { type RichTextContent, RichTextEditor } from "@/components/common/rich-text-editor";

const initialContent: RichTextContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      attrs: {
        dir: "rtl",
        textAlign: "right",
      },
      content: [
        {
          type: "text",
          text: "این یک متن نمونه برای بررسی ویرایشگر فارسی راست‌به‌چپ است.",
        },
      ],
    },
  ],
};

function RichTextPreview() {
  const [value, setValue] = useState<RichTextContent>(initialContent);

  return <RichTextEditor value={value} onChange={setValue} />;
}

export { RichTextPreview };
