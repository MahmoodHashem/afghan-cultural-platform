jest.mock("../../database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  type HttpException,
  NotFoundException,
} from "@nestjs/common";

import type { PrismaService } from "../../database/prisma.service";
import {
  EntryStatus,
  ModerationDecision,
  UserRole,
  UserStatus,
} from "../../generated/prisma/enums";
import type { AuditService } from "../audit/audit.service";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { MODERATION_ERROR_CODES } from "./moderation.constants";
import { ModerationService } from "./moderation.service";

type DelegateMock = {
  count: jest.Mock;
  create: jest.Mock;
  findFirst: jest.Mock;
  findMany: jest.Mock;
  findUnique: jest.Mock;
  update: jest.Mock;
  updateMany: jest.Mock;
};

type PrismaMock = {
  culturalEntry: DelegateMock;
  contentVersion: DelegateMock;
  moderationReview: DelegateMock;
  $transaction: jest.Mock;
};

type AuditServiceMock = {
  createWithClient: jest.Mock;
};

const moderator: AuthenticatedUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "moderator@example.com",
  role: UserRole.MODERATOR,
  status: UserStatus.ACTIVE,
  displayName: "Moderator",
  profileImageUrl: null,
  emailVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const admin: AuthenticatedUser = {
  ...moderator,
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  email: "admin@example.com",
  role: UserRole.ADMIN,
  displayName: "Admin",
};

const ids = {
  entry: "22222222-2222-4222-8222-222222222222",
  author: "33333333-3333-4333-8333-333333333333",
  province: "44444444-4444-4444-8444-444444444444",
  category: "55555555-5555-4555-8555-555555555555",
  contentType: "66666666-6666-4666-8666-666666666666",
  contentVersion: "77777777-7777-4777-8777-777777777777",
  review: "88888888-8888-4888-8888-888888888888",
};

