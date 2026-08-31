import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

import { GeographicScope } from "../../../generated/prisma/enums";

const PUBLIC_ENTRY_SORT_VALUES = ["newest", "oldest", "recentlyUpdated"] as const;

class PublicEntryQueryDto {
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

  @ApiPropertyOptional({
    maxLength: 120,
    description:
      "Persian-normalized keyword search across published entry titles, summaries, content, tags, taxonomy, and locations.",
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  provinceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  provinceSlug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  districtId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  districtSlug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contentTypeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contentTypeSlug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tagId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tagSlug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({
    enum: GeographicScope,
    description:
      "Filter by geographic scope. Province filters only match PROVINCE entries; NATIONAL and NONE are returned through this filter.",
  })
  @IsOptional()
  @IsEnum(GeographicScope)
  geographicScope?: GeographicScope;

  @ApiPropertyOptional({ enum: PUBLIC_ENTRY_SORT_VALUES, default: "newest" })
  @IsOptional()
  @IsString()
  sort?: (typeof PUBLIC_ENTRY_SORT_VALUES)[number] = "newest";
}

export { PUBLIC_ENTRY_SORT_VALUES, PublicEntryQueryDto };
