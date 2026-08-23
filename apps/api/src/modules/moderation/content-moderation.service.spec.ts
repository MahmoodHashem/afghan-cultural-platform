jest.mock("@/database/prisma.service", () => ({ PrismaService: class PrismaService {} }));

import { ConflictException } from "@nestjs/common";

import type { PrismaService } from "@/database/prisma.service";
import {
  AuditAction,
  CorrectionStatus,
  EntryCommentStatus,
  EntryStatus,
  ReportReason,
  ReportResolutionAction,
  ReportStatus,
  UserRole,
  UserStatus,
} from "@/generated/prisma/enums";
import type { AuditService } from "@/modules/audit/audit.service";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import { ContentModerationService } from "@/modules/moderation/content-moderation.service";
import { MODERATION_ERROR_CODES } from "@/modules/moderation/moderation.constants";

const ids = {
  entry: "11111111-1111-4111-8111-111111111111",
  user: "22222222-2222-4222-8222-222222222222",
  moderator: "33333333-3333-4333-8333-333333333333",
  correction: "44444444-4444-4444-8444-444444444444",
  report: "55555555-5555-4555-8555-555555555555",
  comment: "66666666-6666-4666-8666-666666666666",
};

const moderator: AuthenticatedUser = {
  id: ids.moderator,
  email: "moderator@example.com",
  displayName: "Moderator",
  role: UserRole.MODERATOR,
  status: UserStatus.ACTIVE,
  profileImageUrl: null,
  emailVerifiedAt: new Date(),
};

