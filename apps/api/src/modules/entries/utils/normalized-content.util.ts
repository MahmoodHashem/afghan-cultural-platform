import { createHash } from "node:crypto";

import { isValidEntryKey, isValidEntrySlug } from "./entry-slug.util";
import {
  extractInternalEntryReferences,
  extractPlainTextFromTiptap,
  type TiptapDocument,
  validateTiptapDocument,
} from "./tiptap-content.util";

type ReviewStatus = "APPROVED" | "NEEDS_REVIEW" | "READY";
type NormalizedGeographicScope = "PROVINCE" | "NATIONAL" | "NONE";

type NormalizedSource = {
  title: string;
  url: string | null;
  author: string | null;
  published: string | null;
};

type NormalizedInternalLink = {
  targetKey: string;
  anchorText: string;
};

type NormalizedEntryFrontMatter = {
  key: string;
  title: string;
  slug: string;
  summary: string;
  geographicScope: NormalizedGeographicScope;
  province: string | null;
  district: string | null;
  category: string;
  contentType: string;
  tags: string[];
  sources: NormalizedSource[];
  internalLinks: NormalizedInternalLink[];
  reviewStatus: ReviewStatus;
};

type NormalizedEntryDocument = {
  fileName: string;
  frontMatter: NormalizedEntryFrontMatter;
  body: string;
};

type MarkdownConversionResult = {
  contentJson: TiptapDocument;
  plainTextContent: string;
};

type ResolvedInternalLink = NormalizedInternalLink & {
  targetEntryId: string;
  targetSlug: string | null;
};

type ValidationIssue = {
  fileName: string;
  message: string;
};

type FrontMatterValue = string | null | string[] | NormalizedSource[] | NormalizedInternalLink[];

const REQUIRED_FIELDS = [
  "key",
  "title",
  "slug",
  "summary",
  "geographicScope",
  "category",
  "contentType",
  "tags",
  "sources",
  "internalLinks",
  "reviewStatus",
] as const;
const GEOGRAPHIC_SCOPES = new Set(["PROVINCE", "NATIONAL", "NONE"]);
const REVIEW_STATUSES = new Set(["APPROVED", "NEEDS_REVIEW", "READY"]);
const UNSUPPORTED_HTML_PATTERN = /<\/?\s*(script|iframe|table|img|video|youtube)\b/i;

function parseNormalizedEntryMarkdown(fileName: string, markdown: string): NormalizedEntryDocument {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/u.exec(markdown);

  if (!match) {
    throw new Error(`${fileName}: front matter block is required.`);
  }

  const [, frontMatterText, body] = match;
  const frontMatter = parseFrontMatter(fileName, frontMatterText);
  validateNormalizedEntryDocument({ fileName, frontMatter, body });

  return {
    fileName,
    frontMatter,
    body: body.trim(),
  };
}

function validateNormalizedEntryDocument(document: NormalizedEntryDocument): void {
  const { fileName, frontMatter, body } = document;

  for (const field of REQUIRED_FIELDS) {
    if (frontMatter[field] === undefined) {
      throw new Error(`${fileName}: required front matter field "${field}" is missing.`);
    }
  }

  if (!frontMatter.key.trim()) {
    throw new Error(`${fileName}: key is required.`);
  }

  if (!isValidEntryKey(frontMatter.key)) {
    throw new Error(`${fileName}: key must be lowercase Latin kebab-case.`);
  }

  if (!frontMatter.title.trim()) {
    throw new Error(`${fileName}: title is required.`);
  }

  if (!frontMatter.slug.trim()) {
    throw new Error(`${fileName}: slug is required.`);
  }

  if (!isValidEntrySlug(frontMatter.slug)) {
    throw new Error(`${fileName}: slug must be normalized Persian URL text.`);
  }

  if (!frontMatter.summary.trim()) {
    throw new Error(`${fileName}: summary is required.`);
  }

  if (!GEOGRAPHIC_SCOPES.has(frontMatter.geographicScope)) {
    throw new Error(`${fileName}: geographicScope is invalid.`);
  }

  if (frontMatter.geographicScope === "PROVINCE" && !frontMatter.province) {
    throw new Error(`${fileName}: PROVINCE geographicScope requires province.`);
  }

  if (
    frontMatter.geographicScope !== "PROVINCE" &&
    (frontMatter.province || frontMatter.district)
  ) {
    throw new Error(
      `${fileName}: NATIONAL and NONE geographic scopes require empty province and district.`,
    );
  }

  if (!Array.isArray(frontMatter.tags)) {
    throw new Error(`${fileName}: tags must be an array.`);
  }

  if (!Array.isArray(frontMatter.sources)) {
    throw new Error(`${fileName}: sources must be an array.`);
  }

  if (!Array.isArray(frontMatter.internalLinks)) {
    throw new Error(`${fileName}: internalLinks must be an array.`);
  }

  if (!REVIEW_STATUSES.has(frontMatter.reviewStatus)) {
    throw new Error(`${fileName}: reviewStatus is invalid.`);
  }

  validateSources(fileName, frontMatter.sources);
  validateInternalLinks(fileName, frontMatter.internalLinks);

  if (!body.trim()) {
    throw new Error(`${fileName}: Markdown body is required.`);
  }

  if (UNSUPPORTED_HTML_PATTERN.test(body)) {
    throw new Error(`${fileName}: unsupported embedded HTML is not allowed.`);
  }
}

