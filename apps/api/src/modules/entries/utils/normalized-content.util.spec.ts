import {
  convertMarkdownToTiptap,
  createDeterministicUuid,
  parseNormalizedEntryMarkdown,
} from "./normalized-content.util";
import { extractInternalEntryReferences } from "./tiptap-content.util";

const validMarkdown = `---
key: "sample-entry"
title: "نمونه"
slug: "نمونه"
summary: "خلاصه نمونه"
geographicScope: PROVINCE
province: "هرات"
district: null
category: "شعر و ادبیات"
contentType: "مقاله فرهنگی"
tags:
  - "نمونه"
sources:
  - title: "منبع نمونه"
    url: "https://example.com"
    author: "نویسنده"
    published: "2026-01-01"
internalLinks:
  - targetKey: "target-entry"
    anchorText: "پیوند داخلی"
reviewStatus: APPROVED
---

## معرفی

این یک متن **مهم** با [پیوند بیرونی](https://example.com) و پیوند داخلی است.
`;

describe("normalized content utilities", () => {
  it("parses approved normalized Markdown front matter", () => {
    const document = parseNormalizedEntryMarkdown("sample.md", validMarkdown);

    expect(document.frontMatter).toMatchObject({
      key: "sample-entry",
      reviewStatus: "APPROVED",
      geographicScope: "PROVINCE",
      province: "هرات",
      tags: ["نمونه"],
    });
    expect(document.frontMatter.sources[0]).toMatchObject({
      title: "منبع نمونه",
      url: "https://example.com",
    });
  });

  it("rejects national entries that still provide province data", () => {
    const invalidMarkdown = validMarkdown
      .replace("geographicScope: PROVINCE", "geographicScope: NATIONAL")
      .replace('province: "هرات"', 'province: "کابل"');

    expect(() => parseNormalizedEntryMarkdown("invalid.md", invalidMarkdown)).toThrow(
      "NATIONAL and NONE geographic scopes require empty province and district",
    );
  });

  it("converts Markdown into approved Tiptap JSON and plain text", () => {
    const result = convertMarkdownToTiptap("## عنوان\n\nمتن **درشت** و *کج*.");

    expect(result.contentJson).toMatchObject({
      type: "doc",
      content: [{ type: "heading", attrs: { level: 2 } }, { type: "paragraph" }],
    });
    expect(result.plainTextContent).toContain("عنوان");
    expect(result.plainTextContent).toContain("متن درشت و کج");
  });

  it("applies internal entry links as Tiptap marks", () => {
    const targetEntryId = createDeterministicUuid("test-entry", "target");
    const result = convertMarkdownToTiptap("متن دارای پیوند داخلی است.", [
      {
        targetKey: "target-entry",
        anchorText: "پیوند داخلی",
        targetEntryId,
        targetSlug: "هدف",
      },
    ]);

    expect(extractInternalEntryReferences(result.contentJson)).toEqual([
      {
        targetEntryId,
        targetSlug: "هدف",
        anchorText: "پیوند داخلی",
      },
    ]);
  });

  it("rejects invalid internal keys and non-normalized public slugs", () => {
    expect(() =>
      parseNormalizedEntryMarkdown(
        "invalid-key.md",
        validMarkdown.replace("sample-entry", "نمونه"),
      ),
    ).toThrow("key must be lowercase Latin kebab-case");

    expect(() =>
      parseNormalizedEntryMarkdown(
        "invalid-slug.md",
        validMarkdown.replace('slug: "نمونه"', 'slug: "نمونه آزمایشی"'),
      ),
    ).toThrow("slug must be normalized Persian URL text");
  });
});
