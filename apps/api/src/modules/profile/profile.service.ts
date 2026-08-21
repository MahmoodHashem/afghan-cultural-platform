import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@/database/prisma.service";
import type { Prisma } from "@/generated/prisma/client";
import { EntryStatus, PublicReviewStatus } from "@/generated/prisma/enums";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import type {
  ProfileBookmarksQueryDto,
  ProfileReviewsQueryDto,
} from "@/modules/profile/dto/profile-query.dto";
import type { UpdateProfileDto } from "@/modules/profile/dto/update-profile.dto";
import { PROFILE_ERROR_CODES } from "@/modules/profile/profile.constants";

const profileUserSelect = {
  id: true,
  email: true,
  role: true,
  status: true,
  displayName: true,
  profileImageUrl: true,
  biography: true,
  culturalInterests: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
  province: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} as const;

const profileEntrySummarySelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  status: true,
  publishedAt: true,
  updatedAt: true,
} as const;

const profileReviewSelect = {
  id: true,
  entryId: true,
  body: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  entry: {
    select: profileEntrySummarySelect,
  },
} as const;

const profileBookmarkSelect = {
  id: true,
  entryId: true,
  createdAt: true,
  entry: {
    select: profileEntrySummarySelect,
  },
} as const;

type ProfileUserPayload = Prisma.UserGetPayload<{ select: typeof profileUserSelect }>;
type ProfileReviewPayload = Prisma.PublicReviewGetPayload<{ select: typeof profileReviewSelect }>;
type ProfileBookmarkPayload = Prisma.BookmarkGetPayload<{ select: typeof profileBookmarkSelect }>;

type NormalizedPaginationQuery = {
  page: number;
  limit: number;
};

type ProfilePaginationInput = {
  page?: number;
  limit?: number;
};