function convertMarkdownToTiptap(
  markdown: string,
  internalLinks: ResolvedInternalLink[] = [],
): MarkdownConversionResult {
  const content = parseMarkdownBlocks(markdown.trim());
  const contentJson: TiptapDocument = {
    type: "doc",
    content: applyInternalLinksToBlocks(content, internalLinks),
  };

  validateTiptapDocument(contentJson);

  return {
    contentJson,
    plainTextContent: extractPlainTextFromTiptap(contentJson),
  };
}

function validateInternalLinkConsistency(contentJson: TiptapDocument): void {
  validateTiptapDocument(contentJson);
  extractInternalEntryReferences(contentJson);
}

function createDeterministicUuid(namespace: string, key: string): string {
  const hash = createHash("sha256").update(`${namespace}:${key}`).digest("hex");
  const chars = hash.slice(0, 32).split("");

  chars[12] = "5";
  chars[16] = ((Number.parseInt(chars[16] ?? "0", 16) & 0x3) | 0x8).toString(16);

  return [
    chars.slice(0, 8).join(""),
    chars.slice(8, 12).join(""),
    chars.slice(12, 16).join(""),
    chars.slice(16, 20).join(""),
    chars.slice(20, 32).join(""),
  ].join("-");
}

function parseFrontMatter(fileName: string, input: string): NormalizedEntryFrontMatter {
  const lines = input.split(/\r?\n/u);
  const values = new Map<string, FrontMatterValue>();
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith("  ")) {
      throw new Error(`${fileName}: unexpected nested front matter line "${line}".`);
    }

    const fieldMatch = /^([A-Za-z][A-Za-z0-9]*):(?:\s*(.*))?$/u.exec(line);

    if (!fieldMatch) {
      throw new Error(`${fileName}: invalid front matter line "${line}".`);
    }

    const [, key, rawValue = ""] = fieldMatch;

    if (rawValue.trim() === "") {
      const collection = parseCollection(fileName, lines, index + 1);

      values.set(key, collection.value);
      index = collection.nextIndex;
      continue;
    }

    values.set(key, parseTopLevelScalar(rawValue.trim()));
    index += 1;
  }

  return coerceFrontMatter(fileName, values);
}

function parseCollection(
  fileName: string,
  lines: string[],
  startIndex: number,
): { value: FrontMatterValue; nextIndex: number } {
  const items: Array<string | Record<string, string | null>> = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (!line.startsWith("  - ")) {
      break;
    }

    const itemText = line.slice(4).trim();

    if (/^[A-Za-z][A-Za-z0-9]*:/u.test(itemText)) {
      const item: Record<string, string | null> = {};
      const firstProperty = parseInlineProperty(fileName, itemText);

      item[firstProperty.key] = firstProperty.value;
      index += 1;

      while (index < lines.length && lines[index].startsWith("    ")) {
        const propertyLine = lines[index].trim();
        const property = parseInlineProperty(fileName, propertyLine);

        item[property.key] = property.value;
        index += 1;
      }

      items.push(item);
      continue;
    }

    items.push(parseScalar(itemText) ?? "");
    index += 1;
  }

  return {
    value: normalizeCollection(items),
    nextIndex: index,
  };
}

function normalizeCollection(
  items: Array<string | Record<string, string | null>>,
): FrontMatterValue {
  if (items.every((item): item is string => typeof item === "string")) {
    return items;
  }

  return items as NormalizedSource[] | NormalizedInternalLink[];
}