describe("ModerationService", () => {
  let prisma: PrismaMock;
  let auditService: AuditServiceMock;
  let service: ModerationService;

  beforeEach(() => {
    prisma = createPrismaMock();
    auditService = createAuditServiceMock();
    service = new ModerationService(
      prisma as unknown as PrismaService,
      auditService as unknown as AuditService,
    );
  });

  it("lists only pending submissions with the submitted version", async () => {
    prisma.culturalEntry.findMany.mockResolvedValue([createSubmissionPayload()]);
    prisma.culturalEntry.count.mockResolvedValue(1);

    const response = await service.listSubmissions({ page: 1, limit: 20 });

    expect(prisma.culturalEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: EntryStatus.PENDING_REVIEW },
        skip: 0,
        take: 20,
      }),
    );
    expect(response.data[0]?.submittedVersion?.id).toBe(ids.contentVersion);
    expect(response.meta.total).toBe(1);
  });

  it("returns one pending submission by ID", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createSubmissionPayload());

    await expect(service.getSubmission(ids.entry)).resolves.toMatchObject({
      data: {
        id: ids.entry,
        status: EntryStatus.PENDING_REVIEW,
      },
    });
  });

  it("does not expose non-pending submissions through detail lookup", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(null);

    await expectErrorCode(
      () => service.getSubmission(ids.entry),
      MODERATION_ERROR_CODES.SUBMISSION_NOT_FOUND,
      NotFoundException,
    );
  });

  it("lets a moderator approve and immediately publish a submission", async () => {
    prisma.culturalEntry.findUnique
      .mockResolvedValueOnce(createDecisionEntryPayload())
      .mockResolvedValueOnce({
        id: ids.entry,
        key: "snapshot-entry",
        slug: "نمونه-ثبت-شده",
        status: EntryStatus.PUBLISHED,
        publishedAt: new Date("2026-01-02T00:00:00.000Z"),
      });
    prisma.culturalEntry.updateMany.mockResolvedValue({ count: 1 });
    prisma.moderationReview.create.mockResolvedValue(
      createReviewPayload({
        decision: ModerationDecision.APPROVE,
        nextStatus: EntryStatus.PUBLISHED,
      }),
    );
    prisma.contentVersion.update.mockResolvedValue(
      createContentVersionPayload({ moderationReviewId: ids.review }),
    );

    const response = await service.approveSubmission(moderator, ids.entry);

    expect(prisma.culturalEntry.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: ids.entry,
          status: EntryStatus.PENDING_REVIEW,
        },
        data: expect.objectContaining({
          title: "Snapshot title",
          status: EntryStatus.PUBLISHED,
          publishedAt: expect.any(Date),
          hiddenAt: null,
          archivedAt: null,
        }),
      }),
    );
    expect(prisma.contentVersion.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: ids.contentVersion },
        data: { moderationReviewId: ids.review },
      }),
    );
    expect(auditService.createWithClient).toHaveBeenCalledWith(
      prisma,
      expect.objectContaining({
        action: "ENTRY_APPROVED",
        actorId: moderator.id,
        entryId: ids.entry,
      }),
    );
    expect(response.data.entry.status).toBe(EntryStatus.PUBLISHED);
    expect(response.data.review.decision).toBe(ModerationDecision.APPROVE);
  });

  it("lets an admin approve a submission", async () => {
    prisma.culturalEntry.findUnique
      .mockResolvedValueOnce(createDecisionEntryPayload())
      .mockResolvedValueOnce({
        id: ids.entry,
        key: "snapshot-entry",
        slug: "نمونه-ثبت-شده",
        status: EntryStatus.PUBLISHED,
        publishedAt: new Date("2026-01-02T00:00:00.000Z"),
      });
    prisma.culturalEntry.updateMany.mockResolvedValue({ count: 1 });
    prisma.moderationReview.create.mockResolvedValue(
      createReviewPayload({
        decision: ModerationDecision.APPROVE,
        nextStatus: EntryStatus.PUBLISHED,
        moderatorId: admin.id,
      }),
    );
    prisma.contentVersion.update.mockResolvedValue(
      createContentVersionPayload({ moderationReviewId: ids.review }),
    );

    await expect(service.approveSubmission(admin, ids.entry)).resolves.toMatchObject({
      data: {
        review: {
          moderatorId: admin.id,
        },
      },
    });
  });

  it("rejects moderator self-approval", async () => {
    prisma.culturalEntry.findUnique.mockResolvedValue(
      createDecisionEntryPayload({ authorId: moderator.id }),
    );

    await expectErrorCode(
      () => service.approveSubmission(moderator, ids.entry),
      MODERATION_ERROR_CODES.SELF_APPROVAL_FORBIDDEN,
      ForbiddenException,
    );
    expect(prisma.culturalEntry.updateMany).not.toHaveBeenCalled();
  });

  it("requests changes with required feedback", async () => {
    prisma.culturalEntry.findUnique
      .mockResolvedValueOnce(createDecisionEntryPayload())
      .mockResolvedValueOnce({
        id: ids.entry,
        key: "snapshot-entry",
        slug: "نمونه-ثبت-شده",
        status: EntryStatus.CHANGES_REQUESTED,
        publishedAt: null,
      });
    prisma.culturalEntry.updateMany.mockResolvedValue({ count: 1 });
    prisma.moderationReview.create.mockResolvedValue(
      createReviewPayload({
        decision: ModerationDecision.REQUEST_CHANGES,
        nextStatus: EntryStatus.CHANGES_REQUESTED,
        comments: "لطفاً منبع تصویر را روشن کنید.",
      }),
    );
    prisma.contentVersion.update.mockResolvedValue(
      createContentVersionPayload({ moderationReviewId: ids.review }),
    );

    const response = await service.requestChanges(moderator, ids.entry, {
      reason: " لطفاً منبع تصویر را روشن کنید. ",
    });

    expect(prisma.culturalEntry.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: EntryStatus.CHANGES_REQUESTED },
      }),
    );
    expect(response.data.review.comments).toBe("لطفاً منبع تصویر را روشن کنید.");
  });

  it("rejects a submission with a required reason", async () => {
    prisma.culturalEntry.findUnique
      .mockResolvedValueOnce(createDecisionEntryPayload())
      .mockResolvedValueOnce({
        id: ids.entry,
        key: "snapshot-entry",
        slug: "نمونه-ثبت-شده",
        status: EntryStatus.REJECTED,
        publishedAt: null,
      });
    prisma.culturalEntry.updateMany.mockResolvedValue({ count: 1 });
    prisma.moderationReview.create.mockResolvedValue(
      createReviewPayload({
        decision: ModerationDecision.REJECT,
        nextStatus: EntryStatus.REJECTED,
        comments: "محتوا خارج از دامنه نسخه اول است.",
      }),
    );
    prisma.contentVersion.update.mockResolvedValue(
      createContentVersionPayload({ moderationReviewId: ids.review }),
    );

    await service.rejectSubmission(moderator, ids.entry, {
      reason: "محتوا خارج از دامنه نسخه اول است.",
    });

    expect(prisma.moderationReview.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          decision: ModerationDecision.REJECT,
          nextStatus: EntryStatus.REJECTED,
          comments: "محتوا خارج از دامنه نسخه اول است.",
        }),
      }),
    );
  });

  it("rejects missing moderation reasons", async () => {
    await expectErrorCode(
      () => service.rejectSubmission(moderator, ids.entry, { reason: "   " }),
      MODERATION_ERROR_CODES.REASON_REQUIRED,
      BadRequestException,
    );
    expect(prisma.culturalEntry.findUnique).not.toHaveBeenCalled();
  });

  it("rejects unsupported status transitions", async () => {
    prisma.culturalEntry.findUnique.mockResolvedValue(
      createDecisionEntryPayload({ status: EntryStatus.DRAFT }),
    );

    await expectErrorCode(
      () => service.rejectSubmission(moderator, ids.entry, { reason: "رد شد." }),
      MODERATION_ERROR_CODES.ALREADY_DECIDED,
      ConflictException,
    );
  });

  it("prevents duplicate concurrent moderation decisions", async () => {
    prisma.culturalEntry.findUnique.mockResolvedValue(createDecisionEntryPayload());
    prisma.culturalEntry.updateMany.mockResolvedValue({ count: 0 });

    await expectErrorCode(
      () => service.requestChanges(moderator, ids.entry, { reason: "نیاز به اصلاح دارد." }),
      MODERATION_ERROR_CODES.CONFLICT,
      ConflictException,
    );
    expect(prisma.moderationReview.create).not.toHaveBeenCalled();
  });
});

