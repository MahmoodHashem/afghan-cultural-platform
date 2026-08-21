jest.mock("@/database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { NotFoundException } from "@nestjs/common";

import type { PrismaService } from "@/database/prisma.service";
import { UserRole, UserStatus } from "@/generated/prisma/enums";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import { COMMUNITY_ERROR_CODES } from "@/modules/community/community.constants";
import { CommunityService } from "@/modules/community/community.service";

type DelegateMock = {
  count: jest.Mock;
  deleteMany: jest.Mock;
  findUnique: jest.Mock;
  upsert: jest.Mock;
};

type PrismaMock = {
  culturalEntry: {
    findFirst: jest.Mock;
  };
  like: DelegateMock;
  $transaction: jest.Mock;
};

const entryId = "22222222-2222-4222-8222-222222222222";
const user: AuthenticatedUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "verified@example.com",
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  displayName: "کاربر تأییدشده",
  profileImageUrl: null,
  emailVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("CommunityService likes", () => {
  let prisma: PrismaMock;
  let service: CommunityService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new CommunityService(prisma as unknown as PrismaService);
    prisma.culturalEntry.findFirst.mockResolvedValue({ id: entryId });
  });

  it("likes a published entry and returns the current count", async () => {
    prisma.like.upsert.mockResolvedValue({ id: "like-1" });
    prisma.like.count.mockResolvedValue(3);

    await expect(service.likeEntry(user, entryId)).resolves.toEqual({
      data: {
        entryId,
        likeCount: 3,
        isLikedByCurrentUser: true,
      },
    });
    expect(prisma.like.upsert).toHaveBeenCalledWith({
      where: {
        userId_entryId: {
          userId: user.id,
          entryId,
        },
      },
      create: {
        userId: user.id,
        entryId,
      },
      update: {},
    });
  });

  it("keeps duplicate like requests idempotent", async () => {
    prisma.like.upsert.mockResolvedValue({ id: "like-1" });
    prisma.like.count.mockResolvedValue(1);

    const first = await service.likeEntry(user, entryId);
    const second = await service.likeEntry(user, entryId);

    expect(first).toEqual(second);
    expect(first.data.likeCount).toBe(1);
    expect(prisma.like.upsert).toHaveBeenCalledTimes(2);
  });

  it("unlikes idempotently and returns the remaining count", async () => {
    prisma.like.deleteMany.mockResolvedValue({ count: 1 });
    prisma.like.count.mockResolvedValue(2);

    await expect(service.unlikeEntry(user, entryId)).resolves.toEqual({
      data: {
        entryId,
        likeCount: 2,
        isLikedByCurrentUser: false,
      },
    });
    expect(prisma.like.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: user.id,
        entryId,
      },
    });
  });

  it.each([
    { ownLike: { id: "like-1" }, expected: true },
    { ownLike: null, expected: false },
  ])("returns authenticated interaction state", async ({ ownLike, expected }) => {
    prisma.like.count.mockResolvedValue(4);
    prisma.like.findUnique.mockResolvedValue(ownLike);

    await expect(service.getLikeState(user, entryId)).resolves.toEqual({
      data: {
        entryId,
        likeCount: 4,
        isLikedByCurrentUser: expected,
      },
    });
  });

  it("rejects likes for unpublished or unavailable entries", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(null);

    await expect(service.likeEntry(user, entryId)).rejects.toMatchObject({
      response: expect.objectContaining({
        error: COMMUNITY_ERROR_CODES.ENTRY_NOT_FOUND,
      }),
    });
    await expect(service.likeEntry(user, entryId)).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.like.upsert).not.toHaveBeenCalled();
  });

  it("enforces one like per user and entry in the generated Prisma model", () => {
    const schema = readFileSync(resolve(process.cwd(), "prisma/schema.prisma"), "utf8");
    const likeModel = schema.match(/model Like \{[\s\S]*?\n\}/)?.[0];

    expect(likeModel).toContain("@@unique([userId, entryId])");
  });
});

function createPrismaMock(): PrismaMock {
  const prisma = {
    culturalEntry: {
      findFirst: jest.fn(),
    },
    like: {
      count: jest.fn(),
      deleteMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
  } as PrismaMock;

  prisma.$transaction.mockImplementation(
    (operation: Array<Promise<unknown>> | ((tx: PrismaMock) => Promise<unknown>)) =>
      Array.isArray(operation) ? Promise.all(operation) : operation(prisma),
  );

  return prisma;
}
