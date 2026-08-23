import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "@/database/prisma.service";
import type { Prisma } from "@/generated/prisma/client";
import {
  AuditAction,
  EntryStatus,
  ModerationDecision,
  ReportStatus,
} from "@/generated/prisma/enums";
import { ADMIN_ENTRY_ERROR_CODES } from "@/modules/admin/admin.constants";
import type { AdminEntriesQueryDto } from "@/modules/admin/dto/admin-entries-query.dto";
import type { AdminEntryLifecycleReasonDto } from "@/modules/admin/dto/admin-entry-actions.dto";
import { AuditService } from "@/modules/audit/audit.service";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import { entrySelect, mapEntry } from "@/modules/entries/entries.mapper";

const taxonomySelect = { id: true, name: true, slug: true, isActive: true } as const;
const authorSelect = {
  id: true,
  displayName: true,
  email: true,
  profileImageUrl: true,
} as const;

const adminEntryListSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  status: true,
  geographicScope: true,
  viewCount: true,
  submittedAt: true,
  publishedAt: true,
  archivedAt: true,
  createdAt: true,
  updatedAt: true,
  author: { select: authorSelect },
  province: { select: taxonomySelect },
  category: { select: taxonomySelect },
  contentType: { select: taxonomySelect },
  images: {
    where: { isRemoved: false },
    select: { thumbnailUrl: true, secureUrl: true },
    orderBy: { displayOrder: "asc" as const },
    take: 1,
  },
  _count: {
    select: {
      likes: true,
      bookmarks: true,
      comments: true,
      reports: { where: { status: ReportStatus.OPEN } },
    },
  },
} as const;