function parseInlineProperty(
  fileName: string,
  input: string,
): { key: string; value: string | null } {
  const match = /^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/u.exec(input);

  if (!match) {
    throw new Error(`${fileName}: invalid object property "${input}".`);
  }

  return {
    key: match[1],
    value: parseScalar(match[2].trim()),
  };
}

function parseTopLevelScalar(input: string): FrontMatterValue {
  if (input === "[]") {
    return [];
  }

  return parseScalar(input);
}

function parseScalar(input: string): string | null {
  if (input === "null" || input === "") {
    return null;
  }

  if (input.startsWith('"') && input.endsWith('"')) {
    return input.slice(1, -1).replace(/\\"/g, '"');
  }

  return input;
}

function coerceFrontMatter(
  fileName: string,
  values: Map<string, FrontMatterValue>,
): NormalizedEntryFrontMatter {
  return {
    key: requireString(fileName, values, "key"),
    title: requireString(fileName, values, "title"),
    slug: requireString(fileName, values, "slug"),
    summary: requireString(fileName, values, "summary"),
    geographicScope: requireEnum(
      fileName,
      values,
      "geographicScope",
      GEOGRAPHIC_SCOPES,
    ) as NormalizedGeographicScope,
    province: optionalString(fileName, values, "province"),
    district: optionalString(fileName, values, "district"),
    category: requireString(fileName, values, "category"),
    contentType: requireString(fileName, values, "contentType"),
    tags: requireStringArray(fileName, values, "tags"),
    sources: requireSources(fileName, values),
    internalLinks: requireInternalLinks(fileName, values),
    reviewStatus: requireEnum(fileName, values, "reviewStatus", REVIEW_STATUSES) as ReviewStatus,
  };
}

function requireString(
  fileName: string,
  values: Map<string, FrontMatterValue>,
  key: string,
): string {
  const value = values.get(key);

  if (typeof value !== "string") {
    throw new Error(`${fileName}: ${key} must be a string.`);
  }

  return value;
}

function optionalString(
  fileName: string,
  values: Map<string, FrontMatterValue>,
  key: string,
): string | null {
  const value = values.get(key);

  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(`${fileName}: ${key} must be a string or null.`);
  }

  return value;
}

function requireEnum(
  fileName: string,
  values: Map<string, FrontMatterValue>,
  key: string,
  allowedValues: Set<string>,
): string {
  const value = requireString(fileName, values, key);

  if (!allowedValues.has(value)) {
    throw new Error(`${fileName}: ${key} has unsupported value "${value}".`);
  }

  return value;
}

function requireStringArray(
  fileName: string,
  values: Map<string, FrontMatterValue>,
  key: string,
): string[] {
  const value = values.get(key);

  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`${fileName}: ${key} must be a string array.`);
  }

  return value.map((item) => item.trim()).filter(Boolean);
}

function requireSources(
  fileName: string,
  values: Map<string, FrontMatterValue>,
): NormalizedSource[] {
  const value = values.get("sources");

  if (!Array.isArray(value)) {
    throw new Error(`${fileName}: sources must be an array.`);
  }

  return value.map((item) => {
    if (typeof item === "string") {
      throw new Error(`${fileName}: source items must be objects.`);
    }

    return {
      title: requireObjectString(fileName, item, "title"),
      url: optionalObjectString(fileName, item, "url"),
      author: optionalObjectString(fileName, item, "author"),
      published: optionalObjectString(fileName, item, "published"),
    };
  });
}

function requireInternalLinks(
  fileName: string,
  values: Map<string, FrontMatterValue>,
): NormalizedInternalLink[] {
  const value = values.get("internalLinks");

  if (!Array.isArray(value)) {
    throw new Error(`${fileName}: internalLinks must be an array.`);
  }

  return value.map((item) => {
    if (typeof item === "string") {
      throw new Error(`${fileName}: internal link items must be objects.`);
    }

    return {
      targetKey: requireObjectString(fileName, item, "targetKey"),
      anchorText: requireObjectString(fileName, item, "anchorText"),
    };
  });
}

