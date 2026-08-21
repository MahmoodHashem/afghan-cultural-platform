import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, Max, Min } from "class-validator";

import { EntryStatus, PublicReviewStatus } from "@/generated/prisma/enums";

const PROFILE_SORT_DIRECTIONS = ["asc", "desc"] as const;
const PROFILE_REVIEW_SORT_FIELDS = ["createdAt", "updatedAt"] as const;
const PROFILE_BOOKMARK_SORT_FIELDS = ["createdAt"] as const;

class ProfileReviewsQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: PublicReviewStatus })
  @IsOptional()
  @IsEnum(PublicReviewStatus)
  status?: PublicReviewStatus;

  @ApiPropertyOptional({ enum: PROFILE_REVIEW_SORT_FIELDS, default: "createdAt" })
  @IsOptional()
  @IsIn(PROFILE_REVIEW_SORT_FIELDS)
  sortBy?: (typeof PROFILE_REVIEW_SORT_FIELDS)[number] = "createdAt";

  @ApiPropertyOptional({ enum: PROFILE_SORT_DIRECTIONS, default: "desc" })
  @IsOptional()
  @IsIn(PROFILE_SORT_DIRECTIONS)
  sortDirection?: (typeof PROFILE_SORT_DIRECTIONS)[number] = "desc";
}

class ProfileBookmarksQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: PROFILE_BOOKMARK_SORT_FIELDS, default: "createdAt" })
  @IsOptional()
  @IsIn(PROFILE_BOOKMARK_SORT_FIELDS)
  sortBy?: (typeof PROFILE_BOOKMARK_SORT_FIELDS)[number] = "createdAt";

  @ApiPropertyOptional({ enum: PROFILE_SORT_DIRECTIONS, default: "desc" })
  @IsOptional()
  @IsIn(PROFILE_SORT_DIRECTIONS)
  sortDirection?: (typeof PROFILE_SORT_DIRECTIONS)[number] = "desc";
}

class ProfileEntryStatsQueryDto {
  @ApiPropertyOptional({ enum: EntryStatus })
  @IsOptional()
  @IsEnum(EntryStatus)
  status?: EntryStatus;
}

export {
  PROFILE_BOOKMARK_SORT_FIELDS,
  PROFILE_REVIEW_SORT_FIELDS,
  PROFILE_SORT_DIRECTIONS,
  ProfileBookmarksQueryDto,
  ProfileEntryStatsQueryDto,
  ProfileReviewsQueryDto,
};
