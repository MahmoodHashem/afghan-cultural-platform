import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../../database/prisma.service";
import type { Prisma } from "../../generated/prisma/client";
import {
  AuditAction,
  CorrectionStatus,
  EntryCommentStatus,
  EntryStatus,
  ReportResolutionAction,
  ReportStatus,
  VersionReason,
} from "../../generated/prisma/enums";
import { AuditService } from "../audit/audit.service";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import type {
  CorrectionDecisionDto,
  CorrectionQueueQueryDto,
  CorrectionRejectionDto,
  ModerationHistoryQueryDto,
  ReportQueueQueryDto,
  ResolveReportDto,
  SubmitCorrectionDto,
  SubmitReportDto,
} from "./dto/content-moderation.dto";
import { MODERATION_ERROR_CODES } from "./moderation.constants";

const correctionSelect = {
  id: true,
  entryId: true,
  submittedById: true,
  reviewedById: true,
  status: true,
  section: true,
  proposedCorrection: true,
  reason: true,
  sourceText: true,
  reviewerComments: true,
  acceptedVersionId: true,
  submittedAt: true,
  reviewedAt: true,
  createdAt: true,
  entry: {
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      plainTextContent: true,
      status: true,
    },
  },
  submittedBy: {
    select: { id: true, displayName: true },
  },
  reviewedBy: {
    select: { id: true, displayName: true },
  },
} as const;

const reportSelect = {
  id: true,
  entryId: true,
  entryCommentId: true,
  reviewedById: true,
  reason: true,
  explanation: true,
  status: true,
  resolutionAction: true,
  resolutionNotes: true,
  resolvedAt: true,
  createdAt: true,
  updatedAt: true,
  entry: {
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      status: true,
      publishedAt: true,
    },
  },
  entryComment: {
    select: {
      id: true,
      body: true,
      status: true,
      createdAt: true,
      author: {
        select: { id: true, displayName: true },
      },
    },
  },
  reviewedBy: {
    select: { id: true, displayName: true },
  },
} as const;

const historyActions = [
  AuditAction.ENTRY_SUBMITTED,
  AuditAction.ENTRY_APPROVED,
  AuditAction.ENTRY_REJECTED,
  AuditAction.ENTRY_CHANGES_REQUESTED,
  AuditAction.ENTRY_HIDDEN,
  AuditAction.ENTRY_RESTORED,
  AuditAction.CORRECTION_SUBMITTED,
  AuditAction.CORRECTION_ACCEPTED,
  AuditAction.CORRECTION_REJECTED,
  AuditAction.REPORT_SUBMITTED,
  AuditAction.REPORT_RESOLVED,
  AuditAction.COMMENT_HIDDEN,
] as const;

