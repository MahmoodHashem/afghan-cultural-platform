jest.mock("@/database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import type { PrismaService } from "@/database/prisma.service";
import { AuditAction } from "@/generated/prisma/enums";
import { AdminOverviewService } from "@/modules/admin/admin-overview.service";

type DelegateMock = {
  count: jest.Mock;
  findMany: jest.Mock;
};

type PrismaMock = {
  auditLog: DelegateMock;
  correctionSuggestion: DelegateMock;
  culturalEntry: DelegateMock;
  report: DelegateMock;
  user: DelegateMock;
  $transaction: jest.Mock;
};

describe("AdminOverviewService", () => {
  it("returns real counts, a complete growth series, and safe recent activity", async () => {
    const today = new Date();
    const actor = { id: "11111111-1111-1111-1111-111111111111", displayName: "مدیر" };
    const entry = {
      id: "22222222-2222-2222-2222-222222222222",
      slug: "ارگ-هرات",
      title: "ارگ هرات",
    };
    const prisma = createPrismaMock();

    prisma.user.count
      .mockReturnValueOnce(Promise.resolve(12))
      .mockReturnValueOnce(Promise.resolve(10));
    prisma.user.findMany.mockReturnValueOnce(
      Promise.resolve([{ createdAt: today }, { createdAt: today }]),
    );
    prisma.culturalEntry.count
      .mockReturnValueOnce(Promise.resolve(8))
      .mockReturnValueOnce(Promise.resolve(3))
      .mockReturnValueOnce(Promise.resolve(7));
    prisma.culturalEntry.findMany.mockReturnValueOnce(Promise.resolve([{ publishedAt: today }]));
    prisma.report.count
      .mockReturnValueOnce(Promise.resolve(4))
      .mockReturnValueOnce(Promise.resolve(1));
    prisma.correctionSuggestion.count.mockReturnValueOnce(Promise.resolve(2));
    prisma.auditLog.findMany.mockReturnValueOnce(
      Promise.resolve([
        {
          id: "33333333-3333-3333-3333-333333333333",
          action: AuditAction.ENTRY_APPROVED,
          actor,
          targetUser: null,
          entry,
          createdAt: today,
        },
      ]),
    );

    const service = new AdminOverviewService(prisma as unknown as PrismaService);
    const response = await service.getOverview();

    expect(response.data.stats.users).toEqual({ total: 12, last30Days: 2 });
    expect(response.data.stats.publishedEntries).toEqual({ total: 8, last30Days: 1 });
    expect(response.data.stats.pendingReview).toBe(3);
    expect(response.data.attention.pendingCorrections).toBe(2);
    expect(response.data.growth).toHaveLength(30);
    expect(response.data.growth.at(-1)).toMatchObject({ users: 12, publishedEntries: 8 });
    expect(response.data.recentActivity[0]).toMatchObject({
      action: AuditAction.ENTRY_APPROVED,
      actor,
      entry,
    });
    expect(response.data.recentActivity[0]).not.toHaveProperty("metadata");
  });
});

function createPrismaMock(): PrismaMock {
  const createDelegate = (): DelegateMock => ({
    count: jest.fn(),
    findMany: jest.fn(),
  });

  return {
    auditLog: createDelegate(),
    correctionSuggestion: createDelegate(),
    culturalEntry: createDelegate(),
    report: createDelegate(),
    user: createDelegate(),
    $transaction: jest.fn((queries: Promise<unknown>[]) => Promise.all(queries)),
  };
}