@Injectable()
class ProfileService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getMyProfile(user: AuthenticatedUser) {
    const profile = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: profileUserSelect,
    });

    if (!profile) {
      throw new NotFoundException({
        error: "PROFILE_NOT_FOUND",
        message: "Profile was not found.",
      });
    }

    return {
      data: mapProfileUser(profile),
    };
  }

  async updateMyProfile(user: AuthenticatedUser, input: UpdateProfileDto) {
    const data: Prisma.UserUpdateInput = {};

    if (input.displayName !== undefined) {
      data.displayName = this.normalizeDisplayName(input.displayName);
    }

    if (input.biography !== undefined) {
      data.biography = this.normalizeBiography(input.biography);
    }

    if (input.profileImageUrl !== undefined) {
      data.profileImageUrl = this.normalizeNullableText(input.profileImageUrl);
    }

    if (input.provinceId !== undefined) {
      data.province = input.provinceId
        ? { connect: { id: await this.getActiveProvinceId(input.provinceId) } }
        : { disconnect: true };
    }

    if (input.culturalInterests !== undefined) {
      data.culturalInterests = this.normalizeCulturalInterests(input.culturalInterests);
    }

    const profile = await this.prisma.user.update({
      where: { id: user.id },
      data,
      select: profileUserSelect,
    });

    return {
      data: mapProfileUser(profile),
    };
  }

  async getMyStats(user: AuthenticatedUser) {
    const [entryStatusCounts, reviewCount, bookmarkCount] = await this.prisma.$transaction([
      this.prisma.culturalEntry.groupBy({
        by: ["status"],
        where: {
          authorId: user.id,
        },
        orderBy: {
          status: "asc",
        },
        _count: {
          _all: true,
        },
      }),
      this.prisma.publicReview.count({
        where: {
          userId: user.id,
          status: PublicReviewStatus.ACTIVE,
        },
      }),
      this.prisma.bookmark.count({
        where: {
          userId: user.id,
          entry: this.publishedEntryWhere(),
        },
      }),
    ]);

    const entries = createEntryStatusCounts(entryStatusCounts);

    return {
      data: {
        entries,
        reviews: reviewCount,
        bookmarks: bookmarkCount,
        needsAttention: entries.pendingReview + entries.changesRequested,
      },
    };
  }

  async listMyReviews(user: AuthenticatedUser, query: ProfileReviewsQueryDto) {
    const normalizedQuery = this.normalizePagination(query);
    const where: Prisma.PublicReviewWhereInput = {
      userId: user.id,
      ...(query.status ? { status: query.status } : {}),
    };

    const [reviews, total] = await this.prisma.$transaction([
      this.prisma.publicReview.findMany({
        where,
        select: profileReviewSelect,
        orderBy: {
          [query.sortBy ?? "createdAt"]: query.sortDirection ?? "desc",
        },
        skip: this.skip(normalizedQuery),
        take: normalizedQuery.limit,
      }),
      this.prisma.publicReview.count({ where }),
    ]);

    return {
      data: reviews.map(mapProfileReview),
      meta: this.createMeta(normalizedQuery, total),
    };
  }

  async listMyBookmarks(user: AuthenticatedUser, query: ProfileBookmarksQueryDto) {
    const normalizedQuery = this.normalizePagination(query);
    const where: Prisma.BookmarkWhereInput = {
      userId: user.id,
      entry: this.publishedEntryWhere(),
    };

    const [bookmarks, total] = await this.prisma.$transaction([
      this.prisma.bookmark.findMany({
        where,
        select: profileBookmarkSelect,
        orderBy: {
          [query.sortBy ?? "createdAt"]: query.sortDirection ?? "desc",
        },
        skip: this.skip(normalizedQuery),
        take: normalizedQuery.limit,
      }),
      this.prisma.bookmark.count({ where }),
    ]);

    return {
      data: bookmarks.map(mapProfileBookmark),
      meta: this.createMeta(normalizedQuery, total),
    };
  }

  async getMyBookmarkStatus(user: AuthenticatedUser, entryId: string) {
    await this.ensurePublishedEntry(entryId);

    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        userId_entryId: {
          userId: user.id,
          entryId,
        },
      },
      select: {
        id: true,
      },
    });

    return {
      data: {
        entryId,
        bookmarked: Boolean(bookmark),
        bookmarkId: bookmark?.id ?? null,
      },
    };
  }

  async saveBookmark(user: AuthenticatedUser, entryId: string) {
    await this.ensurePublishedEntry(entryId);

    const bookmark = await this.prisma.bookmark.upsert({
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
      select: {
        id: true,
      },
    });

    return {
      data: {
        entryId,
        bookmarked: true,
        bookmarkId: bookmark.id,
      },
    };
  }

  async removeBookmark(user: AuthenticatedUser, entryId: string) {
    await this.ensurePublishedEntry(entryId);

    await this.prisma.bookmark.deleteMany({
      where: {
        userId: user.id,
        entryId,
      },
    });

    return {
      data: {
        entryId,
        bookmarked: false,
        bookmarkId: null,
      },
    };
  }

  private normalizePagination(query: ProfilePaginationInput): NormalizedPaginationQuery {
    return {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    };
  }

  private skip(query: NormalizedPaginationQuery): number {
    return (query.page - 1) * query.limit;
  }

  private createMeta(query: NormalizedPaginationQuery, total: number) {
    return {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  private normalizeDisplayName(displayName: string): string {
    const normalized = displayName.trim().replace(/\s+/g, " ");

    if (normalized.length < 2 || normalized.length > 80) {
      throw new BadRequestException({
        error: PROFILE_ERROR_CODES.DISPLAY_NAME_INVALID,
        message: "Display name must be between 2 and 80 characters.",
      });
    }

    return normalized;
  }

  private normalizeBiography(biography: string | null): string | null {
    const normalized = this.normalizeNullableText(biography);

    if (normalized && normalized.length > 600) {
      throw new BadRequestException({
        error: PROFILE_ERROR_CODES.BIOGRAPHY_INVALID,
        message: "Biography must be at most 600 characters.",
      });
    }

    return normalized;
  }

  private normalizeNullableText(value: string | null | undefined): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const normalized = value.trim().replace(/\s+/g, " ");

    return normalized.length > 0 ? normalized : null;
  }

  private normalizeCulturalInterests(interests: string[]): string[] {
    const normalizedInterests = interests
      .map((interest) => interest.trim().replace(/\s+/g, " "))
      .filter((interest) => interest.length > 0);
    const uniqueInterests = [...new Set(normalizedInterests)];

    if (
      uniqueInterests.length > 12 ||
      uniqueInterests.some((interest) => interest.length < 2 || interest.length > 60)
    ) {
      throw new BadRequestException({
        error: PROFILE_ERROR_CODES.CULTURAL_INTEREST_INVALID,
        message: "Cultural interests must be between 2 and 60 characters each.",
      });
    }

    return uniqueInterests;
  }

  private async getActiveProvinceId(provinceId: string): Promise<string> {
    const province = await this.prisma.province.findFirst({
      where: {
        id: provinceId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!province) {
      throw new BadRequestException({
        error: PROFILE_ERROR_CODES.PROVINCE_INVALID,
        message: "Province is invalid or inactive.",
      });
    }

    return province.id;
  }

  private async ensurePublishedEntry(entryId: string) {
    const entry = await this.prisma.culturalEntry.findFirst({
      where: {
        id: entryId,
        ...this.publishedEntryWhere(),
      },
      select: {
        id: true,
      },
    });

    if (!entry) {
      throw new NotFoundException({
        error: PROFILE_ERROR_CODES.BOOKMARK_ENTRY_NOT_FOUND,
        message: "Published entry was not found.",
      });
    }
  }

  private publishedEntryWhere(): Prisma.CulturalEntryWhereInput {
    return {
      status: EntryStatus.PUBLISHED,
      publishedAt: {
        not: null,
      },
    };
  }
}

function mapProfileUser(user: ProfileUserPayload) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    displayName: user.displayName,
    profileImageUrl: user.profileImageUrl,
    biography: user.biography,
    province: user.province,
    culturalInterests: user.culturalInterests,
    emailVerified: Boolean(user.emailVerifiedAt),
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function mapProfileReview(review: ProfileReviewPayload) {
  return {
    id: review.id,
    entryId: review.entryId,
    body: review.body,
    status: review.status,
    entry: review.entry,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

function mapProfileBookmark(bookmark: ProfileBookmarkPayload) {
  return {
    id: bookmark.id,
    entryId: bookmark.entryId,
    entry: bookmark.entry,
    createdAt: bookmark.createdAt,
  };
}

function createEntryStatusCounts(
  groupedCounts: Array<{ status: EntryStatus; _count?: true | { _all?: number } }>,
) {
  const byStatus = new Map(
    groupedCounts.map((count) => [count.status, getGroupCount(count._count)] as const),
  );

  return {
    all: groupedCounts.reduce((sum, count) => sum + getGroupCount(count._count), 0),
    draft: byStatus.get(EntryStatus.DRAFT) ?? 0,
    pendingReview: byStatus.get(EntryStatus.PENDING_REVIEW) ?? 0,
    changesRequested: byStatus.get(EntryStatus.CHANGES_REQUESTED) ?? 0,
    published: byStatus.get(EntryStatus.PUBLISHED) ?? 0,
    rejected: byStatus.get(EntryStatus.REJECTED) ?? 0,
    hidden: byStatus.get(EntryStatus.HIDDEN) ?? 0,
    archived: byStatus.get(EntryStatus.ARCHIVED) ?? 0,
  };
}

function getGroupCount(count: true | { _all?: number } | undefined): number {
  return typeof count === "object" ? (count._all ?? 0) : 0;
}

export { ProfileService };
