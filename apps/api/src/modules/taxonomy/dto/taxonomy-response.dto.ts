import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class PaginationMetaDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  totalPages!: number;
}

class TaxonomyItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

class DescribedTaxonomyItemDto extends TaxonomyItemDto {
  @ApiPropertyOptional()
  description!: string | null;
}

class DistrictItemDto extends TaxonomyItemDto {
  @ApiProperty()
  provinceId!: string;

  @ApiPropertyOptional()
  province?: TaxonomyItemDto;
}

class TagItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  normalizedName!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

class TaxonomyListResponseDto<TItem> {
  @ApiProperty()
  data!: TItem[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

class TaxonomyItemResponseDto<TItem> {
  @ApiProperty()
  data!: TItem;
}

class TaxonomyMessageResponseDto {
  @ApiProperty()
  data!: {
    message: string;
  };
}

export {
  DescribedTaxonomyItemDto,
  DistrictItemDto,
  PaginationMetaDto,
  TagItemDto,
  TaxonomyItemDto,
  TaxonomyItemResponseDto,
  TaxonomyListResponseDto,
  TaxonomyMessageResponseDto,
};
