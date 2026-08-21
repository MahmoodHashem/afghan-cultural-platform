import { mapEntry } from "@/modules/entries/entries.mapper";

describe("mapEntry", () => {
  it("exposes only the latest safe moderation feedback on an owned entry", () => {
    const createdAt = new Date("2026-08-20T10:00:00.000Z");
    const entry = createEntryPayload({
      moderationReviews: [
        {
          id: "review-1",
          decision: "REQUEST_CHANGES",
          comments: "لطفاً منبع تصویر را روشن کنید.",
          previousStatus: "PENDING_REVIEW",
          nextStatus: "CHANGES_REQUESTED",
          createdAt,
          moderator: {
            id: "moderator-1",
            displayName: "بررسی‌کننده",
          },
        },
      ],
    });

    expect(mapEntry(entry as never).latestModerationReview).toEqual({
      id: "review-1",
      decision: "REQUEST_CHANGES",
      comments: "لطفاً منبع تصویر را روشن کنید.",
      previousStatus: "PENDING_REVIEW",
      nextStatus: "CHANGES_REQUESTED",
      createdAt,
      moderator: {
        id: "moderator-1",
        displayName: "بررسی‌کننده",
      },
    });
  });

  it("returns null when an entry has no moderation feedback", () => {
    expect(mapEntry(createEntryPayload() as never).latestModerationReview).toBeNull();
  });
});

function createEntryPayload(overrides: Record<string, unknown> = {}) {
  const timestamp = new Date("2026-08-20T09:00:00.000Z");

  return {
    id: "entry-1",
    key: "entry-1",
    slug: "مطلب-نمونه",
    title: "مطلب نمونه",
    summary: "خلاصه مطلب نمونه",
    contentJson: { type: "doc", content: [] },
    plainTextContent: "متن مطلب نمونه",
    status: "CHANGES_REQUESTED",
    geographicScope: "NONE",
    authorId: "author-1",
    provinceId: null,
    districtId: null,
    categoryId: "category-1",
    contentTypeId: "content-type-1",
    villageOrLocation: null,
    author: { id: "author-1", displayName: "نویسنده" },
    province: null,
    district: null,
    category: { id: "category-1", name: "تاریخ", slug: "history" },
    contentType: { id: "content-type-1", name: "مقاله", slug: "article" },
    tags: [],
    sources: [],
    images: [],
    youtubeVideo: null,
    moderationReviews: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}
