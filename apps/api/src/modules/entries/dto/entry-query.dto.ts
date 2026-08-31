import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, IsUUID, Max, Min } from "class-validator";

import { EntryStatus } from "../../../generated/prisma/enums";

const ENTRY_SORT_FIELDS = ["createdAt", "updatedAt"] as const;
const ENTRY_SORT_DIRECTIONS = ["asc", "desc"] as const;

class OwnEntriesQueryDto {
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

  @ApiPropertyOptional({ enum: EntryStatus })
  @IsOptional()
  @IsEnum(EntryStatus)
  status?: EntryStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  contentTypeId?: string;

  @ApiPropertyOptional({ enum: ENTRY_SORT_FIELDS, default: "updatedAt" })
  @IsOptional()
  @IsIn(ENTRY_SORT_FIELDS)
  sortBy?: (typeof ENTRY_SORT_FIELDS)[number] = "updatedAt";

  @ApiPropertyOptional({ enum: ENTRY_SORT_DIRECTIONS, default: "desc" })
  @IsOptional()
  @IsIn(ENTRY_SORT_DIRECTIONS)
  sortDirection?: (typeof ENTRY_SORT_DIRECTIONS)[number] = "desc";
}

export { ENTRY_SORT_DIRECTIONS, ENTRY_SORT_FIELDS, OwnEntriesQueryDto };