function createPrismaMock(): PrismaMock {
  const prisma: PrismaMock = {
    culturalEntry: createDelegateMock(),
    contentVersion: createDelegateMock(),
    moderationReview: createDelegateMock(),
    $transaction: jest.fn(),
  };

  prisma.$transaction.mockImplementation(
    (input: Array<Promise<unknown>> | ((client: PrismaMock) => unknown)) => {
      if (typeof input === "function") {
        return input(prisma);
      }

      return Promise.all(input);
    },
  );

  return prisma;
}

function createDelegateMock(): DelegateMock {
  return {
    count: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  };
}

function createAuditServiceMock(): AuditServiceMock {
  return {
    createWithClient: jest.fn().mockResolvedValue({ id: "audit-log-id" }),
  };
}

function createSubmissionPayload() {
  return {
    id: ids.entry,
    key: "snapshot-entry",
    slug: "نمونه-ثبت-شده",
    status: EntryStatus.PENDING_REVIEW,
    authorId: ids.author,
    submittedAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    author: {
      id: ids.author,
      displayName: "Author",
    },
    province: createTaxonomyPayload(ids.province, "کابل", "kabul"),
    category: createTaxonomyPayload(ids.category, "رسم‌ها", "traditions"),
    contentType: createTaxonomyPayload(ids.contentType, "مقاله", "article"),
    contentVersions: [createContentVersionPayload()],
  };
}

function createDecisionEntryPayload(
  overrides: Partial<{
    authorId: string;
    status: EntryStatus;
  }> = {},
) {
  return {
    id: ids.entry,
    key: "snapshot-entry",
    slug: "نمونه-کنونی",
    status: overrides.status ?? EntryStatus.PENDING_REVIEW,
    authorId: overrides.authorId ?? ids.author,
    publishedAt: null,
    contentVersions: [createContentVersionPayload()],
  };
}

function createTaxonomyPayload(id: string, name: string, slug: string) {
  return {
    id,
    name,
    slug,
  };
}

function createContentVersionPayload(
  overrides: Partial<{
    moderationReviewId: string | null;
  }> = {},
) {
  return {
    id: ids.contentVersion,
    entryId: ids.entry,
    versionNumber: 1,
    snapshot: {
      schemaVersion: 1,
      title: "Snapshot title",
      summary: "Snapshot summary",
      contentJson: { type: "doc", content: [] },
      plainTextContent: "Snapshot plain text",
      normalizedSearchText: "snapshot plain text",
      key: "snapshot-entry",
      slug: "نمونه-ثبت-شده",
      province: { id: ids.province },
      district: null,
      category: { id: ids.category },
      contentType: { id: ids.contentType },
      villageOrLocation: null,
    },
    plainTextContent: "Snapshot plain text",
    versionReason: "INITIAL_SUBMISSION",
    createdById: ids.author,
    correctionSuggestionId: null,
    moderationReviewId: overrides.moderationReviewId ?? null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

function createReviewPayload(
  overrides: Partial<{
    moderatorId: string;
    decision: ModerationDecision;
    comments: string | null;
    nextStatus: EntryStatus;
  }> = {},
) {
  return {
    id: ids.review,
    entryId: ids.entry,
    moderatorId: overrides.moderatorId ?? moderator.id,
    decision: overrides.decision ?? ModerationDecision.APPROVE,
    comments: overrides.comments ?? null,
    previousStatus: EntryStatus.PENDING_REVIEW,
    nextStatus: overrides.nextStatus ?? EntryStatus.PUBLISHED,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

async function expectErrorCode<TError extends HttpException>(
  action: () => Promise<unknown>,
  expectedCode: string,
  ErrorClass: new (...args: never[]) => TError,
): Promise<void> {
  try {
    await action();
    throw new Error("Expected moderation error was not thrown");
  } catch (error) {
    if (!(error instanceof ErrorClass)) {
      throw error;
    }

    expect(error.getResponse()).toMatchObject({
      error: expectedCode,
    });
  }
}
