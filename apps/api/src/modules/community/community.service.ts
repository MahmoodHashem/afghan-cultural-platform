import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../../database/prisma.service";
import type { Prisma } from "../../generated/prisma/client";
import { EntryCommentStatus, EntryStatus } from "../../generated/prisma/enums";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { COMMUNITY_ERROR_CODES } from "./community.constants";
import type { CommentPaginationQueryDto, EntryCommentQueryDto } from "./dto/comment-query.dto";
import type { CreateEntryCommentDto, UpdateEntryCommentDto } from "./dto/community-feedback.dto";

type CommentPayload = {
  id: string;
  entryId: string;
  authorId: string;
  parentId: string | null;
  body: string;
  status: EntryCommentStatus;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; displayName: string; profileImageUrl: string | null };
  _count: { likes: number; replies: number };
};

type PublishedEntryIdentity = { id: string; authorId: string };

@Injectable()
class CommunityService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listComments(entryId: string, query: EntryCommentQueryDto) {
    const entry = await this.ensurePublishedEntry(entryId);
    const normalizedQuery = this.normalizePagination(query);
    const visibleIds = await this.findVisibleCommentIds(entryId);

    if (visibleIds.length === 0) {
      return this.emptyCommentList(normalizedQuery.page, normalizedQuery.limit);
    }

    const where: Prisma.EntryCommentWhereInput = {
      entryId,
      parentId: null,
      id: { in: visibleIds },
    };
    const [comments, total, commentCount] = await this.prisma.$transaction([
      this.prisma.entryComment.findMany({
        where,
        select: this.commentSelect(visibleIds),
        orderBy: this.commentOrder(query.sort ?? "newest"),
        skip: (normalizedQuery.page - 1) * normalizedQuery.limit,
        take: normalizedQuery.limit,
      }),
      this.prisma.entryComment.count({ where }),
      this.prisma.entryComment.count({
        where: { entryId, status: EntryCommentStatus.ACTIVE },
      }),
    ]);

