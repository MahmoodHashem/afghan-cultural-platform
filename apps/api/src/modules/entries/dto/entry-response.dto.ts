import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { EntryStatus } from "@/generated/prisma/enums";

class EntryTaxonomyDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;
}

class EntryAuthorDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  displayName!: string;
}

class EntryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string | null;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  summary!: string;

  @ApiProperty({ type: Object })
  contentJson!: unknown;

  @ApiProperty()
  plainTextContent!: string;

  @ApiProperty({ enum: EntryStatus })
  status!: EntryStatus;

  @ApiProperty()
  authorId!: string;

  @ApiProperty()
  provinceId!: string;

  @ApiPropertyOptional()
  districtId!: string | null;

  @ApiProperty()
  categoryId!: string;

  @ApiProperty()
  contentTypeId!: string;

  @ApiPropertyOptional()
  villageOrLocation!: string | null;

  @ApiProperty({ type: EntryAuthorDto })
  author!: EntryAuthorDto;

  @ApiProperty({ type: EntryTaxonomyDto })
  province!: EntryTaxonomyDto;

  @ApiPropertyOptional({ type: EntryTaxonomyDto, nullable: true })
  district!: EntryTaxonomyDto | null;

  @ApiProperty({ type: EntryTaxonomyDto })
  category!: EntryTaxonomyDto;

  @ApiProperty({ type: EntryTaxonomyDto })
  contentType!: EntryTaxonomyDto;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

class EntryResponseDto {
  @ApiProperty({ type: EntryDto })
  data!: EntryDto;
}

class EntryListMetaDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  totalPages!: number;
}

class EntryListResponseDto {
  @ApiProperty({ type: [EntryDto] })
  data!: EntryDto[];

  @ApiProperty({ type: EntryListMetaDto })
  meta!: EntryListMetaDto;
}

class EntryMessageDataDto {
  @ApiProperty()
  message!: string;
}

class EntryMessageResponseDto {
  @ApiProperty({ type: EntryMessageDataDto })
  data!: EntryMessageDataDto;
}

export { EntryDto, EntryListResponseDto, EntryMessageResponseDto, EntryResponseDto };
