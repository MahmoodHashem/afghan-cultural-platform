jest.mock("@/database/prisma.service", () => ({ PrismaService: class PrismaService {} }));

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";

import type { PrismaService } from "@/database/prisma.service";
import { EntryCommentStatus, UserRole, UserStatus } from "@/generated/prisma/enums";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import { COMMUNITY_ERROR_CODES } from "@/modules/community/community.constants";
import { CommunityService } from "@/modules/community/community.service";

type DelegateMock = Record<
  "count" | "create" | "deleteMany" | "findMany" | "findFirst" | "findUnique" | "update" | "upsert",
  jest.Mock
>;

type PrismaMock = {
  culturalEntry: DelegateMock;
  entryComment: DelegateMock;
  commentLike: DelegateMock;
  like: DelegateMock;
  $queryRaw: jest.Mock;
  $transaction: jest.Mock;
};

const ids = {
  entry: "22222222-2222-4222-8222-222222222222",
  author: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  user: "11111111-1111-4111-8111-111111111111",
  other: "33333333-3333-4333-8333-333333333333",
  root: "44444444-4444-4444-8444-444444444444",
  reply: "55555555-5555-4555-8555-555555555555",
};

const user: AuthenticatedUser = {
  id: ids.user,
  email: "verified@example.com",
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  displayName: "کاربر تأییدشده",
  profileImageUrl: null,
  emailVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("CommunityService comments", () => {
  let prisma: PrismaMock;
  let service: CommunityService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new CommunityService(prisma as unknown as PrismaService);
    prisma.culturalEntry.findFirst.mockResolvedValue({ id: ids.entry, authorId: ids.author });
  });

  it("allows one user to create multiple root comments", async () => {
    prisma.entryComment.create
      .mockResolvedValueOnce(commentPayload({ id: ids.root }))
      .mockResolvedValueOnce(commentPayload({ id: ids.reply }));

    await service.createComment(user, ids.entry, { body: "دیدگاه نخست" });
    await service.createComment(user, ids.entry, { body: "دیدگاه دوم" });

    expect(prisma.entryComment.create).toHaveBeenCalledTimes(2);
    expect(prisma.entryComment.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: expect.objectContaining({ authorId: user.id, parentId: null }),
      }),
    );
  });

  it("creates replies at any depth when the active parent belongs to the entry", async () => {
    prisma.entryComment.findUnique.mockResolvedValue({
      entryId: ids.entry,
      status: EntryCommentStatus.ACTIVE,
    });
    prisma.entryComment.create.mockResolvedValue(
      commentPayload({ id: ids.reply, parentId: ids.root }),
    );

    const response = await service.createComment(user, ids.entry, {
      body: "پاسخ به دیدگاه",
      parentId: ids.root,
    });

    expect(response.data.parentId).toBe(ids.root);
    expect(prisma.entryComment.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ parentId: ids.root }) }),
    );
  });

  it("rejects a cross-entry parent", async () => {
    prisma.entryComment.findUnique.mockResolvedValue({
      entryId: "99999999-9999-4999-8999-999999999999",
      status: EntryCommentStatus.ACTIVE,
    });

    await expect(
      service.createComment(user, ids.entry, { body: "پاسخ نامعتبر", parentId: ids.root }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.entryComment.create).not.toHaveBeenCalled();
  });

  it("lists visible roots with tombstones and all active comments in the count", async () => {
    prisma.$queryRaw.mockResolvedValue([{ id: ids.root }, { id: ids.reply }]);
    prisma.entryComment.findMany.mockResolvedValue([
      commentPayload({ id: ids.root, status: EntryCommentStatus.DELETED, replyCount: 1 }),
    ]);
    prisma.entryComment.count.mockResolvedValueOnce(1).mockResolvedValueOnce(1);

    const response = await service.listComments(ids.entry, {
      page: 1,
      limit: 10,
      sort: "mostLiked",
    });

    expect(response.data[0]).toMatchObject({ body: null, author: null, directReplyCount: 1 });
    expect(response.commentCount).toBe(1);
    expect(prisma.entryComment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }, { id: "desc" }],
      }),
    );
  });

  it("orders direct replies oldest first", async () => {
    prisma.$queryRaw.mockResolvedValue([{ id: ids.root }, { id: ids.reply }]);
    prisma.entryComment.findMany.mockResolvedValue([commentPayload({ parentId: ids.root })]);
    prisma.entryComment.count.mockResolvedValueOnce(1).mockResolvedValueOnce(2);

    await service.listReplies(ids.entry, ids.root, { page: 1, limit: 10 });

    expect(prisma.entryComment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    );
  });

  it("allows an owner to edit and soft-delete an active comment", async () => {
    prisma.entryComment.findUnique.mockResolvedValue({
      entryId: ids.entry,
      authorId: user.id,
      status: EntryCommentStatus.ACTIVE,
    });
    prisma.entryComment.update
      .mockResolvedValueOnce(commentPayload({ body: "متن ویرایش‌شده" }))
      .mockResolvedValueOnce({});

    await expect(
      service.updateComment(user, ids.entry, ids.root, { body: "متن ویرایش‌شده" }),
    ).resolves.toMatchObject({ data: { body: "متن ویرایش‌شده" } });
    await service.deleteComment(user, ids.entry, ids.root);

    expect(prisma.commentLike.deleteMany).toHaveBeenCalledWith({ where: { commentId: ids.root } });
    expect(prisma.entryComment.update).toHaveBeenLastCalledWith({
      where: { id: ids.root },
      data: { status: EntryCommentStatus.DELETED, deletedAt: expect.any(Date) },
    });
  });

  it("does not reveal another author's comment through ownership behavior", async () => {
    prisma.entryComment.findUnique.mockResolvedValue({
      entryId: ids.entry,
      authorId: ids.other,
      status: EntryCommentStatus.ACTIVE,
    });

    await expect(
      service.updateComment(user, ids.entry, ids.root, { body: "ویرایش غیرمجاز" }),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ error: COMMUNITY_ERROR_CODES.COMMENT_NOT_OWNED }),
    });
  });

  it("likes comments idempotently and rejects self-likes", async () => {
    prisma.entryComment.findUnique.mockResolvedValue({
      entryId: ids.entry,
      authorId: ids.other,
      status: EntryCommentStatus.ACTIVE,
    });
    prisma.commentLike.count.mockResolvedValue(3);

    await expect(service.likeComment(user, ids.entry, ids.root)).resolves.toEqual({
      data: { commentId: ids.root, likeCount: 3, isLikedByCurrentUser: true },
    });
    expect(prisma.commentLike.upsert).toHaveBeenCalledWith({
      where: { userId_commentId: { userId: user.id, commentId: ids.root } },
      create: { userId: user.id, commentId: ids.root },
      update: {},
    });

    prisma.entryComment.findUnique.mockResolvedValue({
      entryId: ids.entry,
      authorId: user.id,
      status: EntryCommentStatus.ACTIVE,
    });
    await expect(service.likeComment(user, ids.entry, ids.root)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it("restores liked comment IDs without exposing liker records", async () => {
    prisma.commentLike.findMany.mockResolvedValue([
      { commentId: ids.root },
      { commentId: ids.reply },
    ]);

    await expect(service.getCommentInteractions(user, ids.entry)).resolves.toEqual({
      data: { entryId: ids.entry, likedCommentIds: [ids.root, ids.reply] },
    });
  });

  it("rejects all comment operations when the entry is not published", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(null);

    await expect(
      service.createComment(user, ids.entry, { body: "دیدگاه معتبر" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("defines lossless rename, threading, and database like uniqueness", () => {
    const schema = readFileSync(resolve(process.cwd(), "prisma/schema.prisma"), "utf8");
    const migration = readFileSync(
      resolve(process.cwd(), "prisma/migrations/20260823150000_add_entry_comments/migration.sql"),
      "utf8",
    );

    expect(schema).toContain("model EntryComment");
    expect(schema).toContain("model CommentLike");
    expect(schema).toContain("@@unique([userId, commentId])");
    expect(migration).toContain('ALTER TABLE "public_reviews" RENAME TO "entry_comments"');
    expect(migration).toContain('ALTER TABLE "reports" RENAME COLUMN "public_review_id"');
    expect(migration).toContain('DROP INDEX "public_reviews_one_active_per_user_entry_idx"');
  });
});

describe("CommunityService entry likes", () => {
  it("keeps entry likes idempotent and separate from comment likes", async () => {
    const prisma = createPrismaMock();
    const service = new CommunityService(prisma as unknown as PrismaService);
    prisma.culturalEntry.findFirst.mockResolvedValue({ id: ids.entry, authorId: ids.author });
    prisma.like.count.mockResolvedValue(2);

    await expect(service.likeEntry(user, ids.entry)).resolves.toEqual({
      data: { entryId: ids.entry, likeCount: 2, isLikedByCurrentUser: true },
    });
    expect(prisma.like.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.commentLike.upsert).not.toHaveBeenCalled();
  });
});

function createPrismaMock(): PrismaMock {
  const prisma = {
    culturalEntry: delegate(),
    entryComment: delegate(),
    commentLike: delegate(),
    like: delegate(),
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
  } as PrismaMock;

  prisma.$transaction.mockImplementation(
    (operation: Array<Promise<unknown>> | ((tx: PrismaMock) => Promise<unknown>)) =>
      Array.isArray(operation) ? Promise.all(operation) : operation(prisma),
  );
  return prisma;
}

function delegate(): DelegateMock {
  return {
    count: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
  };
}

function commentPayload(
  overrides: Partial<{
    id: string;
    parentId: string | null;
    body: string;
    status: EntryCommentStatus;
    authorId: string;
    replyCount: number;
  }> = {},
) {
  return {
    id: overrides.id ?? ids.root,
    entryId: ids.entry,
    authorId: overrides.authorId ?? user.id,
    parentId: overrides.parentId ?? null,
    body: overrides.body ?? "دیدگاه نمونه",
    status: overrides.status ?? EntryCommentStatus.ACTIVE,
    createdAt: new Date("2026-01-02T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    author: { id: user.id, displayName: user.displayName, profileImageUrl: null },
    _count: { likes: 0, replies: overrides.replyCount ?? 0 },
  };
}
