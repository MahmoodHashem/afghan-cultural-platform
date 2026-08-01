import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { EntryStatus, SourceType } from "@/generated/prisma/enums";

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

class EntryTagDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;
}

class EntrySourceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: SourceType })
  type!: SourceType;

  @ApiPropertyOptional()
  title!: string | null;

  @ApiPropertyOptional()
  authorOrProvider!: string | null;

  @ApiPropertyOptional()
  publicationDate!: string | null;

  @ApiPropertyOptional()
  websiteUrl!: string | null;

  @ApiPropertyOptional()
  bookOrArticleDetails!: string | null;

  @ApiPropertyOptional()
  interviewDate!: Date | null;

  @ApiPropertyOptional()
  explanation!: string | null;

  @ApiProperty()
  displayOrder!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

class EntryImageDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  cloudinaryPublicId!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty()
  secureUrl!: string;

  @ApiPropertyOptional()
  thumbnailUrl!: string | null;

  @ApiPropertyOptional()
  width!: number | null;

  @ApiPropertyOptional()
  height!: number | null;

  @ApiPropertyOptional()
  format!: string | null;

  @ApiPropertyOptional()
  bytes!: number | null;

  @ApiPropertyOptional()
  caption!: string | null;

  @ApiProperty()
  altText!: string;

  @ApiPropertyOptional()
  photographerOrSource!: string | null;

  @ApiProperty()
  permissionConfirmed!: boolean;

  @ApiProperty()
  displayOrder!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

class EntryYouTubeVideoDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  videoId!: string;

  @ApiProperty()
  url!: string;

  @ApiPropertyOptional()
  title!: string | null;

  @ApiPropertyOptional()
  description!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
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

  @ApiProperty({ type: [EntryTagDto] })
  tags!: EntryTagDto[];

  @ApiProperty({ type: [EntrySourceDto] })
  sources!: EntrySourceDto[];

  @ApiProperty({ type: [EntryImageDto] })
  images!: EntryImageDto[];

  @ApiPropertyOptional({ type: EntryYouTubeVideoDto })
  youtubeVideo!: EntryYouTubeVideoDto | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

class EntryResponseDto {
  @ApiProperty({ type: EntryDto })
  data!: EntryDto;
}

class EntryTagsResponseDto {
  @ApiProperty({ type: [EntryTagDto] })
  data!: EntryTagDto[];
}

class EntrySourceResponseDto {
  @ApiProperty({ type: EntrySourceDto })
  data!: EntrySourceDto;
}

class EntrySourcesResponseDto {
  @ApiProperty({ type: [EntrySourceDto] })
  data!: EntrySourceDto[];
}

class EntryImageResponseDto {
  @ApiProperty({ type: EntryImageDto })
  data!: EntryImageDto;
}

class EntryImagesResponseDto {
  @ApiProperty({ type: [EntryImageDto] })
  data!: EntryImageDto[];
}

class EntryYouTubeVideoResponseDto {
  @ApiProperty({ type: EntryYouTubeVideoDto, nullable: true })
  data!: EntryYouTubeVideoDto | null;
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

export {
  EntryDto,
  EntryImageResponseDto,
  EntryImagesResponseDto,
  EntryListResponseDto,
  EntryMessageResponseDto,
  EntryResponseDto,
  EntrySourceResponseDto,
  EntrySourcesResponseDto,
  EntryTagsResponseDto,
  EntryYouTubeVideoResponseDto,
};
