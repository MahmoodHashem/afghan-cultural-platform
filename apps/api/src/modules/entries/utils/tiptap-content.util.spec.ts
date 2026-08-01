import {
  extractInternalEntryReferences,
  extractPlainTextFromTiptap,
  TiptapValidationError,
  validateTiptapDocument,
} from "@/modules/entries/utils/tiptap-content.util";

const validDocument = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: {
        level: 2,
        textAlign: "right",
        textDirection: "rtl",
      },
      content: [{ type: "text", text: "عنوان فرهنگی" }],
    },
    {
      type: "paragraph",
      attrs: {
        textDirection: "rtl",
      },
      content: [
        { type: "text", text: "متن اول " },
        {
          type: "text",
          text: "لینک",
          marks: [{ type: "link", attrs: { href: "https://example.com" } }],
        },
      ],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "مورد فهرست" }] }],
        },
      ],
    },
  ],
};

describe("Tiptap content utilities", () => {
  it("accepts the approved basic Tiptap schema", () => {
    expect(() => validateTiptapDocument(validDocument)).not.toThrow();
  });

  it("extracts readable plain text with paragraph and list separation", () => {
    expect(extractPlainTextFromTiptap(validDocument)).toBe(
      ["عنوان فرهنگی", "متن اول لینک", "مورد فهرست"].join("\n"),
    );
  });

  it("handles empty content safely", () => {
    expect(extractPlainTextFromTiptap({ type: "doc", content: [] })).toBe("");
  });

  it("rejects unsupported nodes such as images", () => {
    expect(() =>
      validateTiptapDocument({
        type: "doc",
        content: [{ type: "image", attrs: { src: "https://example.com/image.jpg" } }],
      }),
    ).toThrow(TiptapValidationError);
  });

  it("accepts and extracts internal entry link marks", () => {
    const document = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: " کابل ",
              marks: [
                {
                  type: "internalEntryLink",
                  attrs: {
                    targetEntryId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
                    targetSlug: "kabul",
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    expect(() => validateTiptapDocument(document)).not.toThrow();
    expect(extractInternalEntryReferences(document)).toEqual([
      {
        targetEntryId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        targetSlug: "kabul",
        anchorText: "کابل",
      },
    ]);
  });

  it("rejects malformed internal entry link marks", () => {
    expect(() =>
      validateTiptapDocument({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "کابل",
                marks: [{ type: "internalEntryLink", attrs: { targetEntryId: "entry-id" } }],
              },
            ],
          },
        ],
      }),
    ).toThrow(TiptapValidationError);
  });

  it("rejects unsafe JavaScript links", () => {
    expect(() =>
      validateTiptapDocument({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "بد",
                marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
              },
            ],
          },
        ],
      }),
    ).toThrow(TiptapValidationError);
  });
});