    return {
      data: comments.map((comment) => this.mapComment(comment, entry)),
      meta: this.createMeta(normalizedQuery.page, normalizedQuery.limit, total),
      commentCount,
    };
  }

  async listReplies(entryId: string, commentId: string, query: CommentPaginationQueryDto) {
    const entry = await this.ensurePublishedEntry(entryId);
    const normalizedQuery = this.normalizePagination(query);
    const visibleIds = await this.findVisibleCommentIds(entryId);

    if (!visibleIds.includes(commentId)) {
      this.throwCommentNotFound();
    }

    const where: Prisma.EntryCommentWhereInput = {
      entryId,
      parentId: commentId,
      id: { in: visibleIds },
    };
    const [comments, total, commentCount] = await this.prisma.$transaction([
      this.prisma.entryComment.findMany({
        where,
        select: this.commentSelect(visibleIds),
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        skip: (normalizedQuery.page - 1) * normalizedQuery.limit,
        take: normalizedQuery.limit,
      }),
      this.prisma.entryComment.count({ where }),
      this.prisma.entryComment.count({
        where: { entryId, status: EntryCommentStatus.ACTIVE },
      }),
    ]);

    return {
      data: comments.map((comment) => this.mapComment(comment, entry)),
      meta: this.createMeta(normalizedQuery.page, normalizedQuery.limit, total),
      commentCount,
    };
  }

  async createComment(user: AuthenticatedUser, entryId: string, input: CreateEntryCommentDto) {
    const entry = await this.ensurePublishedEntry(entryId);
    const body = this.normalizeCommentBody(input.body);

    if (input.parentId) {
      await this.ensureAvailableParent(entryId, input.parentId);
    }

    const comment = await this.prisma.entryComment.create({
      data: {
        entryId,
        authorId: user.id,
        parentId: input.parentId ?? null,
        body,
      },
      select: this.commentSelect([]),
    });

    return { data: this.mapComment(comment, entry) };
  }

  async updateComment(
    user: AuthenticatedUser,
    entryId: string,
    commentId: string,
    input: UpdateEntryCommentDto,
  ) {
    const entry = await this.ensurePublishedEntry(entryId);
    await this.ensureOwnedActiveComment(user.id, entryId, commentId);
    const body = this.normalizeCommentBody(input.body);

    const comment = await this.prisma.entryComment.update({
      where: { id: commentId },
      data: { body },
      select: this.commentSelect([]),
    });

    return { data: this.mapComment(comment, entry) };
  }

  async deleteComment(user: AuthenticatedUser, entryId: string, commentId: string) {
    await this.ensurePublishedEntry(entryId);
    await this.ensureOwnedActiveComment(user.id, entryId, commentId);

    await this.prisma.$transaction([
      this.prisma.commentLike.deleteMany({ where: { commentId } }),
      this.prisma.entryComment.update({
        where: { id: commentId },
        data: { status: EntryCommentStatus.DELETED, deletedAt: new Date() },
      }),
    ]);

    return { data: { message: "Comment deleted." } };
  }

  async getCommentInteractions(user: AuthenticatedUser, entryId: string) {
    await this.ensurePublishedEntry(entryId);
    const likes = await this.prisma.commentLike.findMany({
      where: {
        userId: user.id,
        comment: { entryId, status: EntryCommentStatus.ACTIVE },
      },
      select: { commentId: true },
      orderBy: { createdAt: "asc" },
    });

    return {
      data: { entryId, likedCommentIds: likes.map((like) => like.commentId) },
    };
  }

  async likeComment(user: AuthenticatedUser, entryId: string, commentId: string) {
    await this.ensurePublishedEntry(entryId);
    const comment = await this.ensureActiveComment(entryId, commentId);

    if (comment.authorId === user.id) {
      throw new ForbiddenException({
        error: COMMUNITY_ERROR_CODES.COMMENT_SELF_LIKE_FORBIDDEN,
        message: "Users cannot like their own comments.",
      });
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.commentLike.upsert({
        where: { userId_commentId: { userId: user.id, commentId } },
        create: { userId: user.id, commentId },
        update: {},
      });
      const likeCount = await tx.commentLike.count({ where: { commentId } });

      return { data: { commentId, likeCount, isLikedByCurrentUser: true } };
    });
  }

  async unlikeComment(user: AuthenticatedUser, entryId: string, commentId: string) {
    await this.ensurePublishedEntry(entryId);
    await this.ensureActiveComment(entryId, commentId);

    return this.prisma.$transaction(async (tx) => {
      await tx.commentLike.deleteMany({ where: { userId: user.id, commentId } });
      const likeCount = await tx.commentLike.count({ where: { commentId } });

      return { data: { commentId, likeCount, isLikedByCurrentUser: false } };
    });
  }

  async getLikeState(user: AuthenticatedUser, entryId: string) {
    await this.ensurePublishedEntry(entryId);
    const [likeCount, ownLike] = await this.prisma.$transaction([
      this.prisma.like.count({ where: { entryId } }),
      this.prisma.like.findUnique({
        where: { userId_entryId: { userId: user.id, entryId } },
        select: { id: true },
      }),
    ]);

    return { data: { entryId, likeCount, isLikedByCurrentUser: Boolean(ownLike) } };
  }

  async likeEntry(user: AuthenticatedUser, entryId: string) {
    await this.ensurePublishedEntry(entryId);

    return this.prisma.$transaction(async (tx) => {
      await tx.like.upsert({
        where: { userId_entryId: { userId: user.id, entryId } },
        create: { userId: user.id, entryId },
        update: {},
      });
      const likeCount = await tx.like.count({ where: { entryId } });

      return { data: { entryId, likeCount, isLikedByCurrentUser: true } };
    });
  }

  async unlikeEntry(user: AuthenticatedUser, entryId: string) {
    await this.ensurePublishedEntry(entryId);

    return this.prisma.$transaction(async (tx) => {
      await tx.like.deleteMany({ where: { userId: user.id, entryId } });
      const likeCount = await tx.like.count({ where: { entryId } });

      return { data: { entryId, likeCount, isLikedByCurrentUser: false } };
    });
  }

  private async ensurePublishedEntry(entryId: string): Promise<PublishedEntryIdentity> {
    const entry = await this.prisma.culturalEntry.findFirst({
      where: { id: entryId, status: EntryStatus.PUBLISHED, publishedAt: { not: null } },
      select: { id: true, authorId: true },
    });

    if (!entry) {
      throw new NotFoundException({
        error: COMMUNITY_ERROR_CODES.ENTRY_NOT_FOUND,
        message: "Published entry was not found.",
      });
    }

    return entry;
  }

  private async ensureAvailableParent(entryId: string, parentId: string) {
    const parent = await this.prisma.entryComment.findUnique({
      where: { id: parentId },
      select: { entryId: true, status: true },
    });

    if (!parent || parent.entryId !== entryId) {
      throw new BadRequestException({
        error: COMMUNITY_ERROR_CODES.COMMENT_PARENT_INVALID,
        message: "Parent comment must belong to the same entry.",
      });
    }
    if (parent.status !== EntryCommentStatus.ACTIVE) {
      throw new NotFoundException({
        error: COMMUNITY_ERROR_CODES.COMMENT_PARENT_UNAVAILABLE,
        message: "Parent comment is not available.",
      });
    }
  }

  private async ensureActiveComment(entryId: string, commentId: string) {
    const comment = await this.prisma.entryComment.findUnique({
      where: { id: commentId },
      select: { entryId: true, authorId: true, status: true },
    });

    if (!comment || comment.entryId !== entryId) {
      this.throwCommentNotFound();
    }
    if (comment.status !== EntryCommentStatus.ACTIVE) {
      throw new NotFoundException({
        error: COMMUNITY_ERROR_CODES.COMMENT_UNAVAILABLE,
        message: "Comment is not available.",
      });
    }

    return comment;
  }

  private async ensureOwnedActiveComment(userId: string, entryId: string, commentId: string) {
    const comment = await this.ensureActiveComment(entryId, commentId);
    if (comment.authorId !== userId) {
      throw new ForbiddenException({
        error: COMMUNITY_ERROR_CODES.COMMENT_NOT_OWNED,
        message: "Comment does not belong to the current user.",
      });
    }
  }

  private async findVisibleCommentIds(entryId: string) {
    const rows = await this.prisma.$queryRaw<Array<{ id: string }>>`
      WITH RECURSIVE visible_comments AS (
        SELECT "id", "parent_id"
        FROM "entry_comments"
        WHERE "entry_id" = ${entryId}::uuid
          AND "status" = 'ACTIVE'::"entry_comment_status"
        UNION
        SELECT parent."id", parent."parent_id"
        FROM "entry_comments" parent
        INNER JOIN visible_comments child ON child."parent_id" = parent."id"
        WHERE parent."entry_id" = ${entryId}::uuid
      )
      SELECT DISTINCT "id" FROM visible_comments
    `;

    return rows.map((row) => row.id);
  }

  private commentSelect(visibleIds: string[]) {
    return {
      id: true,
      entryId: true,
      authorId: true,
      parentId: true,
      body: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { id: true, displayName: true, profileImageUrl: true } },
      _count: {
        select: {
          likes: true,
          replies: visibleIds.length > 0 ? { where: { id: { in: visibleIds } } } : true,
        },
      },
    } satisfies Prisma.EntryCommentSelect;
  }

  private commentOrder(sort: "newest" | "oldest" | "mostLiked") {
    if (sort === "oldest") {
      return [
        { createdAt: "asc" },
        { id: "asc" },
      ] satisfies Prisma.EntryCommentOrderByWithRelationInput[];
    }
    if (sort === "mostLiked") {
      return [
        { likes: { _count: "desc" } },
        { createdAt: "desc" },
        { id: "desc" },
      ] satisfies Prisma.EntryCommentOrderByWithRelationInput[];
    }
    return [
      { createdAt: "desc" },
      { id: "desc" },
    ] satisfies Prisma.EntryCommentOrderByWithRelationInput[];
  }

  private normalizeCommentBody(body: string) {
    const normalizedBody = body
      .normalize("NFC")
      .replace(/\r\n?/g, "\n")
      .replace(/[\t ]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (normalizedBody.length < 1 || normalizedBody.length > 1000) {
      throw new BadRequestException({
        error: COMMUNITY_ERROR_CODES.COMMENT_BODY_INVALID,
        message: "Comment body must be between 1 and 1000 normalized characters.",
      });
    }

    return normalizedBody;
  }

  private normalizePagination(query: CommentPaginationQueryDto) {
    return { page: query.page ?? 1, limit: query.limit ?? 10 };
  }

  private createMeta(page: number, limit: number, total: number) {
    return { page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  private emptyCommentList(page: number, limit: number) {
    return { data: [], meta: this.createMeta(page, limit, 0), commentCount: 0 };
  }

  private mapComment(comment: CommentPayload, entry: PublishedEntryIdentity) {
    const isActive = comment.status === EntryCommentStatus.ACTIVE;

    return {
      id: comment.id,
      entryId: comment.entryId,
      parentId: comment.parentId,
      body: isActive ? comment.body : null,
      status: comment.status,
      author: isActive
        ? {
            id: comment.author.id,
            displayName: comment.author.displayName,
            profileImageUrl: comment.author.profileImageUrl,
            isEntryAuthor: comment.authorId === entry.authorId,
          }
        : null,
      likeCount: isActive ? comment._count.likes : 0,
      directReplyCount: comment._count.replies,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  private throwCommentNotFound(): never {
    throw new NotFoundException({
      error: COMMUNITY_ERROR_CODES.COMMENT_NOT_FOUND,
      message: "Comment was not found.",
    });
  }
}

export { CommunityService };
