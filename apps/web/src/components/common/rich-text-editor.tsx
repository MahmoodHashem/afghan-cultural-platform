"use client";

import CharacterCount from "@tiptap/extension-character-count";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import type { JSONContent } from "@tiptap/react";
import { EditorContent, Extension, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type RichTextContent = JSONContent;

type RichTextEditorProps = {
  value?: RichTextContent;
  onChange?: (value: RichTextContent) => void;
  placeholder?: string;
  characterLimit?: number;
  className?: string;
};

const defaultContent: RichTextContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      attrs: {
        dir: "rtl",
      },
    },
  ],
};

const RtlTextDirection = Extension.create({
  name: "rtlTextDirection",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading", "blockquote"],
        attributes: {
          dir: {
            default: "rtl",
            parseHTML: (element) => element.getAttribute("dir") || "rtl",
            renderHTML: (attributes) => ({
              dir: attributes.dir || "rtl",
            }),
          },
        },
      },
    ];
  },
});

function RichTextEditor({
  value = defaultContent,
  onChange,
  placeholder = "متن فارسی را اینجا بنویسید...",
  characterLimit = 1200,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      TextStyle,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "right",
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: characterLimit,
      }),
      RtlTextDirection,
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "min-h-48 rounded-b-xl bg-card px-4 py-3 text-body outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        dir: "rtl",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange?.(currentEditor.getJSON() as RichTextContent);
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentValue = JSON.stringify(editor.getJSON());
    const nextValue = JSON.stringify(value);

    if (currentValue !== nextValue) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-4 text-small", className)}>
        ویرایشگر در حال آماده‌سازی است...
      </div>
    );
  }

  function setLink() {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("آدرس پیوند را وارد کنید:", previousUrl ?? "https://");

    if (url === null) {
      return;
    }

    if (url.trim() === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  const characters = editor.storage.characterCount.characters() as number;

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/50 p-2">
        <Button
          type="button"
          variant={editor.isActive("heading", { level: 2 }) ? "default" : "outline"}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          عنوان ۲
        </Button>
        <Button
          type="button"
          variant={editor.isActive("heading", { level: 3 }) ? "default" : "outline"}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          عنوان ۳
        </Button>
        <Separator orientation="vertical" className="h-7" />
        <Button
          type="button"
          variant={editor.isActive("bold") ? "default" : "outline"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          ضخیم
        </Button>
        <Button
          type="button"
          variant={editor.isActive("italic") ? "default" : "outline"}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          کج
        </Button>
        <Button
          type="button"
          variant={editor.isActive("underline") ? "default" : "outline"}
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          زیرخط
        </Button>
        <Separator orientation="vertical" className="h-7" />
        <Button
          type="button"
          variant={editor.isActive("bulletList") ? "default" : "outline"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          فهرست
        </Button>
        <Button
          type="button"
          variant={editor.isActive("orderedList") ? "default" : "outline"}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          شماره‌دار
        </Button>
        <Button
          type="button"
          variant={editor.isActive("blockquote") ? "default" : "outline"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          نقل‌قول
        </Button>
        <Separator orientation="vertical" className="h-7" />
        <Button
          type="button"
          variant={editor.isActive({ textAlign: "right" }) ? "default" : "outline"}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          راست
        </Button>
        <Button
          type="button"
          variant={editor.isActive({ textAlign: "center" }) ? "default" : "outline"}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          وسط
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={setLink}>
          پیوند
        </Button>
        <Separator orientation="vertical" className="h-7" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          بازگشت
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          انجام دوباره
        </Button>
      </div>
      <EditorContent editor={editor} />
      <div className="border-t border-border px-4 py-2 text-small text-muted-foreground">
        {characters.toLocaleString("fa-AF")} / {characterLimit.toLocaleString("fa-AF")} نویسه
      </div>
    </div>
  );
}

export type { RichTextContent };
export { RichTextEditor };
