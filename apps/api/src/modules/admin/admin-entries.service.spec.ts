jest.mock("../../database/prisma.service", () => ({ PrismaService: class PrismaService {} }));

import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";

import type { PrismaService } from "../../database/prisma.service";
import {
  AuditAction,
  EntryStatus,
  GeographicScope,
  ModerationDecision,
  UserRole,
  UserStatus,
} from "../../generated/prisma/enums";
import type { AuditService } from "../audit/audit.service";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { AdminEntriesService } from "./admin-entries.service";

type Delegate = Record<string, jest.Mock>;
type PrismaMock = {
  culturalEntry: Delegate;
  moderationReview: Delegate;
  auditLog: Delegate;
  $transaction: jest.Mock;
};

const actor: AuthenticatedUser = {
  id: "11111111-1111-1111-1111-111111111111",
  displayName: "مدیر",
  email: "admin@example.com",
  role: UserRole.ADMIN,
  status: UserStatus.ACTIVE,
  profileImageUrl: null,
  emailVerifiedAt: new Date(),
};
const entryId = "22222222-2222-2222-2222-222222222222";

describe("AdminEntriesService", () => {
  it("lists every lifecycle status with compact safe fields and server filters", async () => {
    const prisma = createPrismaMock();
    prisma.culturalEntry.findMany.mockResolvedValue([createListEntry()]);
    prisma.culturalEntry.count.mockResolvedValue(1);
    prisma.culturalEntry.groupBy.mockResolvedValue([
      { status: EntryStatus.PUBLISHED, _count: { _all: 1 } },
    ]);
    const service = createService(prisma);

    const response = await service.listEntries({
      page: 1,
      limit: 20,
      search: "  يک مطلب  ",
      status: EntryStatus.PUBLISHED,
      geographicScope: GeographicScope.PROVINCE,
      categoryId: "33333333-3333-3333-3333-333333333333",
      sortBy: "viewCount",
      sortDirection: "desc",
    });

    expect(response.data[0]).toMatchObject({
      id: entryId,
      thumbnailUrl: "https://example.com/thumb.jpg",
      counts: { likes: 3, bookmarks: 2, comments: 1, openReports: 1 },
    });
    expect(response.statusCounts).toHaveLength(Object.values(EntryStatus).length);
    expect(prisma.culturalEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: EntryStatus.PUBLISHED,
          geographicScope: GeographicScope.PROVINCE,
        }),
        orderBy: [{ viewCount: "desc" }, { id: "asc" }],
        skip: 0,
        take: 20,
      }),
    );
    expect(response.data[0]).not.toHaveProperty("contentJson");
  });

  it("returns not found for a missing detail without exposing private records", async () => {
    const prisma = createPrismaMock();
    prisma.culturalEntry.findUnique.mockResolvedValue(null);
    await expect(createService(prisma).getEntry(entryId)).rejects.toBeInstanceOf(NotFoundException);
  });

  it("archives a published entry transactionally without creating a content version", async () => {
    const prisma = createLifecyclePrisma(EntryStatus.PUBLISHED, new Date("2026-08-01"));
    const audit = createAuditMock();
    const response = await createService(prisma, audit).archiveEntry(actor, entryId, {
      reason: "  پایان دوره انتشار  ",
    });

    expect(prisma.culturalEntry.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: entryId, status: EntryStatus.PUBLISHED },
        data: expect.objectContaining({
          status: EntryStatus.ARCHIVED,
          archivedAt: expect.any(Date),
        }),
      }),
    );
    expect(prisma.moderationReview.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          decision: ModerationDecision.ARCHIVE,
          previousStatus: EntryStatus.PUBLISHED,
          nextStatus: EntryStatus.ARCHIVED,
        }),
      }),
    );
    expect(audit.createWithClient).toHaveBeenCalledWith(
      prisma,
      expect.objectContaining({ action: AuditAction.ENTRY_ARCHIVED, entryId }),
    );
    expect(prisma).not.toHaveProperty("contentVersion");
    expect(response.data.entry.status).toBe(EntryStatus.ARCHIVED);
  });

  it("restores only a previously published archive and preserves publication history", async () => {
    const publishedAt = new Date("2026-08-01");
    const prisma = createLifecyclePrisma(EntryStatus.ARCHIVED, publishedAt);
    prisma.culturalEntry.findUniqueOrThrow.mockResolvedValue({
      id: entryId,
      slug: "مطلب-فرهنگی",
      status: EntryStatus.PUBLISHED,
      publishedAt,
      archivedAt: null,
      updatedAt: new Date(),
    });
    const service = createService(prisma);

    const response = await service.restoreEntry(actor, entryId, {
      reason: "بازگردانی پس از بررسی",
    });

    expect(prisma.culturalEntry.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: entryId, status: EntryStatus.ARCHIVED, publishedAt: { not: null } },
        data: { status: EntryStatus.PUBLISHED, archivedAt: null },
      }),
    );
    expect(response.data.entry.publishedAt).toEqual(publishedAt);
  });

  it("rejects a lifecycle action without a useful reason", async () => {
    await expect(
      createService(createPrismaMock()).archiveEntry(actor, entryId, { reason: "  " }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects unsupported status transitions and repeated archive actions", async () => {
    const draft = createPrismaMock();
    draft.culturalEntry.findUnique.mockResolvedValue({
      id: entryId,
      key: "entry-key",
      slug: "مطلب",
      status: EntryStatus.DRAFT,
      publishedAt: null,
    });
    await expect(
      createService(draft).archiveEntry(actor, entryId, { reason: "دلیل معتبر" }),
    ).rejects.toBeInstanceOf(BadRequestException);

    const archived = createLifecyclePrisma(EntryStatus.ARCHIVED, new Date());
    await expect(
      createService(archived).archiveEntry(actor, entryId, { reason: "دلیل معتبر" }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rejects stale concurrent lifecycle actions", async () => {
    const prisma = createLifecyclePrisma(EntryStatus.PUBLISHED, new Date());
    prisma.culturalEntry.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      createService(prisma).archiveEntry(actor, entryId, { reason: "دلیل معتبر" }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

function createService(
  prisma: PrismaMock,
  audit: ReturnType<typeof createAuditMock> = createAuditMock(),
) {
  return new AdminEntriesService(
    prisma as unknown as PrismaService,
    audit as unknown as AuditService,
  );
}

function createPrismaMock(): PrismaMock {
  const delegate = (): Delegate => ({
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    groupBy: jest.fn(),
    updateMany: jest.fn(),
    create: jest.fn(),
  });
  const prisma = {
    culturalEntry: delegate(),
    moderationReview: delegate(),
    auditLog: delegate(),
    $transaction: jest.fn(),
  } as PrismaMock;
  prisma.$transaction.mockImplementation(
    (input: Promise<unknown>[] | ((client: PrismaMock) => Promise<unknown>)) =>
      typeof input === "function" ? input(prisma) : Promise.all(input),
  );
  return prisma;
}

function createLifecyclePrisma(status: EntryStatus, publishedAt: Date | null) {
  const prisma = createPrismaMock();
  prisma.culturalEntry.findUnique.mockResolvedValue({
    id: entryId,
    key: "entry-key",
    slug: "مطلب-فرهنگی",
    status,
    publishedAt,
  });
  prisma.culturalEntry.updateMany.mockResolvedValue({ count: 1 });
  prisma.moderationReview.create.mockResolvedValue({
    id: "review-id",
    decision:
      status === EntryStatus.ARCHIVED ? ModerationDecision.RESTORE : ModerationDecision.ARCHIVE,
    comments: "دلیل معتبر",
    previousStatus: status,
    nextStatus: status === EntryStatus.ARCHIVED ? EntryStatus.PUBLISHED : EntryStatus.ARCHIVED,
    createdAt: new Date(),
  });
  prisma.culturalEntry.findUniqueOrThrow.mockResolvedValue({
    id: entryId,
    slug: "مطلب-فرهنگی",
    status: status === EntryStatus.ARCHIVED ? EntryStatus.PUBLISHED : EntryStatus.ARCHIVED,
    publishedAt,
    archivedAt: status === EntryStatus.ARCHIVED ? null : new Date(),
    updatedAt: new Date(),
  });
  return prisma;
}

function createAuditMock() {
  return { createWithClient: jest.fn().mockResolvedValue({ id: "audit-id" }) };
}

function createListEntry() {
  return {
    id: entryId,
    slug: "مطلب-فرهنگی",
    title: "یک مطلب",
    summary: "خلاصه",
    status: EntryStatus.PUBLISHED,
    geographicScope: GeographicScope.PROVINCE,
    viewCount: 20,
    submittedAt: new Date(),
    publishedAt: new Date(),
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: actor.id,
      displayName: "نویسنده",
      email: "writer@example.com",
      profileImageUrl: null,
    },
    province: { id: "p", name: "هرات", slug: "herat", isActive: true },
    category: { id: "c", name: "تاریخ", slug: "history", isActive: true },
    contentType: { id: "t", name: "مقاله", slug: "article", isActive: true },
    images: [
      { thumbnailUrl: "https://example.com/thumb.jpg", secureUrl: "https://example.com/image.jpg" },
    ],
    _count: { likes: 3, bookmarks: 2, comments: 1, reports: 1 },
  };
}
