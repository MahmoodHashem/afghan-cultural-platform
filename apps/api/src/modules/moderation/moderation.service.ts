import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "@/database/prisma.service";
import type { Prisma } from "@/generated/prisma/client";
import { AuditAction, EntryStatus, ModerationDecision } from "@/generated/prisma/enums";
import { AuditService } from "@/modules/audit/audit.service";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import { contentVersionSelect, mapContentVersion } from "@/modules/entries/entries.mapper";
import type {
  ApproveSubmissionDto,
  ModerationReasonDto,
} from "@/modules/moderation/dto/moderation-decision.dto";
import type { ModerationSubmissionsQueryDto } from "@/modules/moderation/dto/moderation-query.dto";
import { MODERATION_ERROR_CODES } from "@/modules/moderation/moderation.constants";

type NormalizedModerationQuery = {
  page: number;
  limit: number;
  sortDirection: "asc" | "desc";
};

const moderationTaxonomySelect = {
  id: true,
  name: true,
  slug: true,
} as const;

const moderationSubmissionSelect = {
  id: true,
  key: true,
  slug: true,
  status: true,
  authorId: true,
  submittedAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      displayName: true,
    },
  },
  province: {
    select: moderationTaxonomySelect,
  },
  category: {
    select: moderationTaxonomySelect,
  },
  contentType: {
    select: moderationTaxonomySelect,
  },
  contentVersions: {
    select: contentVersionSelect,
    orderBy: {
      versionNumber: "desc",
    },
    take: 1,
  },
} as const;

const moderationDecisionEntrySelect = {
  id: true,
  key: true,
  slug: true,
  status: true,
  authorId: true,
  publishedAt: true,
  contentVersions: {
    select: contentVersionSelect,
    orderBy: {
      versionNumber: "desc",
    },
    take: 1,
  },
} as const;

const moderationReviewSelect = {
  id: true,
  entryId: true,
  moderatorId: true,
  decision: true,
  comments: true,
  previousStatus: true,
  nextStatus: true,
  createdAt: true,
} as const;

type ModerationSubmissionPayload = Prisma.CulturalEntryGetPayload<{
  select: typeof moderationSubmissionSelect;
}>;
type ModerationDecisionEntryPayload = Prisma.CulturalEntryGetPayload<{
  select: typeof moderationDecisionEntrySelect;
}>;
type ModerationReviewPayload = Prisma.ModerationReviewGetPayload<{
  select: typeof moderationReviewSelect;
}>;

