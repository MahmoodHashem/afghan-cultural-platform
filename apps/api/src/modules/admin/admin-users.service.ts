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
import { AuditAction, EntryStatus, UserRole, UserStatus } from "../../generated/prisma/enums";
import { AuditService } from "../audit/audit.service";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { ADMIN_USER_ERROR_CODES } from "./admin.constants";
import type {
  UpdateAdminUserRoleDto,
  UpdateAdminUserStatusDto,
} from "./dto/admin-user-actions.dto";
import type {
  AdminUserActivityQueryDto,
  AdminUserCommentsQueryDto,
  AdminUserEntriesQueryDto,
  AdminUsersQueryDto,
} from "./dto/admin-users-query.dto";

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
      entryComments: true,
      bookmarks: true,
    },
  },
  auditLogsAsTargetUser: {
    where: { action: AuditAction.USER_ROLE_CHANGED },
    select: { createdAt: true },
    orderBy: { createdAt: "desc" as const },
    take: 1,
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

const adminUserCommentSelect = {
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
          comments: user._count.entryComments,
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

  async listUserComments(userId: string, query: AdminUserCommentsQueryDto) {
    await this.ensureUserExists(userId);
    const pagination = this.normalizePagination(query);
    const where: Prisma.EntryCommentWhereInput = {
      authorId: userId,
      ...(query.status ? { status: query.status } : {}),
    };

    const [comments, total] = await this.prisma.$transaction([
      this.prisma.entryComment.findMany({
        where,
        select: adminUserCommentSelect,
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        skip: this.skip(pagination),
        take: pagination.limit,
      }),
      this.prisma.entryComment.count({ where }),
    ]);

    return {
      data: comments,
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

  async updateUserRole(actor: AuthenticatedUser, userId: string, input: UpdateAdminUserRoleDto) {
    if (actor.id === userId) {
      throw new ForbiddenException({
        error: ADMIN_USER_ERROR_CODES.SELF_ACTION_FORBIDDEN,
        message: "Administrators cannot change their own role.",
      });
    }

    const reason = normalizeReason(input.reason);
    if (!reason || reason.length < 3) {
      throw new BadRequestException({
        error: ADMIN_USER_ERROR_CODES.ROLE_REASON_REQUIRED,
        message: "A role-change reason of at least 3 characters is required.",
      });
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        email: true,
        profileImageUrl: true,
        role: true,
        status: true,
        emailVerifiedAt: true,
      },
    });

    if (!existingUser) throw this.userNotFound();

    if (existingUser.role === UserRole.ADMIN) {
      throw new ForbiddenException({
        error: ADMIN_USER_ERROR_CODES.ROLE_PROTECTED_ADMIN,
        message: "Administrator roles cannot be changed from moderator management.",
      });
    }

    const isPromotion = existingUser.role === UserRole.USER && input.role === UserRole.MODERATOR;
    const isDemotion = existingUser.role === UserRole.MODERATOR && input.role === UserRole.USER;
    if (!isPromotion && !isDemotion) {
      throw new BadRequestException({
        error: ADMIN_USER_ERROR_CODES.ROLE_INVALID_TRANSITION,
        message: "Only USER and MODERATOR role transitions are supported.",
      });
    }

    if (isPromotion && existingUser.status !== UserStatus.ACTIVE) {
      throw new BadRequestException({
        error: ADMIN_USER_ERROR_CODES.ROLE_PROMOTION_REQUIRES_ACTIVE_ACCOUNT,
        message: "A suspended account cannot be promoted to moderator.",
      });
    }

    if (isPromotion && !existingUser.emailVerifiedAt) {
      throw new BadRequestException({
        error: ADMIN_USER_ERROR_CODES.ROLE_PROMOTION_REQUIRES_VERIFIED_EMAIL,
        message: "Email verification is required before moderator promotion.",
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const changed = await tx.user.updateMany({
        where: { id: userId, role: existingUser.role },
        data: { role: input.role },
      });

      if (changed.count !== 1) {
        throw new ConflictException({
          error: ADMIN_USER_ERROR_CODES.ROLE_CONFLICT,
          message: "The user role changed before this action completed.",
        });
      }

      await this.auditService.createWithClient(tx, {
        action: AuditAction.USER_ROLE_CHANGED,
        actorId: actor.id,
        targetUserId: userId,
        metadata: {
          previousRole: existingUser.role,
          newRole: input.role,
          reason,
        },
      });

      const updated = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          id: true,
          displayName: true,
          email: true,
          profileImageUrl: true,
          role: true,
          status: true,
          emailVerifiedAt: true,
          updatedAt: true,
        },
      });

      return {
        data: {
          id: updated.id,
          displayName: updated.displayName,
          email: updated.email,
          profileImageUrl: updated.profileImageUrl,
          role: updated.role,
          status: updated.status,
          emailVerified: Boolean(updated.emailVerifiedAt),
          updatedAt: updated.updatedAt,
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
      comments: user._count.entryComments,
      bookmarks: user._count.bookmarks,
    },
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    roleChangedAt: user.auditLogsAsTargetUser[0]?.createdAt ?? null,
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
