import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from "class-validator";

const MODERATION_SORT_DIRECTIONS = ["asc", "desc"] as const;

class ModerationSubmissionsQueryDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  provinceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  contentTypeId?: string;

  @ApiPropertyOptional({ enum: MODERATION_SORT_DIRECTIONS, default: "desc" })
  @IsOptional()
  @IsIn(MODERATION_SORT_DIRECTIONS)
  sortDirection?: (typeof MODERATION_SORT_DIRECTIONS)[number] = "desc";
}

export { MODERATION_SORT_DIRECTIONS, ModerationSubmissionsQueryDto };
