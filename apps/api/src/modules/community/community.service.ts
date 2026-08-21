import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service";
import type { Prisma } from "@/generated/prisma/client";
import { EntryStatus, PublicReviewStatus } from "@/generated/prisma/enums";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import { COMMUNITY_ERROR_CODES } from "@/modules/community/community.constants";
import type {
  CreatePublicReviewDto,
  UpdatePublicReviewDto,
} from "@/modules/community/dto/community-feedback.dto";

const publicReviewSelect = {
  id: true,
  entryId: true,
  body: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      displayName: true,
      profileImageUrl: true,
    },
  },
} as const;

type PublicReviewPayload = Prisma.PublicReviewGetPayload<{ select: typeof publicReviewSelect }>;

@Injectable()
class CommunityService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listPublicReviews(entryId: string) {
    await this.ensurePublishedEntry(entryId);

    const reviews = await this.prisma.publicReview.findMany({
      where: {
        entryId,
        status: PublicReviewStatus.ACTIVE,
      },
      select: publicReviewSelect,
      orderBy: { createdAt: "desc" },
    });

    return {
      data: reviews.map(mapPublicReview),
    };
  }

  async getLikeState(user: AuthenticatedUser, entryId: string) {
    await this.ensurePublishedEntry(entryId);

    const [likeCount, ownLike] = await this.prisma.$transaction([
      this.prisma.like.count({ where: { entryId } }),
      this.prisma.like.findUnique({
        where: {
          userId_entryId: {
            userId: user.id,
            entryId,
          },
        },
        select: { id: true },
      }),
    ]);

    return {
      data: {
        entryId,
        likeCount,
        isLikedByCurrentUser: Boolean(ownLike),
      },
    };
  }

  async likeEntry(user: AuthenticatedUser, entryId: string) {
    await this.ensurePublishedEntry(entryId);

    return this.prisma.$transaction(async (tx) => {
      await tx.like.upsert({
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

      const likeCount = await tx.like.count({ where: { entryId } });

      return {
        data: {
          entryId,
          likeCount,
          isLikedByCurrentUser: true,
        },
      };
    });
  }

  async unlikeEntry(user: AuthenticatedUser, entryId: string) {
    await this.ensurePublishedEntry(entryId);

    return this.prisma.$transaction(async (tx) => {
      await tx.like.deleteMany({
        where: {
          userId: user.id,
          entryId,
        },
      });

      const likeCount = await tx.like.count({ where: { entryId } });

      return {
        data: {
          entryId,
          likeCount,
          isLikedByCurrentUser: false,
        },
      };
    });
  }

  async createPublicReview(user: AuthenticatedUser, entryId: string, input: CreatePublicReviewDto) {
    await this.ensurePublishedEntry(entryId);
    const body = this.normalizeReviewBody(input.body);

    const existingReview = await this.prisma.publicReview.findFirst({
      where: {
        entryId,
        userId: user.id,
        status: PublicReviewStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (existingReview) {
      throw new ConflictException({
        error: COMMUNITY_ERROR_CODES.REVIEW_ALREADY_EXISTS,
        message: "User already has an active review for this entry.",
      });
    }

    const review = await this.prisma.publicReview.create({
      data: {
        entryId,
        userId: user.id,
        body,
      },
      select: publicReviewSelect,
    });

    return {
      data: mapPublicReview(review),
    };
  }

  async updateOwnPublicReview(
    user: AuthenticatedUser,
    entryId: string,
    input: UpdatePublicReviewDto,
  ) {
    await this.ensurePublishedEntry(entryId);
    const review = await this.findOwnActiveReview(user.id, entryId);
    const body = this.normalizeReviewBody(input.body);

    const updatedReview = await this.prisma.publicReview.update({
      where: { id: review.id },
      data: { body },
      select: publicReviewSelect,
    });

    return {
      data: mapPublicReview(updatedReview),
    };
  }

  async deleteOwnPublicReview(user: AuthenticatedUser, entryId: string) {
    await this.ensurePublishedEntry(entryId);
    const review = await this.findOwnActiveReview(user.id, entryId);

    await this.prisma.publicReview.update({
      where: { id: review.id },
      data: {
        status: PublicReviewStatus.DELETED,
        deletedAt: new Date(),
      },
    });

    return {
      data: {
        message: "Public review deleted.",
      },
    };
  }

  private async ensurePublishedEntry(entryId: string) {
    const entry = await this.prisma.culturalEntry.findFirst({
      where: {
        id: entryId,
        status: EntryStatus.PUBLISHED,
        publishedAt: { not: null },
      },
      select: { id: true },
    });

    if (!entry) {
      throw new NotFoundException({
        error: COMMUNITY_ERROR_CODES.ENTRY_NOT_FOUND,
        message: "Published entry was not found.",
      });
    }
  }

  private async findOwnActiveReview(userId: string, entryId: string) {
    const review = await this.prisma.publicReview.findFirst({
      where: {
        userId,
        entryId,
        status: PublicReviewStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (!review) {
      throw new NotFoundException({
        error: COMMUNITY_ERROR_CODES.REVIEW_NOT_FOUND,
        message: "Public review was not found.",
      });
    }

    return review;
  }

  private normalizeReviewBody(body: string) {
    const normalizedBody = body.trim().replace(/\s+/g, " ");

    if (normalizedBody.length < 10 || normalizedBody.length > 1200) {
      throw new BadRequestException({
        error: COMMUNITY_ERROR_CODES.REVIEW_BODY_INVALID,
        message: "Review body must be between 10 and 1200 characters.",
      });
    }

    return normalizedBody;
  }
}

function mapPublicReview(review: PublicReviewPayload) {
  return {
    id: review.id,
    entryId: review.entryId,
    body: review.body,
    author: review.user,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

export { CommunityService };
