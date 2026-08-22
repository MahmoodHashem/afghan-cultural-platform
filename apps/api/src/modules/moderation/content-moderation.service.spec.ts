jest.mock("@/database/prisma.service", () => ({ PrismaService: class PrismaService {} }));

import { ConflictException } from "@nestjs/common";

import type { PrismaService } from "@/database/prisma.service";
import {
  AuditAction,
  CorrectionStatus,
  EntryStatus,
  PublicReviewStatus,
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
  review: "66666666-6666-4666-8666-666666666666",
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

  it("creates a review report only after validating its published entry and active review", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue({ id: ids.entry });
    prisma.publicReview.findFirst.mockResolvedValue({ id: ids.review });
    prisma.report.findFirst.mockResolvedValue(null);
    prisma.report.create.mockResolvedValue(reportPayload({ publicReviewId: ids.review }));

    const response = await service.submitReport(moderator, ids.entry, ids.review, {
      reason: ReportReason.SPAM,
      explanation: "این دیدگاه تبلیغ نامرتبط و تکراری دارد.",
    });

    expect(response.data.targetType).toBe("REVIEW");
    expect(response.data).not.toHaveProperty("reportedBy");
  });

  it("hides an active review while resolving its report transactionally", async () => {
    prisma.report.findUnique
      .mockResolvedValueOnce(reportPayload({ publicReviewId: ids.review }))
      .mockResolvedValueOnce(
        reportPayload({
          publicReviewId: ids.review,
          status: ReportStatus.RESOLVED,
          resolutionAction: ReportResolutionAction.HIDE_REVIEW,
        }),
      );
    prisma.report.updateMany.mockResolvedValue({ count: 1 });
    prisma.publicReview.updateMany.mockResolvedValue({ count: 1 });

    const response = await service.resolveReport(moderator, ids.report, {
      resolutionAction: ReportResolutionAction.HIDE_REVIEW,
      notes: "دیدگاه با قواعد انتشار سازگار نیست.",
    });

    expect(prisma.publicReview.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: ids.review, status: PublicReviewStatus.ACTIVE },
      }),
    );
    expect(response.data.status).toBe(ReportStatus.RESOLVED);
    expect(audit.createWithClient).toHaveBeenCalledWith(
      prisma,
      expect.objectContaining({ action: AuditAction.REVIEW_HIDDEN }),
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
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    updateMany: jest.fn(),
  });
  const prisma = {
    culturalEntry: delegate(),
    correctionSuggestion: delegate(),
    contentVersion: delegate(),
    publicReview: delegate(),
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
  const publicReviewId = overrides.publicReviewId === undefined ? null : overrides.publicReviewId;
  return {
    id: ids.report,
    entryId: ids.entry,
    publicReviewId,
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
    publicReview: publicReviewId
      ? {
          id: ids.review,
          body: "دیدگاه گزارش‌شده",
          status: PublicReviewStatus.ACTIVE,
          createdAt: new Date(),
          user: { id: ids.user, displayName: "Reader" },
        }
      : null,
    reviewedBy: null,
    ...overrides,
  };
}
