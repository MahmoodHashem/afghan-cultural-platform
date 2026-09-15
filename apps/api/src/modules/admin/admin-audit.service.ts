import { BadRequestException, Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "../../database/prisma.service";
import type { Prisma } from "../../generated/prisma/client";
import type { AdminAuditQueryDto } from "./dto/admin-audit-query.dto";

const SAFE_METADATA_KEYS = new Set([
  "entryId",
  "entryKey",
  "reviewId",
  "versionNumber",
  "oldStatus",
  "newStatus",
  "authorId",
  "moderatorId",
  "reason",
  "revisionId",
  "baseVersionId",
  "correctionId",
  "section",
  "reportId",
  "targetType",
  "resolutionAction",
  "notes",
  "commentId",
  "previousStatus",
  "newStatus",
  "revokedSessions",
  "previousRole",
  "newRole",
]);

const personSelect = {
  id: true,
  displayName: true,
  role: true,
  profileImageUrl: true,
} satisfies Prisma.UserSelect;

const adminAuditSelect = {
  id: true,
  action: true,
  metadata: true,
  createdAt: true,
  actor: { select: personSelect },
  targetUser: { select: personSelect },
  entry: { select: { id: true, title: true, slug: true } },
  report: { select: { id: true, reason: true, status: true } },
  correctionSuggestion: { select: { id: true, section: true, status: true } },
  entryRevision: { select: { id: true, status: true } },
} satisfies Prisma.AuditLogSelect;

type AdminAuditRecord = Prisma.AuditLogGetPayload<{ select: typeof adminAuditSelect }>;

@Injectable()
class AdminAuditService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(query: AdminAuditQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const dateRange = this.createDateRange(query.dateFrom, query.dateTo);
    const search = query.search?.trim().replace(/\s+/g, " ");
    const where: Prisma.AuditLogWhereInput = {
      ...(query.action ? { action: query.action } : {}),
      ...(dateRange ? { createdAt: dateRange } : {}),
      ...(search
        ? {
            OR: [
              { actor: { is: { displayName: { contains: search, mode: "insensitive" } } } },
              { actor: { is: { email: { contains: search, mode: "insensitive" } } } },
              { targetUser: { is: { displayName: { contains: search, mode: "insensitive" } } } },
              { targetUser: { is: { email: { contains: search, mode: "insensitive" } } } },
              { entry: { is: { title: { contains: search, mode: "insensitive" } } } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        select: adminAuditSelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: items.map((item) => this.mapRecord(item)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  private createDateRange(dateFrom?: string, dateTo?: string): Prisma.DateTimeFilter | undefined {
    if (!dateFrom && !dateTo) return undefined;
    const from = dateFrom ? new Date(dateFrom) : undefined;
    const to = dateTo ? new Date(dateTo) : undefined;
    if (from && to && from > to) {
      throw new BadRequestException({
        code: "ADMIN_AUDIT_DATE_RANGE_INVALID",
        message: "Audit date range is invalid.",
      });
    }
    const exclusiveTo = to ? new Date(to.getTime() + 24 * 60 * 60 * 1000) : undefined;
    return { ...(from ? { gte: from } : {}), ...(exclusiveTo ? { lt: exclusiveTo } : {}) };
  }

  private mapRecord(item: AdminAuditRecord) {
    return { ...item, metadata: this.sanitizeMetadata(item.metadata) };
  }

  private sanitizeMetadata(value: Prisma.JsonValue | null) {
    if (!value || Array.isArray(value) || typeof value !== "object") return null;
    const safe: Record<string, string | number | boolean | null> = {};
    for (const [key, item] of Object.entries(value)) {
      if (
        SAFE_METADATA_KEYS.has(key) &&
        (item === null || ["string", "number", "boolean"].includes(typeof item))
      ) {
        safe[key] = item as string | number | boolean | null;
      }
    }
    return Object.keys(safe).length ? safe : null;
  }
}

export { AdminAuditService };