@Injectable()
class ContentModerationService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuditService) private readonly auditService: AuditService,
  ) {}

  async submitCorrection(user: AuthenticatedUser, entryId: string, input: SubmitCorrectionDto) {
    const entry = await this.prisma.culturalEntry.findFirst({
      where: { id: entryId, status: EntryStatus.PUBLISHED, publishedAt: { not: null } },
      select: { id: true },
    });

    if (!entry) {
      throw this.notFound(
        MODERATION_ERROR_CODES.CORRECTION_ENTRY_NOT_FOUND,
        "Published entry was not found.",
      );
    }

    const proposedCorrection = this.normalizeCorrection(input.section, input.proposedCorrection);
    const reason = this.normalizeRequired(input.reason);
    const sourceText = this.normalizeOptional(input.sourceText);

    return this.prisma.$transaction(async (tx) => {
      const pending = await tx.correctionSuggestion.findFirst({
        where: {
          entryId,
          submittedById: user.id,
          section: input.section,
          status: CorrectionStatus.PENDING,
        },
        select: { id: true },
      });

      if (pending) {
        throw this.conflict(
          MODERATION_ERROR_CODES.CORRECTION_ALREADY_PENDING,
          "A pending correction already exists for this section.",
        );
      }

      const correction = await tx.correctionSuggestion.create({
        data: {
          entryId,
          submittedById: user.id,
          section: input.section,
          proposedCorrection,
          reason,
          sourceText,
        },
        select: correctionSelect,
      });

      await this.auditService.createWithClient(tx, {
        action: AuditAction.CORRECTION_SUBMITTED,
        actorId: user.id,
        entryId,
        correctionSuggestionId: correction.id,
        metadata: { entryId, correctionId: correction.id, section: input.section },
      });

      return { data: this.mapCorrection(correction) };
    });
  }

  async listCorrections(query: CorrectionQueueQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.CorrectionSuggestionWhereInput = {
      status: query.status ?? CorrectionStatus.PENDING,
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.correctionSuggestion.findMany({
        where,
        select: correctionSelect,
        orderBy: [{ submittedAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.correctionSuggestion.count({ where }),
    ]);

    return this.page(
      items.map((item) => this.mapCorrection(item)),
      page,
      limit,
      total,
    );
  }

  async getCorrection(id: string) {
    const correction = await this.prisma.correctionSuggestion.findUnique({
      where: { id },
      select: correctionSelect,
    });

    if (!correction) {
      throw this.notFound(MODERATION_ERROR_CODES.CORRECTION_NOT_FOUND, "Correction was not found.");
    }

    return { data: this.mapCorrection(correction) };
  }

  async acceptCorrection(user: AuthenticatedUser, id: string, input: CorrectionDecisionDto) {
    return this.prisma.$transaction(async (tx) => {
      const correction = await tx.correctionSuggestion.findUnique({
        where: { id },
        select: {
          ...correctionSelect,
          entry: {
            select: {
              id: true,
              key: true,
              slug: true,
              title: true,
              summary: true,
              contentJson: true,
              plainTextContent: true,
              normalizedSearchText: true,
              status: true,
              contentVersions: {
                select: { id: true, versionNumber: true, snapshot: true },
                orderBy: { versionNumber: "desc" },
                take: 1,
              },
            },
          },
        },
      });

      if (!correction) {
        throw this.notFound(
          MODERATION_ERROR_CODES.CORRECTION_NOT_FOUND,
          "Correction was not found.",
        );
      }

      if (correction.status !== CorrectionStatus.PENDING) {
        throw this.conflict(
          MODERATION_ERROR_CODES.CORRECTION_ALREADY_DECIDED,
          "Correction has already been decided.",
        );
      }

      if (correction.submittedById === user.id) {
        throw new ForbiddenException({
          error: MODERATION_ERROR_CODES.CORRECTION_SELF_REVIEW_FORBIDDEN,
          message: "A moderator cannot accept their own correction.",
        });
      }

      if (correction.entry.status !== EntryStatus.PUBLISHED) {
        throw this.conflict(
          MODERATION_ERROR_CODES.CORRECTION_CONFLICT,
          "The published entry is no longer available for correction.",
        );
      }

      const latestVersion = correction.entry.contentVersions[0];
      if (!latestVersion || !this.isRecord(latestVersion.snapshot)) {
        throw this.conflict(
          MODERATION_ERROR_CODES.CORRECTION_CONFLICT,
          "The published version could not be loaded.",
        );
      }

      const patched = this.applyCorrection(correction.entry, latestVersion.snapshot, correction);
      const versionNumber = latestVersion.versionNumber + 1;
      const version = await tx.contentVersion.create({
        data: {
          entryId: correction.entryId,
          versionNumber,
          snapshot: patched.snapshot,
          plainTextContent: patched.plainTextContent,
          versionReason: VersionReason.ACCEPTED_CORRECTION,
          createdById: user.id,
          correctionSuggestionId: correction.id,
        },
        select: { id: true, versionNumber: true, createdAt: true },
      });

      const entryUpdate = await tx.culturalEntry.updateMany({
        where: { id: correction.entryId, status: EntryStatus.PUBLISHED },
        data: patched.entryData,
      });
      if (entryUpdate.count !== 1) {
        throw this.conflict(MODERATION_ERROR_CODES.CORRECTION_CONFLICT, "Correction conflict.");
      }

      const correctionUpdate = await tx.correctionSuggestion.updateMany({
        where: { id, status: CorrectionStatus.PENDING },
        data: {
          status: CorrectionStatus.ACCEPTED,
          reviewedById: user.id,
          reviewerComments: this.normalizeOptional(input.comments),
          acceptedVersionId: version.id,
          reviewedAt: new Date(),
        },
      });
      if (correctionUpdate.count !== 1) {
        throw this.conflict(MODERATION_ERROR_CODES.CORRECTION_CONFLICT, "Correction conflict.");
      }

      await this.auditService.createWithClient(tx, {
        action: AuditAction.CORRECTION_ACCEPTED,
        actorId: user.id,
        entryId: correction.entryId,
        correctionSuggestionId: correction.id,
        metadata: {
          entryId: correction.entryId,
          correctionId: correction.id,
          section: correction.section,
          versionNumber,
        },
      });

      return this.getCorrectionWithClient(tx, id);
    });
  }

  async rejectCorrection(user: AuthenticatedUser, id: string, input: CorrectionRejectionDto) {
    return this.prisma.$transaction(async (tx) => {
      const correction = await tx.correctionSuggestion.findUnique({
        where: { id },
        select: { id: true, entryId: true, status: true },
      });
      if (!correction) {
        throw this.notFound(
          MODERATION_ERROR_CODES.CORRECTION_NOT_FOUND,
          "Correction was not found.",
        );
      }
      if (correction.status !== CorrectionStatus.PENDING) {
        throw this.conflict(
          MODERATION_ERROR_CODES.CORRECTION_ALREADY_DECIDED,
          "Correction has already been decided.",
        );
      }

      const update = await tx.correctionSuggestion.updateMany({
        where: { id, status: CorrectionStatus.PENDING },
        data: {
          status: CorrectionStatus.REJECTED,
          reviewedById: user.id,
          reviewerComments: this.normalizeRequired(input.reason),
          reviewedAt: new Date(),
        },
      });
      if (update.count !== 1) {
        throw this.conflict(MODERATION_ERROR_CODES.CORRECTION_CONFLICT, "Correction conflict.");
      }

      await this.auditService.createWithClient(tx, {
        action: AuditAction.CORRECTION_REJECTED,
        actorId: user.id,
        entryId: correction.entryId,
        correctionSuggestionId: correction.id,
        metadata: {
          entryId: correction.entryId,
          correctionId: correction.id,
          reason: input.reason,
        },
      });

      return this.getCorrectionWithClient(tx, id);
    });
  }

  async submitReport(
    user: AuthenticatedUser,
    entryId: string,
    entryCommentId: string | null,
    input: SubmitReportDto,
  ) {
    await this.ensureReportTarget(entryId, entryCommentId);

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.report.findFirst({
        where: {
          entryId,
          entryCommentId,
          reportedById: user.id,
          status: { in: [ReportStatus.OPEN, ReportStatus.UNDER_REVIEW] },
        },
        select: { id: true },
      });
      if (existing) {
        throw this.conflict(
          MODERATION_ERROR_CODES.REPORT_ALREADY_OPEN,
          "An unresolved report already exists for this target.",
        );
      }

      const report = await tx.report.create({
        data: {
          entryId,
          entryCommentId,
          reportedById: user.id,
          reason: input.reason,
          explanation: this.normalizeRequired(input.explanation),
        },
        select: reportSelect,
      });

      await this.auditService.createWithClient(tx, {
        action: AuditAction.REPORT_SUBMITTED,
        actorId: user.id,
        entryId,
        reportId: report.id,
        metadata: {
          entryId,
          reportId: report.id,
          targetType: entryCommentId ? "COMMENT" : "ENTRY",
        },
      });

      return { data: this.mapReport(report) };
    });
  }

  async listReports(query: ReportQueueQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ReportWhereInput = {
      ...(query.status ? { status: query.status } : { status: { not: ReportStatus.RESOLVED } }),
      ...(query.reason ? { reason: query.reason } : {}),
      ...(query.targetType === "ENTRY" ? { entryCommentId: null } : {}),
      ...(query.targetType === "COMMENT" ? { entryCommentId: { not: null } } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.report.findMany({
        where,
        select: reportSelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    return this.page(
      items.map((item) => this.mapReport(item)),
      page,
      limit,
      total,
    );
  }

  async getReport(id: string) {
    const report = await this.prisma.report.findUnique({ where: { id }, select: reportSelect });
    if (!report) {
      throw this.notFound(MODERATION_ERROR_CODES.REPORT_NOT_FOUND, "Report was not found.");
    }
    return { data: this.mapReport(report) };
  }

  async resolveReport(user: AuthenticatedUser, id: string, input: ResolveReportDto) {
    return this.prisma.$transaction(async (tx) => {
      const report = await tx.report.findUnique({ where: { id }, select: reportSelect });
      if (!report) {
        throw this.notFound(MODERATION_ERROR_CODES.REPORT_NOT_FOUND, "Report was not found.");
      }
      if (report.status === ReportStatus.RESOLVED) {
        throw this.conflict(
          MODERATION_ERROR_CODES.REPORT_ALREADY_RESOLVED,
          "Report has already been resolved.",
        );
      }

      this.validateReportAction(report.entryCommentId, input.resolutionAction);
      const claim = await tx.report.updateMany({
        where: { id, status: { in: [ReportStatus.OPEN, ReportStatus.UNDER_REVIEW] } },
        data: {
          status: ReportStatus.RESOLVED,
          reviewedById: user.id,
          resolutionAction: input.resolutionAction,
          resolutionNotes: this.normalizeRequired(input.notes),
          resolvedAt: new Date(),
        },
      });
      if (claim.count !== 1) {
        throw this.conflict(MODERATION_ERROR_CODES.REPORT_CONFLICT, "Report conflict.");
      }

      await this.applyReportAction(tx, user.id, report, input.resolutionAction);
      await this.auditService.createWithClient(tx, {
        action: AuditAction.REPORT_RESOLVED,
        actorId: user.id,
        entryId: report.entryId,
        reportId: report.id,
        metadata: {
          entryId: report.entryId,
          reportId: report.id,
          targetType: report.entryCommentId ? "COMMENT" : "ENTRY",
          resolutionAction: input.resolutionAction,
          notes: input.notes,
        },
      });

      const resolved = await tx.report.findUnique({ where: { id }, select: reportSelect });
      if (!resolved) {
        throw this.notFound(MODERATION_ERROR_CODES.REPORT_NOT_FOUND, "Report was not found.");
      }
      return { data: this.mapReport(resolved) };
    });
  }

  async listHistory(query: ModerationHistoryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const allowedAction = query.action && historyActions.includes(query.action as never);
    const where: Prisma.AuditLogWhereInput = {
      action: allowedAction ? query.action : { in: [...historyActions] },
      ...(query.entryId ? { entryId: query.entryId } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        select: {
          id: true,
          action: true,
          entryId: true,
          reportId: true,
          correctionSuggestionId: true,
          metadata: true,
          createdAt: true,
          actor: { select: { id: true, displayName: true } },
          entry: { select: { id: true, title: true, slug: true } },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return this.page(
      items.map((item) => ({
        ...item,
        actor: item.action === AuditAction.REPORT_SUBMITTED ? null : item.actor,
      })),
      page,
      limit,
      total,
    );
  }

  private async ensureReportTarget(entryId: string, entryCommentId: string | null) {
    const entry = await this.prisma.culturalEntry.findFirst({
      where: { id: entryId, status: EntryStatus.PUBLISHED, publishedAt: { not: null } },
      select: { id: true },
    });
    if (!entry) {
      throw this.notFound(
        MODERATION_ERROR_CODES.REPORT_TARGET_NOT_FOUND,
        "Report target not found.",
      );
    }
    if (entryCommentId) {
      const comment = await this.prisma.entryComment.findFirst({
        where: { id: entryCommentId, entryId, status: EntryCommentStatus.ACTIVE },
        select: { id: true },
      });
      if (!comment) {
        throw this.notFound(
          MODERATION_ERROR_CODES.REPORT_TARGET_NOT_FOUND,
          "Report target not found.",
        );
      }
    }
  }

  private async applyReportAction(
    tx: Prisma.TransactionClient,
    moderatorId: string,
    report: { entryId: string; entryCommentId: string | null },
    action: ReportResolutionAction,
  ) {
    if (action === ReportResolutionAction.HIDE_CONTENT) {
      await tx.culturalEntry.updateMany({
        where: { id: report.entryId, status: EntryStatus.PUBLISHED },
        data: { status: EntryStatus.HIDDEN, hiddenAt: new Date() },
      });
    }
    if (action === ReportResolutionAction.ARCHIVE_CONTENT) {
      await tx.culturalEntry.updateMany({
        where: { id: report.entryId, status: { not: EntryStatus.ARCHIVED } },
        data: { status: EntryStatus.ARCHIVED, archivedAt: new Date() },
      });
    }
    if (action === ReportResolutionAction.HIDE_COMMENT && report.entryCommentId) {
      const comment = await tx.entryComment.updateMany({
        where: { id: report.entryCommentId, status: EntryCommentStatus.ACTIVE },
        data: { status: EntryCommentStatus.HIDDEN, hiddenById: moderatorId, hiddenAt: new Date() },
      });
      if (comment.count !== 1) {
        throw this.conflict(MODERATION_ERROR_CODES.REPORT_CONFLICT, "Comment is no longer active.");
      }
      await tx.commentLike.deleteMany({ where: { commentId: report.entryCommentId } });
      await this.auditService.createWithClient(tx, {
        action: AuditAction.COMMENT_HIDDEN,
        actorId: moderatorId,
        entryId: report.entryId,
        metadata: { commentId: report.entryCommentId },
      });
    }
  }

  private validateReportAction(entryCommentId: string | null, action: ReportResolutionAction) {
    const allowed: ReportResolutionAction[] = entryCommentId
      ? [ReportResolutionAction.DISMISS, ReportResolutionAction.HIDE_COMMENT]
      : [
          ReportResolutionAction.DISMISS,
          ReportResolutionAction.HIDE_CONTENT,
          ReportResolutionAction.ARCHIVE_CONTENT,
        ];
    if (!allowed.includes(action)) {
      throw new BadRequestException({
        error: MODERATION_ERROR_CODES.REPORT_ACTION_INVALID,
        message: "Resolution action is not valid for this report target.",
      });
    }
  }

  private applyCorrection(
    entry: {
      title: string;
      summary: string;
      contentJson: Prisma.JsonValue;
      plainTextContent: string;
      normalizedSearchText: string;
    },
    latestSnapshot: Record<string, unknown>,
    correction: { section: string; proposedCorrection: string },
  ) {
    const snapshot = { ...latestSnapshot } as Record<string, Prisma.InputJsonValue>;
    const entryData: Prisma.CulturalEntryUncheckedUpdateManyInput = {};
    let plainTextContent = entry.plainTextContent;

    if (correction.section === "TITLE") {
      snapshot.title = correction.proposedCorrection;
      entryData.title = correction.proposedCorrection;
    } else if (correction.section === "SUMMARY") {
      snapshot.summary = correction.proposedCorrection;
      entryData.summary = correction.proposedCorrection;
    } else if (correction.section === "CONTENT") {
      const contentJson = this.plainTextToTiptap(correction.proposedCorrection);
      plainTextContent = correction.proposedCorrection;
      snapshot.contentJson = contentJson;
      snapshot.plainTextContent = plainTextContent;
      entryData.contentJson = contentJson;
      entryData.plainTextContent = plainTextContent;
    } else {
      throw new BadRequestException({
        error: MODERATION_ERROR_CODES.CORRECTION_CONTENT_INVALID,
        message: "Unsupported correction section.",
      });
    }

    const title = typeof snapshot.title === "string" ? snapshot.title : entry.title;
    const summary = typeof snapshot.summary === "string" ? snapshot.summary : entry.summary;
    const normalizedSearchText = [title, summary, plainTextContent]
      .join(" ")
      .normalize("NFKC")
      .toLocaleLowerCase("fa-AF")
      .replace(/\s+/g, " ")
      .trim();
    snapshot.normalizedSearchText = normalizedSearchText;
    snapshot.versionReason = VersionReason.ACCEPTED_CORRECTION;
    entryData.normalizedSearchText = normalizedSearchText;

    return {
      snapshot: snapshot as Prisma.InputJsonValue,
      entryData,
      plainTextContent,
    };
  }

  private plainTextToTiptap(value: string): Prisma.InputJsonValue {
    return {
      type: "doc",
      content: value
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph) => ({
          type: "paragraph",
          content: [{ type: "text", text: paragraph }],
        })),
    };
  }

  private async getCorrectionWithClient(tx: Prisma.TransactionClient, id: string) {
    const correction = await tx.correctionSuggestion.findUnique({
      where: { id },
      select: correctionSelect,
    });
    if (!correction) {
      throw this.notFound(MODERATION_ERROR_CODES.CORRECTION_NOT_FOUND, "Correction was not found.");
    }
    return { data: this.mapCorrection(correction) };
  }

  private mapCorrection(
    correction: Prisma.CorrectionSuggestionGetPayload<{ select: typeof correctionSelect }>,
  ) {
    const originalText =
      correction.section === "TITLE"
        ? correction.entry.title
        : correction.section === "SUMMARY"
          ? correction.entry.summary
          : correction.entry.plainTextContent;
    return { ...correction, originalText };
  }

  private mapReport(report: Prisma.ReportGetPayload<{ select: typeof reportSelect }>) {
    return {
      id: report.id,
      entryId: report.entryId,
      entryCommentId: report.entryCommentId,
      targetType: report.entryCommentId ? "COMMENT" : "ENTRY",
      reason: report.reason,
      explanation: report.explanation,
      status: report.status,
      resolutionAction: report.resolutionAction,
      resolutionNotes: report.resolutionNotes,
      resolvedAt: report.resolvedAt,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      entry: report.entry,
      entryComment: report.entryComment,
      reviewedBy: report.reviewedBy,
    };
  }

  private normalizeCorrection(section: string, value: string) {
    const normalized = section === "CONTENT" ? value.trim() : value.trim().replace(/\s+/g, " ");
    const maxLength = section === "TITLE" ? 200 : section === "SUMMARY" ? 1000 : 20_000;
    if (!normalized || normalized.length > maxLength) {
      throw new BadRequestException({
        error: MODERATION_ERROR_CODES.CORRECTION_CONTENT_INVALID,
        message: "Correction content is invalid.",
      });
    }
    return normalized;
  }

  private normalizeRequired(value: string) {
    const normalized = value.trim().replace(/\s+/g, " ");
    if (!normalized) {
      throw new BadRequestException({
        error: MODERATION_ERROR_CODES.REASON_REQUIRED,
        message: "A reason is required.",
      });
    }
    return normalized;
  }

  private normalizeOptional(value?: string) {
    const normalized = value?.trim().replace(/\s+/g, " ");
    return normalized || null;
  }

  private page<T>(items: T[], page: number, limit: number, total: number) {
    return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private notFound(code: string, message: string) {
    return new NotFoundException({ error: code, message });
  }

  private conflict(code: string, message: string) {
    return new ConflictException({ error: code, message });
  }
}

export { ContentModerationService };
