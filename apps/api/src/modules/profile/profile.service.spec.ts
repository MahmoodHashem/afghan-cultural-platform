jest.mock("@/database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import { BadRequestException, NotFoundException } from "@nestjs/common";

import type { PrismaService } from "@/database/prisma.service";
import { EntryStatus, PublicReviewStatus, UserRole, UserStatus } from "@/generated/prisma/enums";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import { PROFILE_ERROR_CODES } from "@/modules/profile/profile.constants";
import { ProfileService } from "@/modules/profile/profile.service";

type DelegateMock = {
  count: jest.Mock;
  create: jest.Mock;
  deleteMany: jest.Mock;
  findFirst: jest.Mock;
  findMany: jest.Mock;
  findUnique: jest.Mock;
  groupBy: jest.Mock;
  update: jest.Mock;
  upsert: jest.Mock;
};

type PrismaMock = {
  bookmark: DelegateMock;
  culturalEntry: DelegateMock;
  province: DelegateMock;
  publicReview: DelegateMock;
  user: DelegateMock;
  $transaction: jest.Mock;
};

const user: AuthenticatedUser = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "user@example.com",
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  displayName: "کاربر",
  profileImageUrl: null,
  emailVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const publishedEntry = {
  id: "22222222-2222-2222-2222-222222222222",
  slug: "ارگ-هرات",
  title: "ارگ هرات",
  summary: "خلاصه",
  status: EntryStatus.PUBLISHED,
  publishedAt: new Date("2026-01-02T00:00:00.000Z"),
  updatedAt: new Date("2026-01-03T00:00:00.000Z"),
};

describe("ProfileService", () => {
  let prisma: PrismaMock;
  let service: ProfileService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new ProfileService(prisma as unknown as PrismaService);
  });

  it("returns safe owner profile fields", async () => {
    prisma.user.findUnique.mockResolvedValue({
      ...user,
      biography: "زندگی‌نامه کوتاه",
      culturalInterests: ["هرات"],
      province: { id: "33333333-3333-3333-3333-333333333333", name: "هرات", slug: "herat" },
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const response = await service.getMyProfile(user);

    expect(response.data.emailVerified).toBe(true);
    expect(response.data.culturalInterests).toEqual(["هرات"]);
    expect(response.data).not.toHaveProperty("passwordHash");
    expect(response.data).not.toHaveProperty("refreshTokenHash");
  });

  it("returns profile stats from real counts", async () => {
    prisma.culturalEntry.groupBy.mockResolvedValue([
      { status: EntryStatus.DRAFT, _count: { _all: 2 } },
      { status: EntryStatus.PENDING_REVIEW, _count: { _all: 1 } },
      { status: EntryStatus.PUBLISHED, _count: { _all: 3 } },
    ]);
    prisma.publicReview.count.mockResolvedValue(4);
    prisma.bookmark.count.mockResolvedValue(5);

    const response = await service.getMyStats(user);

    expect(response.data.entries.all).toBe(6);
    expect(response.data.entries.published).toBe(3);
    expect(response.data.needsAttention).toBe(1);
    expect(response.data.reviews).toBe(4);
    expect(response.data.bookmarks).toBe(5);
  });

  it("lists current-user reviews with pagination metadata", async () => {
    prisma.publicReview.findMany.mockResolvedValue([
      {
        id: "44444444-4444-4444-4444-444444444444",
        entryId: publishedEntry.id,
        body: "دیدگاه نمونه",
        status: PublicReviewStatus.ACTIVE,
        entry: publishedEntry,
        createdAt: new Date("2026-01-04T00:00:00.000Z"),
        updatedAt: new Date("2026-01-04T00:00:00.000Z"),
      },
    ]);
    prisma.publicReview.count.mockResolvedValue(1);

    const response = await service.listMyReviews(user, {
      page: 1,
      limit: 10,
      status: PublicReviewStatus.ACTIVE,
    });

    expect(prisma.publicReview.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: user.id,
          status: PublicReviewStatus.ACTIVE,
        },
        skip: 0,
        take: 10,
      }),
    );
    expect(response.meta.total).toBe(1);
    expect(response.data[0]?.entry.title).toBe("ارگ هرات");
  });

  it("lists only bookmarks whose entries are still published", async () => {
    prisma.bookmark.findMany.mockResolvedValue([
      {
        id: "55555555-5555-5555-5555-555555555555",
        entryId: publishedEntry.id,
        entry: publishedEntry,
        createdAt: new Date("2026-01-04T00:00:00.000Z"),
      },
    ]);
    prisma.bookmark.count.mockResolvedValue(1);

    const response = await service.listMyBookmarks(user, { page: 1, limit: 10 });

    expect(prisma.bookmark.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: user.id,
          entry: {
            status: EntryStatus.PUBLISHED,
            publishedAt: { not: null },
          },
        },
      }),
    );
    expect(response.data[0]?.entry.slug).toBe("ارگ-هرات");
  });

  it("saves a bookmark idempotently for a published entry", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue({ id: publishedEntry.id });
    prisma.bookmark.upsert.mockResolvedValue({ id: "55555555-5555-5555-5555-555555555555" });
    prisma.bookmark.count.mockResolvedValue(6);

    const response = await service.saveBookmark(user, publishedEntry.id);

    expect(prisma.bookmark.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_entryId: {
            userId: user.id,
            entryId: publishedEntry.id,
          },
        },
      }),
    );
    expect(response.data.bookmarked).toBe(true);
    expect(response.data.bookmarkCount).toBe(6);
  });

  it("returns the current bookmark state and public aggregate count", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue({ id: publishedEntry.id });
    prisma.bookmark.findUnique.mockResolvedValue({
      id: "55555555-5555-5555-5555-555555555555",
    });
    prisma.bookmark.count.mockResolvedValue(6);

    await expect(service.getMyBookmarkStatus(user, publishedEntry.id)).resolves.toEqual({
      data: {
        entryId: publishedEntry.id,
        bookmarked: true,
        bookmarkId: "55555555-5555-5555-5555-555555555555",
        bookmarkCount: 6,
      },
    });
  });

  it("removes a bookmark idempotently and returns the remaining count", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue({ id: publishedEntry.id });
    prisma.bookmark.deleteMany.mockResolvedValue({ count: 1 });
    prisma.bookmark.count.mockResolvedValue(5);

    await expect(service.removeBookmark(user, publishedEntry.id)).resolves.toEqual({
      data: {
        entryId: publishedEntry.id,
        bookmarked: false,
        bookmarkId: null,
        bookmarkCount: 5,
      },
    });
  });

  it("rejects bookmark actions for unavailable entries", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(null);

    await expect(service.saveBookmark(user, publishedEntry.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("validates active profile province updates", async () => {
    prisma.province.findFirst.mockResolvedValue(null);

    await expect(
      service.updateMyProfile(user, {
        provinceId: "33333333-3333-3333-3333-333333333333",
      }),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        error: PROFILE_ERROR_CODES.PROVINCE_INVALID,
      }),
    });
  });

  it("rejects invalid cultural interest values", async () => {
    await expect(
      service.updateMyProfile(user, {
        culturalInterests: ["x"],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

function createPrismaMock(): PrismaMock {
  const prisma = {
    bookmark: createDelegateMock(),
    culturalEntry: createDelegateMock(),
    province: createDelegateMock(),
    publicReview: createDelegateMock(),
    user: createDelegateMock(),
    $transaction: jest.fn(),
  };

  prisma.$transaction.mockImplementation(
    (operation: Array<Promise<unknown>> | ((tx: PrismaMock) => Promise<unknown>)) =>
      Array.isArray(operation) ? Promise.all(operation) : operation(prisma),
  );

  return prisma;
}

function createDelegateMock(): DelegateMock {
  return {
    count: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    groupBy: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
  };
}
