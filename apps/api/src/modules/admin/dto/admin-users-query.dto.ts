import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

import {
  AuthProvider,
  EntryStatus,
  PublicReviewStatus,
  UserRole,
  UserStatus,
} from "@/generated/prisma/enums";

const ADMIN_USER_SORT_FIELDS = ["createdAt", "displayName", "lastLoginAt"] as const;
const ADMIN_USER_SORT_DIRECTIONS = ["asc", "desc"] as const;
const ADMIN_USER_AUTH_METHODS = ["PASSWORD", AuthProvider.GOOGLE, AuthProvider.FACEBOOK] as const;

class AdminPaginationQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

class AdminUsersQueryDto extends AdminPaginationQueryDto {
  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ enum: ADMIN_USER_AUTH_METHODS })
  @IsOptional()
  @IsIn(ADMIN_USER_AUTH_METHODS)
  authMethod?: (typeof ADMIN_USER_AUTH_METHODS)[number];

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  @IsBoolean()
  emailVerified?: boolean;

  @ApiPropertyOptional({ enum: ADMIN_USER_SORT_FIELDS, default: "createdAt" })
  @IsOptional()
  @IsIn(ADMIN_USER_SORT_FIELDS)
  sortBy?: (typeof ADMIN_USER_SORT_FIELDS)[number] = "createdAt";

  @ApiPropertyOptional({ enum: ADMIN_USER_SORT_DIRECTIONS, default: "desc" })
  @IsOptional()
  @IsIn(ADMIN_USER_SORT_DIRECTIONS)
  sortDirection?: (typeof ADMIN_USER_SORT_DIRECTIONS)[number] = "desc";
}

class AdminUserEntriesQueryDto extends AdminPaginationQueryDto {
  @ApiPropertyOptional({ enum: EntryStatus })
  @IsOptional()
  @IsEnum(EntryStatus)
  status?: EntryStatus;

  @ApiPropertyOptional({ enum: ADMIN_USER_SORT_DIRECTIONS, default: "desc" })
  @IsOptional()
  @IsIn(ADMIN_USER_SORT_DIRECTIONS)
  sortDirection?: (typeof ADMIN_USER_SORT_DIRECTIONS)[number] = "desc";
}

class AdminUserReviewsQueryDto extends AdminPaginationQueryDto {
  @ApiPropertyOptional({ enum: PublicReviewStatus })
  @IsOptional()
  @IsEnum(PublicReviewStatus)
  status?: PublicReviewStatus;
}

class AdminUserActivityQueryDto extends AdminPaginationQueryDto {}

export {
  ADMIN_USER_AUTH_METHODS,
  ADMIN_USER_SORT_DIRECTIONS,
  ADMIN_USER_SORT_FIELDS,
  AdminPaginationQueryDto,
  AdminUserActivityQueryDto,
  AdminUserEntriesQueryDto,
  AdminUserReviewsQueryDto,
  AdminUsersQueryDto,
};
