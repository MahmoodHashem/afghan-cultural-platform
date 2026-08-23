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

class ProvinceImageDto {
  @ApiProperty()
  secureUrl!: string;

  @ApiProperty()
  thumbnailUrl!: string;

  @ApiProperty()
  altText!: string;

  @ApiPropertyOptional({ nullable: true })
  width!: number | null;

  @ApiPropertyOptional({ nullable: true })
  height!: number | null;
}

class ProvinceItemDto extends TaxonomyItemDto {
  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ type: ProvinceImageDto, nullable: true })
  image!: ProvinceImageDto | null;
}

class AdminProvinceItemDto extends ProvinceItemDto {
  @ApiProperty()
  entryCount!: number;

  @ApiProperty()
  districtCount!: number;
}

class AdminProvinceDetailDto extends AdminProvinceItemDto {
  @ApiProperty()
  publishedEntryCount!: number;

  @ApiProperty()
  activeDistrictCount!: number;
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

class AdminDistrictItemDto extends DistrictItemDto {
  @ApiProperty()
  entryCount!: number;
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

class AdminProvinceListResponseDto {
  @ApiProperty({ type: [AdminProvinceItemDto] })
  data!: AdminProvinceItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

class AdminDistrictListResponseDto {
  @ApiProperty({ type: [AdminDistrictItemDto] })
  data!: AdminDistrictItemDto[];

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
  AdminDistrictItemDto,
  AdminDistrictListResponseDto,
  AdminProvinceDetailDto,
  AdminProvinceItemDto,
  AdminProvinceListResponseDto,
  AdminTagItemDto,
  AdminTagListResponseDto,
  DescribedTaxonomyItemDto,
  DistrictItemDto,
  PaginationMetaDto,
  ProvinceImageDto,
  ProvinceItemDto,
  TagItemDto,
  TaxonomyItemDto,
  TaxonomyItemResponseDto,
  TaxonomyListResponseDto,
  TaxonomyMessageResponseDto,
};
