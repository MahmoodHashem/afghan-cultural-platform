import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { PrismaService } from "../../database/prisma.service";
import type { Prisma } from "../../generated/prisma/client";
import { EntryCommentStatus, EntryStatus } from "../../generated/prisma/enums";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { CloudinaryMediaService } from "../media/cloudinary-media.service";
import { isSupportedImageFile } from "../media/image-file.utils";
import type { ProfileBookmarksQueryDto, ProfileCommentsQueryDto } from "./dto/profile-query.dto";
import type { UpdateProfileDto } from "./dto/update-profile.dto";
import { PROFILE_ERROR_CODES } from "./profile.constants";

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

const profileCommentSelect = {
  id: true,
  entryId: true,
  parentId: true,
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
type ProfileCommentPayload = Prisma.EntryCommentGetPayload<{ select: typeof profileCommentSelect }>;
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
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(CloudinaryMediaService) private readonly mediaService: CloudinaryMediaService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

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

  async uploadMyProfileImage(user: AuthenticatedUser, file: Express.Multer.File | undefined) {
    this.validateProfileImageFile(file);
    const existingProfile = await this.findProfileImage(user.id);
    const uploadedImage = await this.mediaService.uploadProfileImage(file);

    try {
      const profile = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          profileImageUrl: uploadedImage.thumbnailUrl,
          profileImageCloudinaryPublicId: uploadedImage.publicId,
        },
        select: profileUserSelect,
      });

      if (existingProfile.profileImageCloudinaryPublicId) {
        await this.cleanupProfileImage(existingProfile.profileImageCloudinaryPublicId);
      }

      return { data: mapProfileUser(profile) };
    } catch (error) {
      await this.cleanupProfileImage(uploadedImage.publicId);
      throw error;
    }
  }

  async deleteMyProfileImage(user: AuthenticatedUser) {
    const existingProfile = await this.findProfileImage(user.id);
    const profile = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        profileImageUrl: null,
        profileImageCloudinaryPublicId: null,
      },
      select: profileUserSelect,
    });

    if (existingProfile.profileImageCloudinaryPublicId) {
      await this.cleanupProfileImage(existingProfile.profileImageCloudinaryPublicId);
    }

    return { data: mapProfileUser(profile) };
  }

  async getMyStats(user: AuthenticatedUser) {
    const [entryStatusCounts, commentCount, bookmarkCount] = await this.prisma.$transaction([
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
      this.prisma.entryComment.count({
        where: {
          authorId: user.id,
          status: EntryCommentStatus.ACTIVE,
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
        comments: commentCount,
        bookmarks: bookmarkCount,
        needsAttention: entries.pendingReview + entries.changesRequested,
      },
    };
  }

  async listMyComments(user: AuthenticatedUser, query: ProfileCommentsQueryDto) {
    const normalizedQuery = this.normalizePagination(query);
    const where: Prisma.EntryCommentWhereInput = {
      authorId: user.id,
      ...(query.status ? { status: query.status } : {}),
    };

    const [comments, total] = await this.prisma.$transaction([
      this.prisma.entryComment.findMany({
        where,
        select: profileCommentSelect,
        orderBy: {
          [query.sortBy ?? "createdAt"]: query.sortDirection ?? "desc",
        },
        skip: this.skip(normalizedQuery),
        take: normalizedQuery.limit,
      }),
      this.prisma.entryComment.count({ where }),
    ]);

    return {
      data: comments.map(mapProfileComment),
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

    const [bookmark, bookmarkCount] = await this.prisma.$transaction([
      this.prisma.bookmark.findUnique({
        where: {
          userId_entryId: {
            userId: user.id,
            entryId,
          },
        },
        select: {
          id: true,
        },
      }),
      this.prisma.bookmark.count({ where: { entryId } }),
    ]);

    return {
      data: {
        entryId,
        bookmarked: Boolean(bookmark),
        bookmarkId: bookmark?.id ?? null,
        bookmarkCount,
      },
    };
  }

  async saveBookmark(user: AuthenticatedUser, entryId: string) {
    await this.ensurePublishedEntry(entryId);

    return this.prisma.$transaction(async (tx) => {
      const bookmark = await tx.bookmark.upsert({
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
      const bookmarkCount = await tx.bookmark.count({ where: { entryId } });

      return {
        data: {
          entryId,
          bookmarked: true,
          bookmarkId: bookmark.id,
          bookmarkCount,
        },
      };
    });
  }

  async removeBookmark(user: AuthenticatedUser, entryId: string) {
    await this.ensurePublishedEntry(entryId);

    return this.prisma.$transaction(async (tx) => {
      await tx.bookmark.deleteMany({
        where: {
          userId: user.id,
          entryId,
        },
      });
      const bookmarkCount = await tx.bookmark.count({ where: { entryId } });

      return {
        data: {
          entryId,
          bookmarked: false,
          bookmarkId: null,
          bookmarkCount,
        },
      };
    });
  }

  private normalizePagination(query: ProfilePaginationInput): NormalizedPaginationQuery {
    return {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    };
  }

  private async findProfileImage(userId: string) {
    const profile = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        profileImageCloudinaryPublicId: true,
      },
    });

    if (!profile) {
      throw new NotFoundException({
        error: "PROFILE_NOT_FOUND",
        message: "Profile was not found.",
      });
    }

    return profile;
  }

  private validateProfileImageFile(
    file: Express.Multer.File | undefined,
  ): asserts file is Express.Multer.File {
    if (!file) {
      throw new BadRequestException({
        error: PROFILE_ERROR_CODES.IMAGE_INVALID_TYPE,
        message: "Profile image is required.",
      });
    }

    const maxSizeBytes = this.configService.get<number>("MAX_IMAGE_SIZE_MB", 4) * 1024 * 1024;

    if (file.size > maxSizeBytes || file.buffer.length > maxSizeBytes) {
      throw new BadRequestException({
        error: PROFILE_ERROR_CODES.IMAGE_TOO_LARGE,
        message: "Profile image is too large.",
      });
    }

    if (!isSupportedImageFile(file)) {
      throw new BadRequestException({
        error: PROFILE_ERROR_CODES.IMAGE_INVALID_TYPE,
        message: "Only valid JPEG, PNG, and WebP images are supported.",
      });
    }
  }

  private async cleanupProfileImage(publicId: string): Promise<void> {
    try {
      await this.mediaService.deleteImage(publicId);
    } catch (error) {
      this.logger.error(
        `Failed to clean up profile image ${publicId}.`,
        error instanceof Error ? error.stack : String(error),
      );
    }
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

function mapProfileComment(comment: ProfileCommentPayload) {
  return {
    id: comment.id,
    entryId: comment.entryId,
    parentId: comment.parentId,
    body: comment.body,
    status: comment.status,
    entry: comment.entry,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
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