@Injectable()
class ModerationService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuditService) private readonly auditService: AuditService,
  ) {}

  async listSubmissions(query: ModerationSubmissionsQueryDto) {
    const normalizedQuery = this.normalizeQuery(query);
    const where = this.createQueueWhere(query);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.culturalEntry.findMany({
        where,
        select: moderationSubmissionSelect,
        orderBy: [{ updatedAt: normalizedQuery.sortDirection }, { createdAt: "desc" }],
        skip: this.skip(normalizedQuery),
        take: normalizedQuery.limit,
      }),
      this.prisma.culturalEntry.count({ where }),
    ]);

    return {
      data: items.map((item) => this.mapSubmission(item)),
      meta: {
        page: normalizedQuery.page,
        limit: normalizedQuery.limit,
        total,
        totalPages: Math.ceil(total / normalizedQuery.limit),
      },
    };
  }

  async getSubmission(id: string) {
    const entry = await this.prisma.culturalEntry.findFirst({
      where: {
        id,
        status: EntryStatus.PENDING_REVIEW,
      },
      select: moderationSubmissionSelect,
    });

    if (!entry) {
      throw this.submissionNotFound();
    }

    return {
      data: this.mapSubmission(entry),
    };
  }

  approveSubmission(user: AuthenticatedUser, id: string, input: ApproveSubmissionDto = {}) {
    return this.decideSubmission(user, id, {
      decision: ModerationDecision.APPROVE,
      nextStatus: EntryStatus.PUBLISHED,
      comments: this.normalizeOptionalText(input.comments),
      auditAction: AuditAction.ENTRY_APPROVED,
      forbidSelfApproval: true,
    });
  }

  requestChanges(user: AuthenticatedUser, id: string, input: ModerationReasonDto) {
    return this.decideSubmission(user, id, {
      decision: ModerationDecision.REQUEST_CHANGES,
      nextStatus: EntryStatus.CHANGES_REQUESTED,
      comments: this.normalizeRequiredReason(input.reason),
      auditAction: AuditAction.ENTRY_CHANGES_REQUESTED,
      forbidSelfApproval: false,
    });
  }

  rejectSubmission(user: AuthenticatedUser, id: string, input: ModerationReasonDto) {
    return this.decideSubmission(user, id, {
      decision: ModerationDecision.REJECT,
      nextStatus: EntryStatus.REJECTED,
      comments: this.normalizeRequiredReason(input.reason),
      auditAction: AuditAction.ENTRY_REJECTED,
      forbidSelfApproval: false,
    });
  }

  private async decideSubmission(
    user: AuthenticatedUser,
    id: string,
    decisionInput: {
      decision: ModerationDecision;
      nextStatus: EntryStatus;
      comments: string | null;
      auditAction: AuditAction;
      forbidSelfApproval: boolean;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const entry = await tx.culturalEntry.findUnique({
        where: { id },
        select: moderationDecisionEntrySelect,
      });

      if (!entry) {
        throw this.submissionNotFound();
      }

      if (entry.status !== EntryStatus.PENDING_REVIEW) {
        throw this.alreadyDecided();
      }

      if (decisionInput.forbidSelfApproval && entry.authorId === user.id) {
        throw this.selfApprovalForbidden();
      }

      const submittedVersion = this.getSubmittedVersion(entry);
      const now = new Date();
      const updateData: Prisma.CulturalEntryUncheckedUpdateManyInput = {
        ...(decisionInput.nextStatus === EntryStatus.PUBLISHED
          ? this.createPublishedEntryData(submittedVersion.snapshot)
          : {}),
        status: decisionInput.nextStatus,
        ...(decisionInput.nextStatus === EntryStatus.PUBLISHED
          ? {
              publishedAt: now,
              hiddenAt: null,
              archivedAt: null,
            }
          : {}),
      };
      const updateResult = await tx.culturalEntry.updateMany({
        where: {
          id: entry.id,
          status: EntryStatus.PENDING_REVIEW,
        },
        data: updateData,
      });

      if (updateResult.count !== 1) {
        throw this.moderationConflict();
      }

      const review = await tx.moderationReview.create({
        data: {
          entryId: entry.id,
          moderatorId: user.id,
          decision: decisionInput.decision,
          comments: decisionInput.comments,
          previousStatus: EntryStatus.PENDING_REVIEW,
          nextStatus: decisionInput.nextStatus,
        },
        select: moderationReviewSelect,
      });
      const contentVersion = await tx.contentVersion.update({
        where: { id: submittedVersion.id },
        data: {
          moderationReviewId: review.id,
        },
        select: contentVersionSelect,
      });

      await this.auditService.createWithClient(tx, {
        action: decisionInput.auditAction,
        actorId: user.id,
        entryId: entry.id,
        metadata: {
          entryId: entry.id,
          entryKey: entry.key,
          reviewId: review.id,
          versionNumber: contentVersion.versionNumber,
          oldStatus: EntryStatus.PENDING_REVIEW,
          newStatus: decisionInput.nextStatus,
          moderatorId: user.id,
          reason: decisionInput.comments,
        },
      });

      const updatedEntry = await tx.culturalEntry.findUnique({
        where: { id: entry.id },
        select: {
          id: true,
          key: true,
          slug: true,
          status: true,
          publishedAt: true,
        },
      });

      if (!updatedEntry) {
        throw this.submissionNotFound();
      }

      return {
        data: {
          entry: updatedEntry,
          review: this.mapReview(review),
          contentVersion: mapContentVersion(contentVersion),
        },
      };
    });
  }

  private createQueueWhere(query: ModerationSubmissionsQueryDto): Prisma.CulturalEntryWhereInput {
    return {
      status: EntryStatus.PENDING_REVIEW,
      ...(query.authorId ? { authorId: query.authorId } : {}),
      ...(query.provinceId ? { provinceId: query.provinceId } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.contentTypeId ? { contentTypeId: query.contentTypeId } : {}),
    };
  }

  private normalizeQuery(query: ModerationSubmissionsQueryDto): NormalizedModerationQuery {
    return {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      sortDirection: query.sortDirection ?? "desc",
    };
  }

  private skip(query: NormalizedModerationQuery): number {
    return (query.page - 1) * query.limit;
  }

  private getSubmittedVersion(entry: ModerationDecisionEntryPayload) {
    const submittedVersion = entry.contentVersions[0];

    if (!submittedVersion) {
      throw this.submissionNotFound();
    }

    return submittedVersion;
  }

  private mapSubmission(entry: ModerationSubmissionPayload) {
    return {
      id: entry.id,
      key: entry.key,
      slug: entry.slug,
      status: entry.status,
      authorId: entry.authorId,
      author: entry.author,
      province: entry.province,
      category: entry.category,
      contentType: entry.contentType,
      submittedAt: entry.submittedAt,
      updatedAt: entry.updatedAt,
      submittedVersion: entry.contentVersions[0]
        ? mapContentVersion(entry.contentVersions[0])
        : null,
    };
  }

  private mapReview(review: ModerationReviewPayload) {
    return {
      id: review.id,
      entryId: review.entryId,
      moderatorId: review.moderatorId,
      decision: review.decision,
      comments: review.comments,
      previousStatus: review.previousStatus,
      nextStatus: review.nextStatus,
      createdAt: review.createdAt,
    };
  }

  private normalizeOptionalText(value: string | undefined): string | null {
    const normalizedText = value?.trim().replace(/\s+/g, " ");

    return normalizedText || null;
  }

  private normalizeRequiredReason(reason: string): string {
    const normalizedReason = reason.trim().replace(/\s+/g, " ");

    if (!normalizedReason) {
      throw new BadRequestException({
        error: MODERATION_ERROR_CODES.REASON_REQUIRED,
        message: "Moderation reason is required.",
      });
    }

    return normalizedReason;
  }

  private createPublishedEntryData(
    snapshot: Prisma.JsonValue,
  ): Prisma.CulturalEntryUncheckedUpdateManyInput {
    if (!this.isRecord(snapshot)) {
      return {};
    }

    const data: Prisma.CulturalEntryUncheckedUpdateManyInput = {};

    this.assignString(data, "title", snapshot.title);
    this.assignString(data, "summary", snapshot.summary);
    this.assignString(data, "plainTextContent", snapshot.plainTextContent);
    this.assignString(data, "normalizedSearchText", snapshot.normalizedSearchText);
    this.assignNullableString(data, "slug", snapshot.slug);
    this.assignNullableString(data, "villageOrLocation", snapshot.villageOrLocation);

    if (this.isRecord(snapshot.contentJson)) {
      data.contentJson = snapshot.contentJson as Prisma.InputJsonValue;
    }

    const provinceId = this.readSnapshotId(snapshot.province);
    const categoryId = this.readSnapshotId(snapshot.category);
    const contentTypeId = this.readSnapshotId(snapshot.contentType);
    const districtId = this.readSnapshotId(snapshot.district);

    if (provinceId) {
      data.provinceId = provinceId;
    }

    if (categoryId) {
      data.categoryId = categoryId;
    }

    if (contentTypeId) {
      data.contentTypeId = contentTypeId;
    }

    data.districtId = districtId;

    return data;
  }

  private assignString(
    data: Prisma.CulturalEntryUncheckedUpdateManyInput,
    field: string,
    value: unknown,
  ): void {
    if (typeof value === "string" && value.trim()) {
      (data as Record<string, unknown>)[field] = value;
    }
  }

  private assignNullableString(
    data: Prisma.CulturalEntryUncheckedUpdateManyInput,
    field: string,
    value: unknown,
  ): void {
    if (typeof value === "string" || value === null) {
      (data as Record<string, unknown>)[field] = value;
    }
  }

  private readSnapshotId(value: unknown): string | null {
    if (!this.isRecord(value)) {
      return null;
    }

    return typeof value.id === "string" ? value.id : null;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private submissionNotFound(): NotFoundException {
    return new NotFoundException({
      error: MODERATION_ERROR_CODES.SUBMISSION_NOT_FOUND,
      message: "Moderation submission was not found.",
    });
  }

  private selfApprovalForbidden(): ForbiddenException {
    return new ForbiddenException({
      error: MODERATION_ERROR_CODES.SELF_APPROVAL_FORBIDDEN,
      message: "A moderator cannot approve their own submission.",
    });
  }

  private alreadyDecided(): ConflictException {
    return new ConflictException({
      error: MODERATION_ERROR_CODES.ALREADY_DECIDED,
      message: "This submission has already been decided.",
    });
  }

  private moderationConflict(): ConflictException {
    return new ConflictException({
      error: MODERATION_ERROR_CODES.CONFLICT,
      message: "Another moderator already changed this submission.",
    });
  }
}

export { ModerationService };
