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
      <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-muted-foreground">
        متن این مطلب در دسترس نیست.
      </div>
    );
  }

  return (
    <div className="article-container mx-0 max-w-none space-y-5 text-[18px] leading-9 text-foreground">
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
  const textAlign = getTextAlignClass(node.attrs);

  switch (node.type) {
    case "paragraph":
      return (
        <p key={key} dir={getDirection(node.attrs)} className={cn("leading-9", textAlign)}>
          {children.length > 0 ? children : "\u00A0"}
        </p>
      );
    case "heading": {
      const level = node.attrs?.level === 3 ? 3 : 2;
      const headingText = getNodeText(node);
      const headingId = createHeadingId(headingText, key);
      const className = cn(
        "scroll-mt-32 pt-4 font-bold leading-[1.45] text-foreground",
        level === 3 ? "text-[24px]" : "text-[30px]",
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
        <ul key={key} className="list-disc space-y-2 pe-5 ps-0 marker:text-primary">
          {children}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={key} className="list-decimal space-y-2 pe-5 ps-0 marker:text-primary">
          {children}
        </ol>
      );
    case "listItem":
      return (
        <li key={key} className="leading-9">
          {children}
        </li>
      );
    case "blockquote":
      return (
        <blockquote
          key={key}
          className="border-s-4 border-primary bg-primary-light/50 py-4 ps-5 pe-4 text-foreground"
        >
          {children}
        </blockquote>
      );
    case "horizontalRule":
      return <hr key={key} className="border-border" />;
    case "hardBreak":
      return <br key={key} />;
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
            className="font-semibold text-primary underline underline-offset-4"
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
            className="font-semibold text-primary underline underline-offset-4"
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

function getTextAlignClass(attrs: Record<string, unknown> | undefined) {
  switch (attrs?.textAlign) {
    case "center":
      return "text-center";
    case "left":
      return "text-left";
    default:
      return "text-start";
  }
}

export type { TiptapHeading };
export { createTiptapHeadings, TiptapDocument };
