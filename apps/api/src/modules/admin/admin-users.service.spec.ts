jest.mock("../../database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import { BadRequestException, ConflictException, ForbiddenException } from "@nestjs/common";

import type { PrismaService } from "../../database/prisma.service";
import { AuditAction, AuthProvider, UserRole, UserStatus } from "../../generated/prisma/enums";
import type { AuditService } from "../audit/audit.service";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { AdminUsersService } from "./admin-users.service";

type DelegateMock = Record<string, jest.Mock>;

type PrismaMock = {
  auditLog: DelegateMock;
  bookmark: DelegateMock;
  correctionSuggestion: DelegateMock;
  culturalEntry: DelegateMock;
  like: DelegateMock;
  entryComment: DelegateMock;
  refreshSession: DelegateMock;
  report: DelegateMock;
  user: DelegateMock;
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

describe("AdminUsersService", () => {
  it("lists safe user data with server filters and derived authentication methods", async () => {
    const prisma = createPrismaMock();
    prisma.user.findMany.mockResolvedValue([
      {
        id: "22222222-2222-2222-2222-222222222222",
        email: "user@example.com",
        passwordHash: "not-returned",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        displayName: "کاربر",
        profileImageUrl: null,
        emailVerifiedAt: new Date(),
        lastLoginAt: null,
        createdAt: new Date(),
        oauthAccounts: [{ provider: AuthProvider.GOOGLE }],
        auditLogsAsTargetUser: [],
        _count: { culturalEntries: 3, entryComments: 2, bookmarks: 4 },
      },
    ]);
    prisma.user.count.mockResolvedValue(1);
    const service = createService(prisma);

    const response = await service.listUsers({
      page: 1,
      limit: 20,
      search: " user@example.com ",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      authMethod: AuthProvider.GOOGLE,
    });

    expect(response.data[0]).toMatchObject({
      email: "user@example.com",
      authMethods: ["PASSWORD", AuthProvider.GOOGLE],
      counts: { entries: 3, comments: 2, bookmarks: 4 },
    });
    expect(response.data[0]).not.toHaveProperty("passwordHash");
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          emailVerifiedAt: { not: null },
          oauthAccounts: { some: { provider: AuthProvider.GOOGLE } },
        }),
        skip: 0,
        take: 20,
      }),
    );
  });

  it("prevents an administrator from changing their own status", async () => {
    const service = createService(createPrismaMock());

    await expect(
      service.updateUserStatus(actor, actor.id, {
        status: UserStatus.SUSPENDED,
        reason: "آزمایش",
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("requires a useful reason before suspension", async () => {
    const service = createService(createPrismaMock());

    await expect(
      service.updateUserStatus(actor, "22222222-2222-2222-2222-222222222222", {
        status: UserStatus.SUSPENDED,
        reason: " ",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("suspends a user, revokes sessions, and records one audit event transactionally", async () => {
    const prisma = createPrismaMock();
    const auditService = createAuditServiceMock();
    prisma.user.findUnique.mockResolvedValue({
      id: "22222222-2222-2222-2222-222222222222",
      status: UserStatus.ACTIVE,
    });
    prisma.user.updateMany.mockResolvedValue({ count: 1 });
    prisma.refreshSession.updateMany.mockResolvedValue({ count: 3 });
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      id: "22222222-2222-2222-2222-222222222222",
      status: UserStatus.SUSPENDED,
      suspendedAt: new Date(),
    });
    const service = createService(prisma, auditService);

    const response = await service.updateUserStatus(actor, "22222222-2222-2222-2222-222222222222", {
      status: UserStatus.SUSPENDED,
      reason: "نقض مکرر قوانین",
    });

    expect(response.data.status).toBe(UserStatus.SUSPENDED);
    expect(prisma.refreshSession.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: response.data.id, revokedAt: null } }),
    );
    expect(auditService.createWithClient).toHaveBeenCalledWith(
      prisma,
      expect.objectContaining({
        action: AuditAction.USER_SUSPENDED,
        actorId: actor.id,
        targetUserId: response.data.id,
        metadata: expect.objectContaining({ revokedSessions: 3 }),
      }),
    );
  });

  it("rejects a stale account-status action", async () => {
    const prisma = createPrismaMock();
    prisma.user.findUnique.mockResolvedValue({
      id: "22222222-2222-2222-2222-222222222222",
      status: UserStatus.ACTIVE,
    });
    prisma.user.updateMany.mockResolvedValue({ count: 0 });
    const service = createService(prisma);

    await expect(
      service.updateUserStatus(actor, "22222222-2222-2222-2222-222222222222", {
        status: UserStatus.SUSPENDED,
        reason: "نقض قوانین",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("revokes only active sessions and audits the result", async () => {
    const prisma = createPrismaMock();
    const auditService = createAuditServiceMock();
    prisma.user.findUnique.mockResolvedValue({ id: "22222222-2222-2222-2222-222222222222" });
    prisma.refreshSession.updateMany.mockResolvedValue({ count: 2 });
    const service = createService(prisma, auditService);

    const response = await service.revokeUserSessions(
      actor,
      "22222222-2222-2222-2222-222222222222",
    );

    expect(response.data.revokedSessions).toBe(2);
    expect(prisma.refreshSession.updateMany).toHaveBeenCalledWith({
      where: {
        userId: response.data.userId,
        revokedAt: null,
        expiresAt: { gt: expect.any(Date) },
      },
      data: { revokedAt: expect.any(Date) },
    });
    expect(auditService.createWithClient).toHaveBeenCalledWith(
      prisma,
      expect.objectContaining({ action: AuditAction.USER_SESSIONS_REVOKED }),
    );
  });

  it("promotes a verified active user and records the role change", async () => {
    const prisma = createPrismaMock();
    const auditService = createAuditServiceMock();
    prisma.user.findUnique.mockResolvedValue({
      id: "22222222-2222-2222-2222-222222222222",
      displayName: "کاربر",
      email: "user@example.com",
      profileImageUrl: null,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    });
    prisma.user.updateMany.mockResolvedValue({ count: 1 });
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      id: "22222222-2222-2222-2222-222222222222",
      displayName: "کاربر",
      email: "user@example.com",
      profileImageUrl: null,
      role: UserRole.MODERATOR,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      updatedAt: new Date(),
    });
    const service = createService(prisma, auditService);

    const response = await service.updateUserRole(actor, "22222222-2222-2222-2222-222222222222", {
      role: UserRole.MODERATOR,
      reason: "همکاری در بررسی محتوا",
    });

    expect(response.data.role).toBe(UserRole.MODERATOR);
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: {
        id: "22222222-2222-2222-2222-222222222222",
        role: UserRole.USER,
      },
      data: { role: UserRole.MODERATOR },
    });
    expect(auditService.createWithClient).toHaveBeenCalledWith(
      prisma,
      expect.objectContaining({
        action: AuditAction.USER_ROLE_CHANGED,
        actorId: actor.id,
        targetUserId: "22222222-2222-2222-2222-222222222222",
        metadata: {
          previousRole: UserRole.USER,
          newRole: UserRole.MODERATOR,
          reason: "همکاری در بررسی محتوا",
        },
      }),
    );
  });

  it("demotes a moderator without deleting historical moderation records", async () => {
    const prisma = createPrismaMock();
    prisma.user.findUnique.mockResolvedValue({
      id: "22222222-2222-2222-2222-222222222222",
      role: UserRole.MODERATOR,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    });
    prisma.user.updateMany.mockResolvedValue({ count: 1 });
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      id: "22222222-2222-2222-2222-222222222222",
      displayName: "ناظر",
      email: "moderator@example.com",
      profileImageUrl: null,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      updatedAt: new Date(),
    });
    const service = createService(prisma);

    await service.updateUserRole(actor, "22222222-2222-2222-2222-222222222222", {
      role: UserRole.USER,
      reason: "پایان همکاری",
    });

    expect(prisma.user.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { role: UserRole.USER } }),
    );
  });

  it.each([
    {
      status: UserStatus.SUSPENDED,
      emailVerifiedAt: new Date(),
      label: "suspended",
    },
    { status: UserStatus.ACTIVE, emailVerifiedAt: null, label: "unverified" },
  ])("rejects promotion of a $label account", async ({ status, emailVerifiedAt }) => {
    const prisma = createPrismaMock();
    prisma.user.findUnique.mockResolvedValue({
      id: "22222222-2222-2222-2222-222222222222",
      role: UserRole.USER,
      status,
      emailVerifiedAt,
    });
    const service = createService(prisma);

    await expect(
      service.updateUserRole(actor, "22222222-2222-2222-2222-222222222222", {
        role: UserRole.MODERATOR,
        reason: "انتخاب ناظر",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });

  it("protects administrator roles and self-role changes", async () => {
    const prisma = createPrismaMock();
    const service = createService(prisma);

    await expect(
      service.updateUserRole(actor, actor.id, {
        role: UserRole.MODERATOR,
        reason: "تغییر نقش",
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    prisma.user.findUnique.mockResolvedValue({
      id: "22222222-2222-2222-2222-222222222222",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    });
    await expect(
      service.updateUserRole(actor, "22222222-2222-2222-2222-222222222222", {
        role: UserRole.USER,
        reason: "تغییر نقش",
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejects missing reasons, invalid transitions, and stale role updates", async () => {
    const prisma = createPrismaMock();
    const service = createService(prisma);

    await expect(
      service.updateUserRole(actor, "22222222-2222-2222-2222-222222222222", {
        role: UserRole.MODERATOR,
        reason: "  ",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    prisma.user.findUnique.mockResolvedValue({
      id: "22222222-2222-2222-2222-222222222222",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    });
    await expect(
      service.updateUserRole(actor, "22222222-2222-2222-2222-222222222222", {
        role: UserRole.USER,
        reason: "تغییر نقش",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    prisma.user.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.updateUserRole(actor, "22222222-2222-2222-2222-222222222222", {
        role: UserRole.MODERATOR,
        reason: "انتخاب ناظر",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

function createService(
  prisma: PrismaMock,
  auditService: ReturnType<typeof createAuditServiceMock> = createAuditServiceMock(),
) {
  return new AdminUsersService(
    prisma as unknown as PrismaService,
    auditService as unknown as AuditService,
  );
}

function createAuditServiceMock() {
  return {
    createWithClient: jest.fn().mockResolvedValue({ id: "audit-id" }),
  };
}

function createPrismaMock(): PrismaMock {
  const delegate = (): DelegateMock => ({
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    groupBy: jest.fn(),
    updateMany: jest.fn(),
  });
  const prisma: PrismaMock = {
    auditLog: delegate(),
    bookmark: delegate(),
    correctionSuggestion: delegate(),
    culturalEntry: delegate(),
    like: delegate(),
    entryComment: delegate(),
    refreshSession: delegate(),
    report: delegate(),
    user: delegate(),
    $transaction: jest.fn(),
  };
  prisma.$transaction.mockImplementation(
    (operation: Promise<unknown>[] | ((client: PrismaMock) => Promise<unknown>)) =>
      typeof operation === "function" ? operation(prisma) : Promise.all(operation),
  );
  return prisma;
}
