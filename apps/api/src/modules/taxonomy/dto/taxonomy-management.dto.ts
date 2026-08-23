import { ApiProperty, ApiPropertyOptional, PartialType, PickType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

class BaseTaxonomyDto {
  @ApiProperty({ minLength: 2, maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    description: "Readable Latin slug. Generated from name when omitted.",
    pattern: SLUG_PATTERN.source,
  })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  @Matches(SLUG_PATTERN, {
    message: "slug must contain lowercase Latin letters, numbers, and single hyphens only",
  })
  slug?: string;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class CreateProvinceDto extends BaseTaxonomyDto {
  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

class UpdateProvinceDto extends PartialType(CreateProvinceDto) {}

class UpdateProvinceImageDto {
  @ApiProperty({ minLength: 2, maxLength: 220 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(220)
  altText!: string;
}

class CreateDistrictDto extends BaseTaxonomyDto {
  @ApiProperty()
  @IsUUID()
  provinceId!: string;
}

class UpdateDistrictDto extends PartialType(CreateDistrictDto) {}

class CreateDescribedTaxonomyDto extends BaseTaxonomyDto {
  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

class UpdateDescribedTaxonomyDto extends PartialType(CreateDescribedTaxonomyDto) {}

class CreateTagDto extends PickType(BaseTaxonomyDto, ["name", "slug", "isActive"] as const) {}

class UpdateTagDto extends PartialType(CreateTagDto) {}

class SetTaxonomyActiveDto {
  @ApiProperty()
  @IsBoolean()
  isActive!: boolean;
}

class ReorderTaxonomyItemDto {
  @ApiProperty()
  @IsUUID()
  id!: string;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  sortOrder!: number;
}

class ReorderTaxonomyDto {
  @ApiProperty({ type: [ReorderTaxonomyItemDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReorderTaxonomyItemDto)
  items!: ReorderTaxonomyItemDto[];
}

export {
  CreateDescribedTaxonomyDto,
  CreateDistrictDto,
  CreateProvinceDto,
  CreateTagDto,
  ReorderTaxonomyDto,
  SetTaxonomyActiveDto,
  SLUG_PATTERN,
  UpdateDescribedTaxonomyDto,
  UpdateDistrictDto,
  UpdateProvinceDto,
  UpdateProvinceImageDto,
  UpdateTagDto,
};