function requireObjectString(
  fileName: string,
  item: Record<string, string | null>,
  key: string,
): string {
  const value = item[key];

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fileName}: object property ${key} is required.`);
  }

  return value.trim();
}

function optionalObjectString(
  fileName: string,
  item: Record<string, string | null>,
  key: string,
): string | null {
  const value = item[key];

  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(`${fileName}: object property ${key} must be a string or null.`);
  }

  return value.trim();
}

function validateSources(fileName: string, sources: NormalizedSource[]): void {
  sources.forEach((source, index) => {
    if (!source.title.trim()) {
      throw new Error(`${fileName}: source ${index + 1} title is required.`);
    }

    if (source.url) {
      try {
        const url = new URL(source.url);

        if (url.protocol !== "http:" && url.protocol !== "https:") {
          throw new Error("invalid protocol");
        }
      } catch {
        throw new Error(`${fileName}: source ${index + 1} URL is invalid.`);
      }
    }
  });
}

function validateInternalLinks(fileName: string, internalLinks: NormalizedInternalLink[]): void {
  const keys = new Set<string>();

  internalLinks.forEach((link, index) => {
    if (!link.targetKey.trim()) {
      throw new Error(`${fileName}: internal link ${index + 1} targetKey is required.`);
    }

    if (!link.anchorText.trim()) {
      throw new Error(`${fileName}: internal link ${index + 1} anchorText is required.`);
    }

    const duplicateKey = `${link.targetKey}:${link.anchorText}`;

    if (keys.has(duplicateKey)) {
      throw new Error(`${fileName}: duplicate internal link ${duplicateKey}.`);
    }

    keys.add(duplicateKey);
  });
}

type TiptapNode = Record<string, unknown>;

function parseMarkdownBlocks(markdown: string): TiptapNode[] {
  const blocks: TiptapNode[] = [];
  const lines = markdown.split(/\r?\n/u);
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const heading = /^(#{2,3})\s+(.+)$/u.exec(line);

    if (heading) {
      blocks.push({
        type: "heading",
        attrs: { level: heading[1].length, textDirection: "rtl" },
        content: parseInlineContent(heading[2]),
      });
      index += 1;
      continue;
    }

    if (/^>\s?/u.test(line)) {
      const quoteLines: string[] = [];

      while (index < lines.length && /^>\s?/u.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^>\s?/u, ""));
        index += 1;
      }

      blocks.push({
        type: "blockquote",
        attrs: { textDirection: "rtl" },
        content: [
          {
            type: "paragraph",
            attrs: { textDirection: "rtl" },
            content: parseInlineContent(quoteLines.join(" ")),
          },
        ],
      });
      continue;
    }

    if (/^\s*[-*]\s+/u.test(line)) {
      const result = parseList(lines, index, "bulletList", /^\s*[-*]\s+/u);

      blocks.push(result.node);
      index = result.nextIndex;
      continue;
    }

    if (/^\s*\d+\.\s+/u.test(line)) {
      const result = parseList(lines, index, "orderedList", /^\s*\d+\.\s+/u);

      blocks.push(result.node);
      index = result.nextIndex;
      continue;
    }

    const paragraphLines: string[] = [];

    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{2,3})\s+/u.test(lines[index]) &&
      !/^>\s?/u.test(lines[index]) &&
      !/^\s*[-*]\s+/u.test(lines[index]) &&
      !/^\s*\d+\.\s+/u.test(lines[index])
    ) {
      paragraphLines.push(lines[index]);
      index += 1;
    }

    blocks.push({
      type: "paragraph",
      attrs: { textDirection: "rtl" },
      content: parseInlineContent(paragraphLines.join(" ")),
    });
  }

  return blocks.length > 0
    ? blocks
    : [{ type: "paragraph", attrs: { textDirection: "rtl" }, content: [] }];
}

function parseList(
  lines: string[],
  startIndex: number,
  type: "bulletList" | "orderedList",
  markerPattern: RegExp,
): { node: TiptapNode; nextIndex: number } {
  const content: TiptapNode[] = [];
  let index = startIndex;

  while (index < lines.length && markerPattern.test(lines[index])) {
    const text = lines[index].replace(markerPattern, "");

    content.push({
      type: "listItem",
      content: [
        {
          type: "paragraph",
          attrs: { textDirection: "rtl" },
          content: parseInlineContent(text),
        },
      ],
    });
    index += 1;
  }

  return {
    node: { type, content },
    nextIndex: index,
  };
}

function parseInlineContent(text: string): TiptapNode[] {
  const nodes: TiptapNode[] = [];
  const tokenPattern = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/gu;
  let lastIndex = 0;

  for (const match of text.matchAll(tokenPattern)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      nodes.push(createTextNode(text.slice(lastIndex, index)));
    }

    nodes.push(createMarkedTextNode(match[0]));
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(createTextNode(text.slice(lastIndex)));
  }

  return nodes.filter((node) => typeof node.text !== "string" || node.text.length > 0);
}

function createMarkedTextNode(token: string): TiptapNode {
  const link = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/u.exec(token);

  if (link) {
    return createTextNode(link[1], [
      {
        type: "link",
        attrs: {
          href: link[2],
          target: "_blank",
          rel: "noopener noreferrer",
        },
      },
    ]);
  }

  if (token.startsWith("**")) {
    return createTextNode(token.slice(2, -2), [{ type: "bold" }]);
  }

  return createTextNode(token.slice(1, -1), [{ type: "italic" }]);
}

function createTextNode(text: string, marks?: TiptapNode[]): TiptapNode {
  const node: TiptapNode = {
    type: "text",
    text,
  };

  if (marks && marks.length > 0) {
    node.marks = marks;
  }

  return node;
}

function applyInternalLinksToBlocks(
  blocks: TiptapNode[],
  internalLinks: ResolvedInternalLink[],
): TiptapNode[] {
  return internalLinks.reduce((currentBlocks, link) => {
    const result = applyInternalLinkToBlocks(currentBlocks, link);

    if (!result.applied) {
      throw new Error(`Internal link anchor text was not found: ${link.anchorText}`);
    }

    return result.blocks;
  }, blocks);
}

function applyInternalLinkToBlocks(
  blocks: TiptapNode[],
  link: ResolvedInternalLink,
): { blocks: TiptapNode[]; applied: boolean } {
  let applied = false;

  const nextBlocks = blocks.map((block) => {
    if (applied) {
      return block;
    }

    const result = applyInternalLinkToNode(block, link);

    applied = result.applied;

    return result.node;
  });

  return { blocks: nextBlocks, applied };
}

function applyInternalLinkToNode(
  node: TiptapNode,
  link: ResolvedInternalLink,
): { node: TiptapNode; applied: boolean } {
  if (node.type === "text" && typeof node.text === "string") {
    return applyInternalLinkToTextNode(node, link);
  }

  if (!Array.isArray(node.content)) {
    return { node, applied: false };
  }

  let applied = false;
  const content = node.content.flatMap((child) => {
    if (applied || !isRecord(child)) {
      return [child];
    }

    const result = applyInternalLinkToNode(child, link);

    applied = result.applied;

    if (result.node.type === "fragment" && Array.isArray(result.node.content)) {
      return result.node.content;
    }

    return [result.node];
  });

  return {
    node: {
      ...node,
      content,
    },
    applied,
  };
}

function applyInternalLinkToTextNode(
  node: TiptapNode,
  link: ResolvedInternalLink,
): { node: TiptapNode; applied: boolean } {
  const text = node.text;

  if (typeof text !== "string") {
    return { node, applied: false };
  }

  const index = text.indexOf(link.anchorText);

  if (index === -1) {
    return { node, applied: false };
  }

  const before = text.slice(0, index);
  const linked = text.slice(index, index + link.anchorText.length);
  const after = text.slice(index + link.anchorText.length);
  const existingMarks = Array.isArray(node.marks) ? node.marks : [];
  const internalMark = {
    type: "internalEntryLink",
    attrs: {
      targetEntryId: link.targetEntryId,
      targetSlug: link.targetSlug,
    },
  };
  const replacement = [
    before ? createTextNode(before, existingMarks) : null,
    createTextNode(linked, [...existingMarks, internalMark]),
    after ? createTextNode(after, existingMarks) : null,
  ].filter((child): child is TiptapNode => child !== null);

  if (replacement.length === 1) {
    return { node: replacement[0], applied: true };
  }

  return {
    node: {
      type: "fragment",
      content: replacement,
    },
    applied: true,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type {
  MarkdownConversionResult,
  NormalizedEntryDocument,
  NormalizedEntryFrontMatter,
  NormalizedGeographicScope,
  NormalizedInternalLink,
  NormalizedSource,
  ResolvedInternalLink,
  ReviewStatus,
  ValidationIssue,
};
export {
  convertMarkdownToTiptap,
  createDeterministicUuid,
  parseNormalizedEntryMarkdown,
  validateInternalLinkConsistency,
  validateNormalizedEntryDocument,
};
