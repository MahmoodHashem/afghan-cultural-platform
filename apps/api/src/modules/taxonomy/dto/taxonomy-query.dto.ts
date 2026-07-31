import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

const TAXONOMY_SORT_FIELDS = ["name", "slug", "sortOrder", "createdAt", "updatedAt"] as const;
const SORT_DIRECTIONS = ["asc", "desc"] as const;

class TaxonomyQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 50 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 50;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: TAXONOMY_SORT_FIELDS, default: "sortOrder" })
  @IsOptional()
  @IsIn(TAXONOMY_SORT_FIELDS)
  sortBy: (typeof TAXONOMY_SORT_FIELDS)[number] = "sortOrder";

  @ApiPropertyOptional({ enum: SORT_DIRECTIONS, default: "asc" })
  @IsOptional()
  @IsIn(SORT_DIRECTIONS)
  sortDirection: (typeof SORT_DIRECTIONS)[number] = "asc";
}

class AdminTaxonomyQueryDto extends TaxonomyQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    return value;
  })
  @IsBoolean()
  isActive?: boolean;
}

class DistrictQueryDto extends TaxonomyQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  provinceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  provinceSlug?: string;
}

class AdminDistrictQueryDto extends AdminTaxonomyQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  provinceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  provinceSlug?: string;
}

export {
  AdminDistrictQueryDto,
  AdminTaxonomyQueryDto,
  DistrictQueryDto,
  SORT_DIRECTIONS,
  TAXONOMY_SORT_FIELDS,
  TaxonomyQueryDto,
};
