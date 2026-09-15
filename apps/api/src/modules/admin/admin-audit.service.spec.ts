jest.mock("../../database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import { BadRequestException } from "@nestjs/common";

import type { PrismaService } from "../../database/prisma.service";
import { AuditAction, UserRole } from "../../generated/prisma/enums";
import { AdminAuditService } from "./admin-audit.service";

describe("AdminAuditService", () => {
  it("lists safe global events with filtering and pagination", async () => {
    const prisma = createPrismaMock();
    const createdAt = new Date("2026-09-05T12:00:00.000Z");
    prisma.auditLog.findMany.mockResolvedValue([
      {
        id: "11111111-1111-4111-8111-111111111111",
        action: AuditAction.USER_ROLE_CHANGED,
        actor: {
          id: "22222222-2222-4222-8222-222222222222",
          displayName: "مدیر",
          role: UserRole.ADMIN,
          profileImageUrl: null,
        },
        targetUser: null,
        entry: null,
        report: null,
        correctionSuggestion: null,
        entryRevision: null,
        metadata: {
          previousRole: "USER",
          newRole: "MODERATOR",
          reason: "نیاز تیم نظارت",
          accessToken: "must-not-leak",
        },
        createdAt,
      },
    ]);
    prisma.auditLog.count.mockResolvedValue(1);

    const service = new AdminAuditService(prisma as unknown as PrismaService);
    const result = await service.list({
      page: 2,
      limit: 10,
      search: " مدیر ",
      action: AuditAction.USER_ROLE_CHANGED,
      dateFrom: "2026-09-01",
      dateTo: "2026-09-07",
    });

    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
        where: expect.objectContaining({ action: AuditAction.USER_ROLE_CHANGED }),
      }),
    );
    expect(result.meta).toEqual({ page: 2, limit: 10, total: 1, totalPages: 1 });
    expect(result.data[0].metadata).toEqual({
      previousRole: "USER",
      newRole: "MODERATOR",
      reason: "نیاز تیم نظارت",
    });
    expect(result.data[0]).not.toHaveProperty("ipAddress");
    expect(result.data[0]).not.toHaveProperty("requestId");
    expect(result.data[0]).not.toHaveProperty("userAgent");
  });

  it("rejects an inverted date range", async () => {
    const service = new AdminAuditService(createPrismaMock() as unknown as PrismaService);

    await expect(
      service.list({ dateFrom: "2026-09-08", dateTo: "2026-09-01" }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

function createPrismaMock() {
  const auditLog = { findMany: jest.fn(), count: jest.fn() };
  return {
    auditLog,
    $transaction: jest.fn((queries: Promise<unknown>[]) => Promise.all(queries)),
  };
}
