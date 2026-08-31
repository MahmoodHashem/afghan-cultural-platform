import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, Max, Min } from "class-validator";

import { EntryCommentStatus, EntryStatus } from "../../../generated/prisma/enums";

const PROFILE_SORT_DIRECTIONS = ["asc", "desc"] as const;
const PROFILE_COMMENT_SORT_FIELDS = ["createdAt", "updatedAt"] as const;
const PROFILE_BOOKMARK_SORT_FIELDS = ["createdAt"] as const;

class ProfileCommentsQueryDto {
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

  @ApiPropertyOptional({ enum: EntryCommentStatus })
  @IsOptional()
  @IsEnum(EntryCommentStatus)
  status?: EntryCommentStatus;

  @ApiPropertyOptional({ enum: PROFILE_COMMENT_SORT_FIELDS, default: "createdAt" })
  @IsOptional()
  @IsIn(PROFILE_COMMENT_SORT_FIELDS)
  sortBy?: (typeof PROFILE_COMMENT_SORT_FIELDS)[number] = "createdAt";

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
  PROFILE_COMMENT_SORT_FIELDS,
  PROFILE_SORT_DIRECTIONS,
  ProfileBookmarksQueryDto,
  ProfileCommentsQueryDto,
  ProfileEntryStatsQueryDto,
};
