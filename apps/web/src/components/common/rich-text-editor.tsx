"use client";

import CharacterCount from "@tiptap/extension-character-count";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import type { JSONContent } from "@tiptap/react";
import { EditorContent, Extension, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type RichTextContent = JSONContent;

type RichTextEditorProps = {
  value?: RichTextContent;
  onChange?: (value: RichTextContent) => void;
  placeholder?: string;
  characterLimit?: number;
  className?: string;
  editorClassName?: string;
  toolbarMode?: "always" | "toggle" | "bubble" | "hidden";
  showCharacterCount?: boolean;
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
  placeholder = "متن مطلب را اینجا بنویسید...",
  characterLimit = 1200,
  className,
  editorClassName,
  toolbarMode = "always",
  showCharacterCount = true,
}: RichTextEditorProps) {
  const [isToolbarOpen, setIsToolbarOpen] = useState(toolbarMode === "always");

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
        class: cn(
          "min-h-48 bg-card px-4 py-3 text-body outline-none focus-visible:ring-3 focus-visible:ring-ring/40 ",
          toolbarMode === "always" ? "rounded-b-xl" : "rounded-xl",
          editorClassName,
        ),
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
  const shouldShowToolbar = toolbarMode === "always" || (toolbarMode === "toggle" && isToolbarOpen);

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      {toolbarMode === "toggle" ? (
        <div className="flex flex-wrap items-center gap-2   p-2">
          <Button
            type="button"
            variant={isToolbarOpen ? "default" : "outline"}
            size="sm"
            aria-expanded={isToolbarOpen}
            onClick={() => setIsToolbarOpen((current) => !current)}
          >
            Aa
          </Button>
          {shouldShowToolbar ? <EditorToolbar editor={editor} onSetLink={setLink} /> : null}
        </div>
      ) : null}
      {toolbarMode === "always" ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/50 p-2">
          <EditorToolbar editor={editor} onSetLink={setLink} />
        </div>
      ) : null}
      {toolbarMode === "bubble" ? <EditorBubbleToolbar editor={editor} /> : null}
      <EditorContent editor={editor} />
      {showCharacterCount ? (
        <div className="border-t border-border px-4 py-2 text-small text-muted-foreground placeholder:text-muted-foreground/25 ">
          {characters.toLocaleString("fa-AF")} / {characterLimit.toLocaleString("fa-AF")} کاراکتر
        </div>
      ) : null}
    </div>
  );
}

type EditorToolbarProps = {
  editor: NonNullable<ReturnType<typeof useEditor>>;
  onSetLink: () => void;
};

function EditorBubbleToolbar({ editor }: Pick<EditorToolbarProps, "editor">) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  function openLinkEditor() {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    setLinkUrl(previousUrl ?? "https://");
    setIsEditingLink(true);
  }

  function applyLink() {
    const nextUrl = linkUrl.trim();

    if (!nextUrl) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setIsEditingLink(false);
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: nextUrl }).run();
    setIsEditingLink(false);
  }

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor: currentEditor, state }) =>
        isEditingLink || (currentEditor.isEditable && !state.selection.empty)
      }
      options={{
        offset: 10,
        placement: "top",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.96 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        className="overflow-hidden rounded-xl border border-border bg-primary text-foreground shadow-[0_16px_40px_rgba(0,0,0,.22)] backdrop-blur-md"
        dir="rtl"
      >
        {isEditingLink ? (
          <div className="flex w-80 items-center gap-2 p-2">
            <Input
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyLink();
                }

                if (event.key === "Escape") {
                  event.preventDefault();
                  setIsEditingLink(false);
                }
              }}
              dir="ltr"
              autoFocus
              placeholder="https://"
              className="h-9 border-white/10 bg-white/10 text-left text-white placeholder:text-white/40 focus-visible:ring-white/25"
            />
            <BubbleToolbarButton label="ثبت پیوند" onClick={applyLink}>
              ثبت
            </BubbleToolbarButton>
            <BubbleToolbarButton label="بستن پیوند" onClick={() => setIsEditingLink(false)}>
              ×
            </BubbleToolbarButton>
          </div>
        ) : (
          <div className="flex items-center gap-1 p-1.5">
            <BubbleToolbarButton
              label="ضخیم"
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              B
            </BubbleToolbarButton>
            <BubbleToolbarButton
              label="کج"
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <span className="italic">I</span>
            </BubbleToolbarButton>
            <BubbleToolbarButton
              label="زیرخط"
              active={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <span className="underline">U</span>
            </BubbleToolbarButton>
            <BubbleToolbarButton
              label="پیوند"
              active={editor.isActive("link")}
              onClick={openLinkEditor}
            >
              پیوند
            </BubbleToolbarButton>
            <BubbleToolbarButton
              label="نقل‌قول"
              active={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              نقل
            </BubbleToolbarButton>
            <span className="mx-1 h-6 w-px bg-white/15" aria-hidden="true" />
            <BubbleToolbarButton
              label="ابزارهای بیشتر"
              active={isExpanded}
              onClick={() => setIsExpanded((current) => !current)}
            >
              …
            </BubbleToolbarButton>
          </div>
        )}

        <AnimatePresence initial={false}>
          {isExpanded && !isEditingLink ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="overflow-hidden border-t border-white/10"
            >
              <div className="flex flex-wrap items-center gap-1 p-1.5">
                <BubbleToolbarButton
                  label="عنوان ۲"
                  active={editor.isActive("heading", { level: 2 })}
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                  H2
                </BubbleToolbarButton>
                <BubbleToolbarButton
                  label="عنوان ۳"
                  active={editor.isActive("heading", { level: 3 })}
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                  H3
                </BubbleToolbarButton>
                <BubbleToolbarButton
                  label="فهرست نشانه‌دار"
                  active={editor.isActive("bulletList")}
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                  •
                </BubbleToolbarButton>
                <BubbleToolbarButton
                  label="فهرست شماره‌دار"
                  active={editor.isActive("orderedList")}
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                  ۱.
                </BubbleToolbarButton>
                <BubbleToolbarButton
                  label="چینش راست"
                  active={editor.isActive({ textAlign: "right" })}
                  onClick={() => editor.chain().focus().setTextAlign("right").run()}
                >
                  راست
                </BubbleToolbarButton>
                <BubbleToolbarButton
                  label="چینش وسط"
                  active={editor.isActive({ textAlign: "center" })}
                  onClick={() => editor.chain().focus().setTextAlign("center").run()}
                >
                  وسط
                </BubbleToolbarButton>
                <BubbleToolbarButton
                  label="بازگشت"
                  disabled={!editor.can().undo()}
                  onClick={() => editor.chain().focus().undo().run()}
                >
                  ↶
                </BubbleToolbarButton>
                <BubbleToolbarButton
                  label="انجام دوباره"
                  disabled={!editor.can().redo()}
                  onClick={() => editor.chain().focus().redo().run()}
                >
                  ↷
                </BubbleToolbarButton>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </BubbleMenu>
  );
}

type BubbleToolbarButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
};

function BubbleToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: BubbleToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[13px] font-semibold text-white/82 transition-colors duration-150 hover:bg-white/12 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 disabled:pointer-events-none disabled:opacity-35",
        active && "bg-white text-zinc-950 hover:bg-white hover:text-zinc-950",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function EditorToolbar({ editor, onSetLink }: EditorToolbarProps) {
  return (
    <>
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
      <Button type="button" variant="outline" size="sm" onClick={onSetLink}>
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
    </>
  );
}

export type { RichTextContent };
export { RichTextEditor };
