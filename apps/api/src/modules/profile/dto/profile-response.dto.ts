import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { EntryCommentStatus, EntryStatus, UserRole, UserStatus } from "@/generated/prisma/enums";

class ProfileProvinceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;
}

class ProfileOwnerDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  @ApiProperty({ enum: UserStatus })
  status!: UserStatus;

  @ApiProperty()
  displayName!: string;

  @ApiPropertyOptional()
  profileImageUrl!: string | null;

  @ApiPropertyOptional()
  biography!: string | null;

  @ApiPropertyOptional({ type: ProfileProvinceDto })
  province!: ProfileProvinceDto | null;

  @ApiProperty({ type: [String] })
  culturalInterests!: string[];

  @ApiProperty()
  emailVerified!: boolean;

  @ApiPropertyOptional()
  emailVerifiedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

class ProfileResponseDto {
  @ApiProperty({ type: ProfileOwnerDto })
  data!: ProfileOwnerDto;
}

class ProfileEntryStatusCountsDto {
  @ApiProperty()
  all!: number;

  @ApiProperty()
  draft!: number;

  @ApiProperty()
  pendingReview!: number;

  @ApiProperty()
  changesRequested!: number;

  @ApiProperty()
  published!: number;

  @ApiProperty()
  rejected!: number;

  @ApiProperty()
  hidden!: number;

  @ApiProperty()
  archived!: number;
}

class ProfileStatsDto {
  @ApiProperty({ type: ProfileEntryStatusCountsDto })
  entries!: ProfileEntryStatusCountsDto;

  @ApiProperty()
  comments!: number;

  @ApiProperty()
  bookmarks!: number;

  @ApiProperty()
  needsAttention!: number;
}

class ProfileStatsResponseDto {
  @ApiProperty({ type: ProfileStatsDto })
  data!: ProfileStatsDto;
}

class ProfileListMetaDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  totalPages!: number;
}

class ProfileEntrySummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  summary!: string;

  @ApiProperty({ enum: EntryStatus })
  status!: EntryStatus;

  @ApiPropertyOptional()
  publishedAt!: Date | null;

  @ApiProperty()
  updatedAt!: Date;
}

class ProfileCommentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  entryId!: string;

  @ApiPropertyOptional({ nullable: true })
  parentId!: string | null;

  @ApiProperty()
  body!: string;

  @ApiProperty({ enum: EntryCommentStatus })
  status!: EntryCommentStatus;

  @ApiProperty({ type: ProfileEntrySummaryDto })
  entry!: ProfileEntrySummaryDto;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

class ProfileCommentsResponseDto {
  @ApiProperty({ type: [ProfileCommentDto] })
  data!: ProfileCommentDto[];

  @ApiProperty({ type: ProfileListMetaDto })
  meta!: ProfileListMetaDto;
}

class ProfileBookmarkDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  entryId!: string;

  @ApiProperty({ type: ProfileEntrySummaryDto })
  entry!: ProfileEntrySummaryDto;

  @ApiProperty()
  createdAt!: Date;
}

class ProfileBookmarksResponseDto {
  @ApiProperty({ type: [ProfileBookmarkDto] })
  data!: ProfileBookmarkDto[];

  @ApiProperty({ type: ProfileListMetaDto })
  meta!: ProfileListMetaDto;
}

class ProfileBookmarkStatusDto {
  @ApiProperty()
  entryId!: string;

  @ApiProperty()
  bookmarked!: boolean;

  @ApiPropertyOptional()
  bookmarkId!: string | null;

  @ApiProperty()
  bookmarkCount!: number;
}

class ProfileBookmarkStatusResponseDto {
  @ApiProperty({ type: ProfileBookmarkStatusDto })
  data!: ProfileBookmarkStatusDto;
}

export {
  ProfileBookmarkStatusResponseDto,
  ProfileBookmarksResponseDto,
  ProfileCommentsResponseDto,
  ProfileResponseDto,
  ProfileStatsResponseDto,
};
