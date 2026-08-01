type TiptapDocument = Record<string, unknown>;

type TiptapNode = {
  type?: unknown;
  attrs?: unknown;
  content?: unknown;
  marks?: unknown;
  text?: unknown;
};

const ALLOWED_NODE_TYPES = new Set([
  "doc",
  "paragraph",
  "text",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
]);

const ALLOWED_MARK_TYPES = new Set(["bold", "italic", "underline", "link"]);
const TEXT_ALIGN_VALUES = new Set(["left", "center", "right", "justify", "start", "end"]);
const TEXT_DIRECTION_VALUES = new Set(["rtl", "ltr"]);

class TiptapValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TiptapValidationError";
  }
}

function validateTiptapDocument(document: unknown): asserts document is TiptapDocument {
  if (!isRecord(document)) {
    throw new TiptapValidationError("Tiptap content must be an object.");
  }

  validateNode(document, "root");

  if (document.type !== "doc") {
    throw new TiptapValidationError("Tiptap document root must be a doc node.");
  }
}

function extractPlainTextFromTiptap(document: unknown): string {
  validateTiptapDocument(document);

  const lines = collectTextLines(document);

  return lines
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

function validateNode(node: TiptapNode, path: string): void {
  if (!isRecord(node)) {
    throw new TiptapValidationError(`${path} must be an object.`);
  }

  if (typeof node.type !== "string" || !ALLOWED_NODE_TYPES.has(node.type)) {
    throw new TiptapValidationError(`Unsupported Tiptap node at ${path}.`);
  }

  validateNodeAttributes(node, path);
  validateMarks(node, path);

  if (node.type === "text") {
    validateTextNode(node, path);
    return;
  }

  if (node.text !== undefined) {
    throw new TiptapValidationError(`Only text nodes may contain text at ${path}.`);
  }

  if (node.content === undefined) {
    return;
  }

  if (!Array.isArray(node.content)) {
    throw new TiptapValidationError(`Node content must be an array at ${path}.`);
  }

  node.content.forEach((child, index) => {
    validateNode(child as TiptapNode, `${path}.${index}`);
  });
}

function validateTextNode(node: TiptapNode, path: string): void {
  if (node.content !== undefined) {
    throw new TiptapValidationError(`Text nodes cannot contain child content at ${path}.`);
  }

  if (typeof node.text !== "string") {
    throw new TiptapValidationError(`Text node must contain string text at ${path}.`);
  }

  if (/<\/?\s*(script|iframe|img|table|video|youtube)\b/i.test(node.text)) {
    throw new TiptapValidationError(`Unsupported embedded content at ${path}.`);
  }
}

function validateNodeAttributes(node: TiptapNode, path: string): void {
  if (node.attrs === undefined) {
    return;
  }

  if (!isRecord(node.attrs)) {
    throw new TiptapValidationError(`Node attributes must be an object at ${path}.`);
  }

  const attrs = node.attrs;
  const allowedAttributes = allowedNodeAttributes(node.type as string);

  for (const key of Object.keys(attrs)) {
    if (!allowedAttributes.has(key)) {
      throw new TiptapValidationError(`Unsupported node attribute "${key}" at ${path}.`);
    }
  }

  if (node.type === "heading" && attrs.level !== 2 && attrs.level !== 3) {
    throw new TiptapValidationError("Only heading levels 2 and 3 are allowed.");
  }

  validateOptionalEnum(attrs.textAlign, TEXT_ALIGN_VALUES, "textAlign", path);
  validateOptionalEnum(attrs.textDirection, TEXT_DIRECTION_VALUES, "textDirection", path);
  validateOptionalEnum(attrs.dir, TEXT_DIRECTION_VALUES, "dir", path);
}

function validateMarks(node: TiptapNode, path: string): void {
  if (node.marks === undefined) {
    return;
  }

  if (node.type !== "text") {
    throw new TiptapValidationError(`Only text nodes may contain marks at ${path}.`);
  }

  if (!Array.isArray(node.marks)) {
    throw new TiptapValidationError(`Marks must be an array at ${path}.`);
  }

  node.marks.forEach((mark, index) => {
    validateMark(mark, `${path}.marks.${index}`);
  });
}

function validateMark(mark: unknown, path: string): void {
  if (!isRecord(mark) || typeof mark.type !== "string" || !ALLOWED_MARK_TYPES.has(mark.type)) {
    throw new TiptapValidationError(`Unsupported Tiptap mark at ${path}.`);
  }

  if (mark.type === "link") {
    validateLinkMark(mark, path);
    return;
  }

  if (mark.attrs !== undefined && (!isRecord(mark.attrs) || Object.keys(mark.attrs).length > 0)) {
    throw new TiptapValidationError(`Unsupported mark attributes at ${path}.`);
  }
}

function validateLinkMark(mark: Record<string, unknown>, path: string): void {
  if (!isRecord(mark.attrs)) {
    throw new TiptapValidationError(`Link mark attributes are required at ${path}.`);
  }

  const allowedAttributes = new Set(["href", "target", "rel", "class"]);

  for (const key of Object.keys(mark.attrs)) {
    if (!allowedAttributes.has(key)) {
      throw new TiptapValidationError(`Unsupported link attribute "${key}" at ${path}.`);
    }
  }

  const href = mark.attrs.href;

  if (typeof href !== "string" || !isSafeLink(href)) {
    throw new TiptapValidationError(`Invalid link href at ${path}.`);
  }
}

function collectTextLines(node: TiptapNode): string[] {
  if (node.type === "text") {
    return typeof node.text === "string" ? [node.text] : [];
  }

  const childLines = Array.isArray(node.content)
    ? node.content.flatMap((child) => collectTextLines(child as TiptapNode))
    : [];

  if (isBlockNode(node.type)) {
    return [childLines.join(" ")];
  }

  return childLines;
}

function allowedNodeAttributes(nodeType: string): Set<string> {
  switch (nodeType) {
    case "heading":
      return new Set(["level", "textAlign", "textDirection", "dir"]);
    case "paragraph":
    case "blockquote":
      return new Set(["textAlign", "textDirection", "dir"]);
    default:
      return new Set();
  }
}

function isBlockNode(nodeType: unknown): boolean {
  return (
    nodeType === "paragraph" ||
    nodeType === "heading" ||
    nodeType === "listItem" ||
    nodeType === "blockquote"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateOptionalEnum(
  value: unknown,
  allowedValues: Set<string>,
  attribute: string,
  path: string,
): void {
  if (value !== undefined && (typeof value !== "string" || !allowedValues.has(value))) {
    throw new TiptapValidationError(`Invalid ${attribute} value at ${path}.`);
  }
}

function isSafeLink(href: string): boolean {
  try {
    const url = new URL(href);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export type { TiptapDocument };
export { extractPlainTextFromTiptap, TiptapValidationError, validateTiptapDocument };
