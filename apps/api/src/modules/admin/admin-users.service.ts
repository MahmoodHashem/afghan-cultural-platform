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
import { AuditAction, EntryStatus, UserStatus } from "@/generated/prisma/enums";
import { ADMIN_USER_ERROR_CODES } from "@/modules/admin/admin.constants";
import type { UpdateAdminUserStatusDto } from "@/modules/admin/dto/admin-user-actions.dto";
import type {
  AdminUserActivityQueryDto,
  AdminUserEntriesQueryDto,
  AdminUserReviewsQueryDto,
  AdminUsersQueryDto,
} from "@/modules/admin/dto/admin-users-query.dto";
import { AuditService } from "@/modules/audit/audit.service";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";

const adminUserListSelect = {
  id: true,
  email: true,
  passwordHash: true,
  role: true,
  status: true,
  displayName: true,
  profileImageUrl: true,
  emailVerifiedAt: true,
  lastLoginAt: true,
  createdAt: true,
  oauthAccounts: {
    select: {
      provider: true,
    },
    orderBy: {
      provider: "asc" as const,
    },
  },
  _count: {
    select: {
      culturalEntries: true,
      publicReviews: true,
      bookmarks: true,
    },
  },
} as const;

const adminUserDetailSelect = {
  ...adminUserListSelect,
  biography: true,
  culturalInterests: true,
  suspendedAt: true,
  updatedAt: true,
  province: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  oauthAccounts: {
    select: {
      provider: true,
      createdAt: true,
    },
    orderBy: {
      provider: "asc" as const,
    },
  },
} as const;

const adminUserEntrySelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  status: true,
  submittedAt: true,
  publishedAt: true,
  updatedAt: true,
} as const;

const adminUserReviewSelect = {
  id: true,
  body: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  entry: {
    select: {
      id: true,
      slug: true,
      title: true,
    },
  },
} as const;

const adminUserActivitySelect = {
  id: true,
  action: true,
  metadata: true,
  createdAt: true,
  actor: {
    select: {
      id: true,
      displayName: true,
    },
  },
} as const;

const USER_ACCOUNT_AUDIT_ACTIONS = [
  AuditAction.USER_ROLE_CHANGED,
  AuditAction.USER_SUSPENDED,
  AuditAction.USER_REACTIVATED,
  AuditAction.USER_SESSIONS_REVOKED,
] as const;

type AdminUserListPayload = Prisma.UserGetPayload<{ select: typeof adminUserListSelect }>;
type AdminUserDetailPayload = Prisma.UserGetPayload<{ select: typeof adminUserDetailSelect }>;