const adminEntryDetailSelect = {
  ...entrySelect,
  historicalPeriod: true,
  culturalCommunity: true,
  alternativeLocalName: true,
  regionalDifferences: true,
  viewCount: true,
  submittedAt: true,
  publishedAt: true,
  hiddenAt: true,
  archivedAt: true,
  author: { select: authorSelect },
  province: { select: taxonomySelect },
  district: { select: { ...taxonomySelect, provinceId: true } },
  category: { select: taxonomySelect },
  contentType: { select: taxonomySelect },
  contentVersions: {
    select: {
      id: true,
      versionNumber: true,
      versionReason: true,
      createdAt: true,
      createdBy: { select: { id: true, displayName: true } },
    },
    orderBy: { versionNumber: "desc" as const },
  },
  moderationReviews: {
    select: {
      id: true,
      decision: true,
      comments: true,
      previousStatus: true,
      nextStatus: true,
      createdAt: true,
      moderator: { select: { id: true, displayName: true } },
    },
    orderBy: { createdAt: "desc" as const },
  },
  outgoingReferences: {
    select: {
      id: true,
      targetEntryId: true,
      anchorText: true,
      targetEntry: { select: { id: true, slug: true, title: true, status: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
  incomingReferences: {
    select: {
      id: true,
      sourceEntryId: true,
      anchorText: true,
      sourceEntry: { select: { id: true, slug: true, title: true, status: true } },
    },
    orderBy: { createdAt: "desc" as const },
    take: 20,
  },
  _count: {
    select: {
      likes: true,
      bookmarks: true,
      comments: true,
      reports: { where: { status: ReportStatus.OPEN } },
      correctionSuggestions: true,
    },
  },
} as const;

type AdminEntryListPayload = Prisma.CulturalEntryGetPayload<{
  select: typeof adminEntryListSelect;
}>;

@Injectable()
class AdminEntriesService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuditService) private readonly auditService: AuditService,
  ) {}

  async listEntries(query: AdminEntriesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.createWhere(query);
    const orderBy = this.createOrderBy(query);

    const [entries, total, groupedCounts] = await this.prisma.$transaction([
      this.prisma.culturalEntry.findMany({
        where,
        select: adminEntryListSelect,
        orderBy: [orderBy, { id: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.culturalEntry.count({ where }),
      this.prisma.culturalEntry.groupBy({
        by: ["status"],
        orderBy: { status: "asc" },
        _count: { _all: true },
      }),
    ]);

    return {
      data: entries.map(mapAdminEntryListItem),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      statusCounts: Object.values(EntryStatus).map((status) => ({
        status,
        count: readGroupedCount(groupedCounts.find((item) => item.status === status)?._count),
      })),
    };
  }

  async getEntry(entryId: string) {
    const entry = await this.prisma.culturalEntry.findUnique({
      where: { id: entryId },
      select: adminEntryDetailSelect,
    });

    if (!entry) throw this.notFound();

    const mappedEntry = mapEntry(entry);
    return {
      data: {
        ...mappedEntry,
        historicalPeriod: entry.historicalPeriod,
        culturalCommunity: entry.culturalCommunity,
        alternativeLocalName: entry.alternativeLocalName,
        regionalDifferences: entry.regionalDifferences,
        viewCount: entry.viewCount,
        submittedAt: entry.submittedAt,
        publishedAt: entry.publishedAt,
        hiddenAt: entry.hiddenAt,
        archivedAt: entry.archivedAt,
        contentVersions: entry.contentVersions.map((version) => ({
          id: version.id,
          versionNumber: version.versionNumber,
          versionReason: version.versionReason,
          creator: version.createdBy,
          createdAt: version.createdAt,
        })),
        moderationHistory: entry.moderationReviews,
        outgoingReferences: entry.outgoingReferences,
        incomingReferences: entry.incomingReferences,
        counts: {
          likes: entry._count.likes,
          bookmarks: entry._count.bookmarks,
          comments: entry._count.comments,
          openReports: entry._count.reports,
          corrections: entry._count.correctionSuggestions,
        },
      },
    };
  }

  archiveEntry(actor: AuthenticatedUser, entryId: string, input: AdminEntryLifecycleReasonDto) {
    return this.changeLifecycle({
      actor,
      entryId,
      reason: input.reason,
      from: EntryStatus.PUBLISHED,
      to: EntryStatus.ARCHIVED,
      decision: ModerationDecision.ARCHIVE,
      auditAction: AuditAction.ENTRY_ARCHIVED,
    });
  }

  restoreEntry(actor: AuthenticatedUser, entryId: string, input: AdminEntryLifecycleReasonDto) {
    return this.changeLifecycle({
      actor,
      entryId,
      reason: input.reason,
      from: EntryStatus.ARCHIVED,
      to: EntryStatus.PUBLISHED,
      decision: ModerationDecision.RESTORE,
      auditAction: AuditAction.ENTRY_RESTORED,
    });
  }

  private async changeLifecycle(input: {
    actor: AuthenticatedUser;
    entryId: string;
    reason: string;
    from: EntryStatus;
    to: EntryStatus;
    decision: ModerationDecision;
    auditAction: AuditAction;
  }) {
    const reason = normalizeReason(input.reason);
    if (!reason || reason.length < 3) {
      throw new BadRequestException({
        error: ADMIN_ENTRY_ERROR_CODES.REASON_REQUIRED,
        message: "A reason of at least 3 characters is required.",
      });
    }

    const existing = await this.prisma.culturalEntry.findUnique({
      where: { id: input.entryId },
      select: { id: true, key: true, slug: true, status: true, publishedAt: true },
    });
    if (!existing) throw this.notFound();

    if (existing.status === input.to) {
      throw new ConflictException({
        error:
          input.to === EntryStatus.ARCHIVED
            ? ADMIN_ENTRY_ERROR_CODES.ALREADY_ARCHIVED
            : ADMIN_ENTRY_ERROR_CODES.ALREADY_RESTORED,
        message: "The entry already has the requested lifecycle status.",
      });
    }
    if (existing.status !== input.from) {
      throw new BadRequestException({
        error: ADMIN_ENTRY_ERROR_CODES.INVALID_STATUS,
        message: "The entry cannot perform this lifecycle transition.",
      });
    }
    if (input.to === EntryStatus.PUBLISHED && !existing.publishedAt) {
      throw new BadRequestException({
        error: ADMIN_ENTRY_ERROR_CODES.INVALID_STATUS,
        message: "Only previously published entries can be restored.",
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const changed = await tx.culturalEntry.updateMany({
        where: {
          id: input.entryId,
          status: input.from,
          ...(input.to === EntryStatus.PUBLISHED ? { publishedAt: { not: null } } : {}),
        },
        data: {
          status: input.to,
          archivedAt: input.to === EntryStatus.ARCHIVED ? now : null,
        },
      });
      if (changed.count !== 1) {
        throw new ConflictException({
          error: ADMIN_ENTRY_ERROR_CODES.LIFECYCLE_CONFLICT,
          message: "The entry lifecycle changed before this action completed.",
        });
      }

      const review = await tx.moderationReview.create({
        data: {
          entryId: input.entryId,
          moderatorId: input.actor.id,
          decision: input.decision,
          comments: reason,
          previousStatus: input.from,
          nextStatus: input.to,
        },
        select: {
          id: true,
          decision: true,
          comments: true,
          previousStatus: true,
          nextStatus: true,
          createdAt: true,
        },
      });

      await this.auditService.createWithClient(tx, {
        action: input.auditAction,
        actorId: input.actor.id,
        entryId: input.entryId,
        metadata: {
          entryId: input.entryId,
          entryKey: existing.key,
          reviewId: review.id,
          oldStatus: input.from,
          newStatus: input.to,
          reason,
        },
      });

      const entry = await tx.culturalEntry.findUniqueOrThrow({
        where: { id: input.entryId },
        select: {
          id: true,
          slug: true,
          status: true,
          publishedAt: true,
          archivedAt: true,
          updatedAt: true,
        },
      });
      return { data: { entry, review } };
    });
  }

  private createWhere(query: AdminEntriesQueryDto): Prisma.CulturalEntryWhereInput {
    const search = query.search?.trim();
    const normalizedSearch = search ? normalizePersianSearch(search) : null;
    return {
      ...(normalizedSearch
        ? {
            OR: [
              { normalizedSearchText: { contains: normalizedSearch } },
              { title: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
              { author: { displayName: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.contentTypeId ? { contentTypeId: query.contentTypeId } : {}),
      ...(query.provinceId ? { provinceId: query.provinceId } : {}),
      ...(query.authorId ? { authorId: query.authorId } : {}),
      ...(query.geographicScope ? { geographicScope: query.geographicScope } : {}),
    };
  }

  private createOrderBy(query: AdminEntriesQueryDto): Prisma.CulturalEntryOrderByWithRelationInput {
    return { [query.sortBy ?? "updatedAt"]: query.sortDirection ?? "desc" };
  }

  private notFound() {
    return new NotFoundException({
      error: ADMIN_ENTRY_ERROR_CODES.NOT_FOUND,
      message: "Cultural Entry was not found.",
    });
  }
}

function mapAdminEntryListItem(entry: AdminEntryListPayload) {
  return {
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    summary: entry.summary,
    status: entry.status,
    geographicScope: entry.geographicScope,
    thumbnailUrl: entry.images[0]?.thumbnailUrl ?? entry.images[0]?.secureUrl ?? null,
    author: entry.author,
    province: entry.province,
    category: entry.category,
    contentType: entry.contentType,
    viewCount: entry.viewCount,
    counts: {
      likes: entry._count.likes,
      bookmarks: entry._count.bookmarks,
      comments: entry._count.comments,
      openReports: entry._count.reports,
    },
    submittedAt: entry.submittedAt,
    publishedAt: entry.publishedAt,
    archivedAt: entry.archivedAt,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

function normalizePersianSearch(value: string) {
  return value
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[\u200C\u200D]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("fa-AF");
}

function normalizeReason(value: string | undefined) {
  const normalized = value?.trim().replace(/\s+/g, " ");
  return normalized || null;
}

function readGroupedCount(count: true | { _all?: number } | undefined) {
  return typeof count === "object" ? (count._all ?? 0) : 0;
}

export { AdminEntriesService };