describe("ContentModerationService", () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let audit: { createWithClient: jest.Mock };
  let service: ContentModerationService;

  beforeEach(() => {
    prisma = createPrismaMock();
    audit = { createWithClient: jest.fn().mockResolvedValue({}) };
    service = new ContentModerationService(
      prisma as unknown as PrismaService,
      audit as unknown as AuditService,
    );
  });

  it("creates a pending correction for a published entry", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue({ id: ids.entry });
    prisma.correctionSuggestion.findFirst.mockResolvedValue(null);
    prisma.correctionSuggestion.create.mockResolvedValue(correctionPayload());

    const response = await service.submitCorrection(moderator, ids.entry, {
      section: "SUMMARY",
      proposedCorrection: "خلاصه درست و تازه",
      reason: "این خلاصه با منبع اصلی سازگارتر است.",
    });

    expect(response.data.status).toBe(CorrectionStatus.PENDING);
    expect(audit.createWithClient).toHaveBeenCalledWith(
      prisma,
      expect.objectContaining({ action: AuditAction.CORRECTION_SUBMITTED }),
    );
  });

  it("rejects a duplicate pending correction from the same user and section", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue({ id: ids.entry });
    prisma.correctionSuggestion.findFirst.mockResolvedValue({ id: ids.correction });

    await expect(
      service.submitCorrection(moderator, ids.entry, {
        section: "SUMMARY",
        proposedCorrection: "خلاصه تازه",
        reason: "این پیشنهاد دلیل کافی و روشن دارد.",
      }),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        error: MODERATION_ERROR_CODES.CORRECTION_ALREADY_PENDING,
      }),
    });
  });

  it("creates a comment report only after validating its published entry and active comment", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue({ id: ids.entry });
    prisma.entryComment.findFirst.mockResolvedValue({ id: ids.comment });
    prisma.report.findFirst.mockResolvedValue(null);
    prisma.report.create.mockResolvedValue(reportPayload({ entryCommentId: ids.comment }));

    const response = await service.submitReport(moderator, ids.entry, ids.comment, {
      reason: ReportReason.SPAM,
      explanation: "این دیدگاه تبلیغ نامرتبط و تکراری دارد.",
    });

    expect(response.data.targetType).toBe("COMMENT");
    expect(response.data).not.toHaveProperty("reportedBy");
  });

  it("hides an active comment and removes its likes while resolving its report", async () => {
    prisma.report.findUnique
      .mockResolvedValueOnce(reportPayload({ entryCommentId: ids.comment }))
      .mockResolvedValueOnce(
        reportPayload({
          entryCommentId: ids.comment,
          status: ReportStatus.RESOLVED,
          resolutionAction: ReportResolutionAction.HIDE_COMMENT,
        }),
      );
    prisma.report.updateMany.mockResolvedValue({ count: 1 });
    prisma.entryComment.updateMany.mockResolvedValue({ count: 1 });

    const response = await service.resolveReport(moderator, ids.report, {
      resolutionAction: ReportResolutionAction.HIDE_COMMENT,
      notes: "دیدگاه با قواعد انتشار سازگار نیست.",
    });

    expect(prisma.entryComment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: ids.comment, status: EntryCommentStatus.ACTIVE },
      }),
    );
    expect(response.data.status).toBe(ReportStatus.RESOLVED);
    expect(audit.createWithClient).toHaveBeenCalledWith(
      prisma,
      expect.objectContaining({ action: AuditAction.COMMENT_HIDDEN }),
    );
  });

  it("prevents a second moderator from resolving an already claimed report", async () => {
    prisma.report.findUnique.mockResolvedValue(reportPayload());
    prisma.report.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.resolveReport(moderator, ids.report, {
        resolutionAction: ReportResolutionAction.DISMISS,
        notes: "این گزارش بررسی شد و محتوای فعلی مشکلی ندارد.",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

function createPrismaMock() {
  const delegate = () => ({
    count: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    updateMany: jest.fn(),
  });
  const prisma = {
    culturalEntry: delegate(),
    correctionSuggestion: delegate(),
    contentVersion: delegate(),
    entryComment: delegate(),
    commentLike: delegate(),
    report: delegate(),
    auditLog: delegate(),
    $transaction: jest.fn(),
  };
  prisma.$transaction.mockImplementation((value: unknown) =>
    typeof value === "function"
      ? (value as (client: typeof prisma) => unknown)(prisma)
      : Promise.all(value as Promise<unknown>[]),
  );
  return prisma;
}

function correctionPayload() {
  return {
    id: ids.correction,
    entryId: ids.entry,
    submittedById: ids.user,
    reviewedById: null,
    status: CorrectionStatus.PENDING,
    section: "SUMMARY",
    proposedCorrection: "خلاصه درست و تازه",
    reason: "این خلاصه با منبع اصلی سازگارتر است.",
    sourceText: null,
    reviewerComments: null,
    acceptedVersionId: null,
    submittedAt: new Date(),
    reviewedAt: null,
    createdAt: new Date(),
    entry: {
      id: ids.entry,
      slug: "نمونه",
      title: "نمونه",
      summary: "خلاصه قدیمی",
      plainTextContent: "متن",
      status: EntryStatus.PUBLISHED,
    },
    submittedBy: { id: ids.user, displayName: "Contributor" },
    reviewedBy: null,
  };
}

function reportPayload(overrides: Record<string, unknown> = {}) {
  const entryCommentId = overrides.entryCommentId === undefined ? null : overrides.entryCommentId;
  return {
    id: ids.report,
    entryId: ids.entry,
    entryCommentId,
    reviewedById: null,
    reason: ReportReason.SPAM,
    explanation: "این محتوا برای بررسی گزارش شده است.",
    status: ReportStatus.OPEN,
    resolutionAction: null,
    resolutionNotes: null,
    resolvedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    entry: {
      id: ids.entry,
      slug: "نمونه",
      title: "نمونه",
      summary: "خلاصه",
      status: EntryStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    entryComment: entryCommentId
      ? {
          id: ids.comment,
          body: "دیدگاه گزارش‌شده",
          status: EntryCommentStatus.ACTIVE,
          createdAt: new Date(),
          author: { id: ids.user, displayName: "Reader" },
        }
      : null,
    reviewedBy: null,
    ...overrides,
  };
}
