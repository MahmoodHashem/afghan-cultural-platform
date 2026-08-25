type TiptapDocument = Record<string, unknown>;

type TiptapNode = {
  type?: unknown;
  attrs?: unknown;
  content?: unknown;
  marks?: unknown;
  text?: unknown;
};

type InternalEntryReference = {
  targetEntryId: string;
  targetSlug: string | null;
  anchorText: string;
};

const ALLOWED_NODE_TYPES = new Set([
  "doc",
  "paragraph",
  "text",
  "hardBreak",
  "horizontalRule",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "codeBlock",
]);

const ALLOWED_MARK_TYPES = new Set([
  "bold",
  "italic",
  "strike",
  "code",
  "underline",
  "link",
  "internalEntryLink",
  "textStyle",
]);
const TEXT_ALIGN_VALUES = new Set(["left", "center", "right", "justify", "start", "end"]);
const TEXT_DIRECTION_VALUES = new Set(["rtl", "ltr"]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function extractInternalEntryReferences(document: unknown): InternalEntryReference[] {
  validateTiptapDocument(document);

  return collectInternalEntryReferences(document);
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

  if (
    node.type === "orderedList" &&
    attrs.start !== undefined &&
    (typeof attrs.start !== "number" || !Number.isInteger(attrs.start) || attrs.start < 1)
  ) {
    throw new TiptapValidationError(`Invalid ordered-list start value at ${path}.`);
  }

  if (
    (node.type === "orderedList" || node.type === "bulletList") &&
    attrs.type !== undefined &&
    attrs.type !== null &&
    typeof attrs.type !== "string"
  ) {
    throw new TiptapValidationError(`Invalid list type at ${path}.`);
  }

  if (
    node.type === "codeBlock" &&
    attrs.language !== undefined &&
    attrs.language !== null &&
    (typeof attrs.language !== "string" || !/^[a-z0-9_+#.-]{1,40}$/i.test(attrs.language))
  ) {
    throw new TiptapValidationError(`Invalid code-block language at ${path}.`);
  }
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

  if (mark.type === "internalEntryLink") {
    validateInternalEntryLinkMark(mark, path);
    return;
  }

  if (mark.attrs !== undefined && (!isRecord(mark.attrs) || Object.keys(mark.attrs).length > 0)) {
    throw new TiptapValidationError(`Unsupported mark attributes at ${path}.`);
  }
}

function validateInternalEntryLinkMark(mark: Record<string, unknown>, path: string): void {
  if (!isRecord(mark.attrs)) {
    throw new TiptapValidationError(`Internal entry link attributes are required at ${path}.`);
  }

  const allowedAttributes = new Set(["targetEntryId", "targetSlug"]);

  for (const key of Object.keys(mark.attrs)) {
    if (!allowedAttributes.has(key)) {
      throw new TiptapValidationError(
        `Unsupported internal entry link attribute "${key}" at ${path}.`,
      );
    }
  }

  if (
    typeof mark.attrs.targetEntryId !== "string" ||
    !UUID_PATTERN.test(mark.attrs.targetEntryId)
  ) {
    throw new TiptapValidationError(`Invalid internal entry target ID at ${path}.`);
  }

  if (
    mark.attrs.targetSlug !== undefined &&
    mark.attrs.targetSlug !== null &&
    typeof mark.attrs.targetSlug !== "string"
  ) {
    throw new TiptapValidationError(`Invalid internal entry target slug at ${path}.`);
  }
}

function validateLinkMark(mark: Record<string, unknown>, path: string): void {
  if (!isRecord(mark.attrs)) {
    throw new TiptapValidationError(`Link mark attributes are required at ${path}.`);
  }

  const allowedAttributes = new Set(["href", "target", "rel", "class", "title"]);

  for (const key of Object.keys(mark.attrs)) {
    if (!allowedAttributes.has(key)) {
      throw new TiptapValidationError(`Unsupported link attribute "${key}" at ${path}.`);
    }
  }

  const href = mark.attrs.href;

  if (typeof href !== "string" || !isSafeLink(href)) {
    throw new TiptapValidationError(`Invalid link href at ${path}.`);
  }

  validateOptionalStringAttribute(mark.attrs.target, "target", path);
  validateOptionalStringAttribute(mark.attrs.rel, "rel", path);
  validateOptionalStringAttribute(mark.attrs.class, "class", path);
  validateOptionalStringAttribute(mark.attrs.title, "title", path);
}

function validateOptionalStringAttribute(value: unknown, attribute: string, path: string): void {
  if (value !== undefined && value !== null && typeof value !== "string") {
    throw new TiptapValidationError(`Invalid link ${attribute} at ${path}.`);
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

function collectInternalEntryReferences(node: TiptapNode): InternalEntryReference[] {
  const references: InternalEntryReference[] = [];

  if (node.type === "text" && typeof node.text === "string" && Array.isArray(node.marks)) {
    for (const mark of node.marks) {
      if (isRecord(mark) && mark.type === "internalEntryLink" && isRecord(mark.attrs)) {
        references.push({
          targetEntryId: mark.attrs.targetEntryId as string,
          targetSlug:
            typeof mark.attrs.targetSlug === "string" && mark.attrs.targetSlug.trim()
              ? mark.attrs.targetSlug.trim()
              : null,
          anchorText: node.text.replace(/\s+/g, " ").trim(),
        });
      }
    }
  }

  if (Array.isArray(node.content)) {
    references.push(
      ...node.content.flatMap((child) => collectInternalEntryReferences(child as TiptapNode)),
    );
  }

  return references.filter((reference) => reference.anchorText.length > 0);
}

function allowedNodeAttributes(nodeType: string): Set<string> {
  switch (nodeType) {
    case "heading":
      return new Set(["level", "textAlign", "textDirection", "dir"]);
    case "paragraph":
    case "blockquote":
      return new Set(["textAlign", "textDirection", "dir"]);
    case "orderedList":
      return new Set(["start", "type"]);
    case "bulletList":
      return new Set(["type"]);
    case "codeBlock":
      return new Set(["language"]);
    default:
      return new Set();
  }
}

function isBlockNode(nodeType: unknown): boolean {
  return (
    nodeType === "paragraph" ||
    nodeType === "heading" ||
    nodeType === "listItem" ||
    nodeType === "blockquote" ||
    nodeType === "codeBlock"
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

export type { InternalEntryReference, TiptapDocument };
export {
  extractInternalEntryReferences,
  extractPlainTextFromTiptap,
  TiptapValidationError,
  validateTiptapDocument,
};
