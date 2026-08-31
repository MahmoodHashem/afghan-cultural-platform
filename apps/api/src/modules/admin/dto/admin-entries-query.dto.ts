import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";

import { EntryStatus, GeographicScope } from "../../../generated/prisma/enums";

const ADMIN_ENTRY_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "submittedAt",
  "publishedAt",
  "title",
  "viewCount",
] as const;
const ADMIN_ENTRY_SORT_DIRECTIONS = ["asc", "desc"] as const;

class AdminEntriesQueryDto {
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

  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({ enum: EntryStatus })
  @IsOptional()
  @IsEnum(EntryStatus)
  status?: EntryStatus;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  contentTypeId?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  provinceId?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiPropertyOptional({ enum: GeographicScope })
  @IsOptional()
  @IsEnum(GeographicScope)
  geographicScope?: GeographicScope;

  @ApiPropertyOptional({ enum: ADMIN_ENTRY_SORT_FIELDS, default: "updatedAt" })
  @IsOptional()
  @IsIn(ADMIN_ENTRY_SORT_FIELDS)
  sortBy?: (typeof ADMIN_ENTRY_SORT_FIELDS)[number] = "updatedAt";

  @ApiPropertyOptional({ enum: ADMIN_ENTRY_SORT_DIRECTIONS, default: "desc" })
  @IsOptional()
  @IsIn(ADMIN_ENTRY_SORT_DIRECTIONS)
  sortDirection?: (typeof ADMIN_ENTRY_SORT_DIRECTIONS)[number] = "desc";
}

export { ADMIN_ENTRY_SORT_DIRECTIONS, ADMIN_ENTRY_SORT_FIELDS, AdminEntriesQueryDto };