@Injectable()
class AdminUsersService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuditService) private readonly auditService: AuditService,
  ) {}

  async listUsers(query: AdminUsersQueryDto) {
    const pagination = this.normalizePagination(query);
    const where = this.createUsersWhere(query);
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [query.sortBy ?? "createdAt"]: query.sortDirection ?? "desc",
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: adminUserListSelect,
        orderBy: [orderBy, { id: "asc" }],
        skip: this.skip(pagination),
        take: pagination.limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map(mapAdminUserListItem),
      meta: this.createMeta(pagination, total),
    };
  }

  async getUser(userId: string) {
    const now = new Date();
    const [user, entryStatusCounts, activeSessions, likes, reportsSubmitted, correctionsSubmitted] =
      await this.prisma.$transaction([
        this.prisma.user.findUnique({
          where: { id: userId },
          select: adminUserDetailSelect,
        }),
        this.prisma.culturalEntry.groupBy({
          by: ["status"],
          where: { authorId: userId },
          orderBy: { status: "asc" },
          _count: { _all: true },
        }),
        this.prisma.refreshSession.count({
          where: {
            userId,
            revokedAt: null,
            expiresAt: { gt: now },
          },
        }),
        this.prisma.like.count({ where: { userId } }),
        this.prisma.report.count({ where: { reportedById: userId } }),
        this.prisma.correctionSuggestion.count({ where: { submittedById: userId } }),
      ]);

    if (!user) {
      throw this.userNotFound();
    }

    return {
      data: {
        ...mapAdminUserListItem(user),
        biography: user.biography,
        province: user.province,
        culturalInterests: user.culturalInterests,
        emailVerifiedAt: user.emailVerifiedAt,
        suspendedAt: user.suspendedAt,
        updatedAt: user.updatedAt,
        providers: user.oauthAccounts.map((account) => ({
          provider: account.provider,
          connectedAt: account.createdAt,
        })),
        stats: {
          entries: createEntryStatusCounts(entryStatusCounts),
          reviews: user._count.publicReviews,
          bookmarks: user._count.bookmarks,
          likes,
          reportsSubmitted,
          correctionsSubmitted,
          activeSessions,
        },
      },
    };
  }

  async listUserEntries(userId: string, query: AdminUserEntriesQueryDto) {
    await this.ensureUserExists(userId);
    const pagination = this.normalizePagination(query);
    const where: Prisma.CulturalEntryWhereInput = {
      authorId: userId,
      ...(query.status ? { status: query.status } : {}),
    };

    const [entries, total] = await this.prisma.$transaction([
      this.prisma.culturalEntry.findMany({
        where,
        select: adminUserEntrySelect,
        orderBy: [{ updatedAt: query.sortDirection ?? "desc" }, { id: "asc" }],
        skip: this.skip(pagination),
        take: pagination.limit,
      }),
      this.prisma.culturalEntry.count({ where }),
    ]);

    return {
      data: entries,
      meta: this.createMeta(pagination, total),
    };
  }

  async listUserReviews(userId: string, query: AdminUserReviewsQueryDto) {
    await this.ensureUserExists(userId);
    const pagination = this.normalizePagination(query);
    const where: Prisma.PublicReviewWhereInput = {
      userId,
      ...(query.status ? { status: query.status } : {}),
    };

    const [reviews, total] = await this.prisma.$transaction([
      this.prisma.publicReview.findMany({
        where,
        select: adminUserReviewSelect,
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        skip: this.skip(pagination),
        take: pagination.limit,
      }),
      this.prisma.publicReview.count({ where }),
    ]);

    return {
      data: reviews,
      meta: this.createMeta(pagination, total),
    };
  }

  async listUserActivity(userId: string, query: AdminUserActivityQueryDto) {
    await this.ensureUserExists(userId);
    const pagination = this.normalizePagination(query);
    const where: Prisma.AuditLogWhereInput = {
      targetUserId: userId,
      action: { in: [...USER_ACCOUNT_AUDIT_ACTIONS] },
    };

    const [activity, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        select: adminUserActivitySelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: this.skip(pagination),
        take: pagination.limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: activity.map((item) => ({
        id: item.id,
        action: item.action,
        actor: item.actor,
        reason: readAuditReason(item.metadata),
        createdAt: item.createdAt,
      })),
      meta: this.createMeta(pagination, total),
    };
  }

  async updateUserStatus(
    actor: AuthenticatedUser,
    userId: string,
    input: UpdateAdminUserStatusDto,
  ) {
    if (actor.id === userId) {
      throw new ForbiddenException({
        error: ADMIN_USER_ERROR_CODES.SELF_ACTION_FORBIDDEN,
        message: "Administrators cannot change their own account status.",
      });
    }

    const reason = normalizeReason(input.reason);
    if (input.status === UserStatus.SUSPENDED && (!reason || reason.length < 3)) {
      throw new BadRequestException({
        error: ADMIN_USER_ERROR_CODES.SUSPENSION_REASON_REQUIRED,
        message: "A suspension reason of at least 3 characters is required.",
      });
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true },
    });

    if (!existingUser) {
      throw this.userNotFound();
    }

    if (existingUser.status === input.status) {
      const error =
        input.status === UserStatus.SUSPENDED
          ? ADMIN_USER_ERROR_CODES.ALREADY_SUSPENDED
          : ADMIN_USER_ERROR_CODES.ALREADY_ACTIVE;
      throw new ConflictException({
        error,
        message: "The user already has the requested status.",
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const changed = await tx.user.updateMany({
        where: {
          id: userId,
          status: existingUser.status,
        },
        data: {
          status: input.status,
          suspendedAt: input.status === UserStatus.SUSPENDED ? new Date() : null,
        },
      });

      if (changed.count !== 1) {
        throw new ConflictException({
          error: ADMIN_USER_ERROR_CODES.STATUS_CONFLICT,
          message: "The user status changed before this action completed.",
        });
      }

      let revokedSessions = 0;
      if (input.status === UserStatus.SUSPENDED) {
        const revoked = await tx.refreshSession.updateMany({
          where: { userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        revokedSessions = revoked.count;
      }

      const action =
        input.status === UserStatus.SUSPENDED
          ? AuditAction.USER_SUSPENDED
          : AuditAction.USER_REACTIVATED;
      await this.auditService.createWithClient(tx, {
        action,
        actorId: actor.id,
        targetUserId: userId,
        metadata: {
          previousStatus: existingUser.status,
          newStatus: input.status,
          reason,
          revokedSessions,
        },
      });

      const updated = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { id: true, status: true, suspendedAt: true },
      });

      return { data: updated };
    });
  }

  async revokeUserSessions(actor: AuthenticatedUser, userId: string) {
    await this.ensureUserExists(userId);

    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const result = await tx.refreshSession.updateMany({
        where: {
          userId,
          revokedAt: null,
          expiresAt: { gt: now },
        },
        data: { revokedAt: now },
      });

      await this.auditService.createWithClient(tx, {
        action: AuditAction.USER_SESSIONS_REVOKED,
        actorId: actor.id,
        targetUserId: userId,
        metadata: { revokedSessions: result.count },
      });

      return {
        data: {
          userId,
          revokedSessions: result.count,
        },
      };
    });
  }

  private createUsersWhere(query: AdminUsersQueryDto): Prisma.UserWhereInput {
    const search = query.search?.trim();

    return {
      ...(search
        ? {
            OR: [
              { displayName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(query.role ? { role: query.role } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.authMethod === "PASSWORD"
        ? { passwordHash: { not: null } }
        : query.authMethod
          ? { oauthAccounts: { some: { provider: query.authMethod } } }
          : {}),
      ...(query.emailVerified === undefined
        ? {}
        : {
            emailVerifiedAt: query.emailVerified ? { not: null } : null,
          }),
    };
  }

  private async ensureUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw this.userNotFound();
    }
  }

  private normalizePagination(query: { page?: number; limit?: number }) {
    return {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    };
  }

  private skip(query: { page: number; limit: number }) {
    return (query.page - 1) * query.limit;
  }

  private createMeta(query: { page: number; limit: number }, total: number) {
    return {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  private userNotFound() {
    return new NotFoundException({
      error: ADMIN_USER_ERROR_CODES.NOT_FOUND,
      message: "User was not found.",
    });
  }
}

function mapAdminUserListItem(user: AdminUserListPayload | AdminUserDetailPayload) {
  const authMethods: Array<"PASSWORD" | "GOOGLE" | "FACEBOOK"> = [];
  if (user.passwordHash) {
    authMethods.push("PASSWORD");
  }
  authMethods.push(...user.oauthAccounts.map((account) => account.provider));

  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    profileImageUrl: user.profileImageUrl,
    role: user.role,
    status: user.status,
    emailVerified: Boolean(user.emailVerifiedAt),
    authMethods,
    counts: {
      entries: user._count.culturalEntries,
      reviews: user._count.publicReviews,
      bookmarks: user._count.bookmarks,
    },
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

function createEntryStatusCounts(
  groupedCounts: Array<{ status: EntryStatus; _count?: true | { _all?: number } }>,
) {
  const byStatus = new Map(
    groupedCounts.map((item) => [item.status, getGroupCount(item._count)] as const),
  );

  return {
    total: groupedCounts.reduce((sum, item) => sum + getGroupCount(item._count), 0),
    draft: byStatus.get(EntryStatus.DRAFT) ?? 0,
    pendingReview: byStatus.get(EntryStatus.PENDING_REVIEW) ?? 0,
    changesRequested: byStatus.get(EntryStatus.CHANGES_REQUESTED) ?? 0,
    published: byStatus.get(EntryStatus.PUBLISHED) ?? 0,
    rejected: byStatus.get(EntryStatus.REJECTED) ?? 0,
    hidden: byStatus.get(EntryStatus.HIDDEN) ?? 0,
    archived: byStatus.get(EntryStatus.ARCHIVED) ?? 0,
  };
}

function getGroupCount(count: true | { _all?: number } | undefined) {
  return typeof count === "object" ? (count._all ?? 0) : 0;
}

function normalizeReason(reason: string | undefined) {
  const normalized = reason?.trim().replace(/\s+/g, " ");
  return normalized || null;
}

function readAuditReason(metadata: Prisma.JsonValue | null) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const reason = metadata.reason;
  return typeof reason === "string" ? reason : null;
}

export { AdminUsersService };
