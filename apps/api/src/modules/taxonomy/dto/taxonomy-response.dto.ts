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

class AdminCategoryItemDto extends DescribedTaxonomyItemDto {
  @ApiProperty()
  entryCount!: number;
}

class AdminContentTypeItemDto extends DescribedTaxonomyItemDto {
  @ApiProperty()
  entryCount!: number;
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

class AdminTagItemDto extends TagItemDto {
  @ApiProperty()
  entryCount!: number;
}

class TaxonomyListResponseDto<TItem> {
  @ApiProperty()
  data!: TItem[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

class AdminCategoryListResponseDto {
  @ApiProperty({ type: [AdminCategoryItemDto] })
  data!: AdminCategoryItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

class AdminContentTypeListResponseDto {
  @ApiProperty({ type: [AdminContentTypeItemDto] })
  data!: AdminContentTypeItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

class AdminTagListResponseDto {
  @ApiProperty({ type: [AdminTagItemDto] })
  data!: AdminTagItemDto[];

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
  AdminCategoryItemDto,
  AdminCategoryListResponseDto,
  AdminContentTypeItemDto,
  AdminContentTypeListResponseDto,
  AdminTagItemDto,
  AdminTagListResponseDto,
  DescribedTaxonomyItemDto,
  DistrictItemDto,
  PaginationMetaDto,
  TagItemDto,
  TaxonomyItemDto,
  TaxonomyItemResponseDto,
  TaxonomyListResponseDto,
  TaxonomyMessageResponseDto,
};
