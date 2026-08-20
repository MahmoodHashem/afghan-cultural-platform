import type { RichTextContent } from "@/components/common/rich-text-editor";

const emptyTiptapDocument: RichTextContent = {
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

function createEmptyTiptapDocument(): RichTextContent {
  return emptyTiptapDocument;
}

function isTiptapDocument(value: unknown): value is RichTextContent {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    (value as { type?: unknown }).type === "doc"
  );
}

function extractTiptapPlainText(content: unknown) {
  if (!isTiptapDocument(content)) {
    return "";
  }

  const parts: string[] = [];
  collectText(content, parts);

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function hasTiptapPlainText(content: unknown) {
  return extractTiptapPlainText(content).length > 0;
}

function collectText(node: RichTextContent, parts: string[]) {
  if (typeof node.text === "string") {
    parts.push(node.text);
  }

  if (!Array.isArray(node.content)) {
    return;
  }

  for (const childNode of node.content) {
    collectText(childNode, parts);
  }
}

export { createEmptyTiptapDocument, extractTiptapPlainText, hasTiptapPlainText, isTiptapDocument };
