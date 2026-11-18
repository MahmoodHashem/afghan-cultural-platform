import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type TiptapNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: TiptapMark[];
  content?: TiptapNode[];
};

type TiptapMark = {
  type?: string;
  attrs?: Record<string, unknown>;
};

type TiptapHeading = {
  id: string;
  title: string;
  level: 2 | 3;
};

function TiptapDocument({ content }: { content: unknown }) {
  const root = isTiptapNode(content) ? content : undefined;
  const children = root?.content ?? [];

  if (children.length === 0) {
    return (
      <div className="rounded-card border-[1.5px] border-dashed border-line p-6 text-copy">
        متن این مطلب در دسترس نیست.
      </div>
    );
  }

  return (
    <div className="article-container mx-0 max-w-none space-y-4 px-0 text-[16px] leading-[2.15] text-copy">
      {children.map((node, index) => renderNode(node, index))}
    </div>
  );
}

function createTiptapHeadings(content: unknown): TiptapHeading[] {
  const root = isTiptapNode(content) ? content : undefined;

  return (root?.content ?? []).flatMap((node, index) => {
    if (node.type !== "heading") {
      return [];
    }

    const title = getNodeText(node).trim();

    if (!title) {
      return [];
    }

    return [
      {
        id: createHeadingId(title, index),
        title,
        level: node.attrs?.level === 3 ? 3 : 2,
      },
    ];
  });
}

function renderNode(node: TiptapNode, key: number | string): ReactNode {
  const children = renderChildren(node.content);
  const textAlign = "text-justify";

  switch (node.type) {
    case "paragraph":
      return (
        <p key={key} dir={getDirection(node.attrs)} className={cn("leading-[2.15]", textAlign)}>
          {children.length > 0 ? children : "\u00A0"}
        </p>
      );
    case "heading": {
      const level = node.attrs?.level === 3 ? 3 : 2;
      const headingText = getNodeText(node);
      const headingId = createHeadingId(headingText, key);
      const className = cn(
        "scroll-mt-32 pt-5 font-bold leading-[1.9] text-ink",
        level === 3
          ? "text-[17px]"
          : "relative flex items-center gap-2.5 text-[20px] before:h-5 before:w-[5px] before:shrink-0 before:rounded-[3px] before:bg-brand",
        textAlign,
      );

      return level === 3 ? (
        <h3 key={key} id={headingId} dir={getDirection(node.attrs)} className={className}>
          {children}
        </h3>
      ) : (
        <h2 key={key} id={headingId} dir={getDirection(node.attrs)} className={className}>
          {children}
        </h2>
      );
    }
    case "bulletList":
      return (
        <ul key={key} className="list-disc space-y-2 pe-5 ps-0 marker:text-brand">
          {children}
        </ul>
      );
    case "orderedList":
      return (
        <ol
          key={key}
          start={getOrderedListStart(node.attrs)}
          className="list-decimal space-y-2 pe-5 ps-0 marker:text-brand"
        >
          {children}
        </ol>
      );
    case "listItem":
      return (
        <li key={key} className="leading-[2.15]">
          {children}
        </li>
      );
    case "blockquote":
      return (
        <blockquote
          key={key}
          className="rounded-[14px] border border-s-[3px] border-line border-s-brand bg-surface py-4 ps-5 pe-5 text-ink"
        >
          {children}
        </blockquote>
      );
    case "horizontalRule":
      return <hr key={key} className="my-7 border-t-[1.5px] border-dashed border-line" />;
    case "hardBreak":
      return <br key={key} />;
    case "codeBlock":
      return (
        <pre
          key={key}
          dir="ltr"
          className="overflow-x-auto rounded-bubble-sm border border-line bg-paper px-4 py-3 text-left text-[14px] leading-7"
        >
          <code>{children}</code>
        </pre>
      );
    case "text":
      return applyMarks(node.text ?? "", node.marks, key);
    default:
      return null;
  }
}

function renderChildren(children: TiptapNode[] | undefined) {
  return (children ?? []).map((child, index) => renderNode(child, index)).filter(Boolean);
}

function applyMarks(text: string, marks: TiptapMark[] | undefined, key: number | string) {
  return (marks ?? []).reduce<ReactNode>((current, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong key={`${key}-bold`}>{current}</strong>;
      case "italic":
        return <em key={`${key}-italic`}>{current}</em>;
      case "strike":
        return <s key={`${key}-strike`}>{current}</s>;
      case "code":
        return (
          <code
            key={`${key}-code`}
            dir="ltr"
            className="rounded bg-line-soft px-1 py-0.5 text-[0.9em]"
          >
            {current}
          </code>
        );
      case "underline":
        return (
          <span key={`${key}-underline`} className="underline underline-offset-4">
            {current}
          </span>
        );
      case "link": {
        const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : undefined;

        if (!href) {
          return current;
        }

        return (
          <a
            key={`${key}-link`}
            href={href}
            className="font-semibold text-brand-ink underline decoration-1 underline-offset-4"
            rel="noreferrer"
          >
            {current}
          </a>
        );
      }
      case "internalEntryLink": {
        const targetSlug =
          typeof mark.attrs?.targetSlug === "string" ? mark.attrs.targetSlug : undefined;

        if (!targetSlug) {
          return current;
        }

        return (
          <Link
            key={`${key}-internal`}
            href={`/entries/${encodeURIComponent(targetSlug)}`}
            className="font-semibold text-brand-ink underline decoration-1 underline-offset-4"
          >
            {current}
          </Link>
        );
      }
      default:
        return current;
    }
  }, text);
}

function isTiptapNode(value: unknown): value is TiptapNode {
  return typeof value === "object" && value !== null && "type" in value;
}

function getNodeText(node: TiptapNode): string {
  if (node.type === "text") {
    return node.text ?? "";
  }

  return (node.content ?? []).map(getNodeText).join("");
}

function createHeadingId(title: string, key: number | string) {
  const normalizedTitle = title
    .trim()
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return `section-${key}-${normalizedTitle || "heading"}`;
}

function getDirection(attrs: Record<string, unknown> | undefined) {
  return attrs?.dir === "ltr" ? "ltr" : "rtl";
}

function getOrderedListStart(attrs: Record<string, unknown> | undefined) {
  return typeof attrs?.start === "number" && Number.isInteger(attrs.start) && attrs.start > 0
    ? attrs.start
    : undefined;
}

export type { TiptapHeading };
export { createTiptapHeadings, TiptapDocument };
