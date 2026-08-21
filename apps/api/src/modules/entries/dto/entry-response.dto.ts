import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import {
  EntryStatus,
  GeographicScope,
  ModerationDecision,
  SourceType,
  VersionReason,
} from "@/generated/prisma/enums";

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

class EntryModerationFeedbackDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ModerationDecision })
  decision!: ModerationDecision;

  @ApiPropertyOptional({ nullable: true })
  comments!: string | null;

  @ApiProperty({ enum: EntryStatus })
  previousStatus!: EntryStatus;

  @ApiProperty({ enum: EntryStatus })
  nextStatus!: EntryStatus;

  @ApiProperty({ type: EntryAuthorDto })
  moderator!: EntryAuthorDto;

  @ApiProperty()
  createdAt!: Date;
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

class EntryReferenceTargetDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string | null;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  summary!: string;

  @ApiProperty()
  publishedAt!: Date | null;
}

class EntryReferenceSourceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string | null;

  @ApiProperty()
  title!: string;
}

class EntryReferenceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  sourceEntryId!: string;

  @ApiProperty()
  targetEntryId!: string;

  @ApiProperty()
  anchorText!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiPropertyOptional({ type: EntryReferenceSourceDto })
  sourceEntry?: EntryReferenceSourceDto;

  @ApiPropertyOptional({ type: EntryReferenceTargetDto })
  targetEntry?: EntryReferenceTargetDto;
}

class PublicEntryAuthorDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  displayName!: string;

  @ApiPropertyOptional()
  profileImageUrl!: string | null;
}

class PublicEntryImageDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  secureUrl!: string;

  @ApiPropertyOptional()
  thumbnailUrl!: string | null;

  @ApiPropertyOptional()
  width!: number | null;

  @ApiPropertyOptional()
  height!: number | null;

  @ApiPropertyOptional()
  caption!: string | null;

  @ApiProperty()
  altText!: string;

  @ApiPropertyOptional()
  photographerOrSource!: string | null;

  @ApiProperty()
  displayOrder!: number;
}

class PublicEntrySourceDto {
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
}

class PublicEntryYouTubeVideoDto {
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
}

class PublicEntryOutgoingReferenceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  targetEntryId!: string;

  @ApiProperty()
  anchorText!: string;

  @ApiProperty({ type: EntryReferenceSourceDto })
  targetEntry!: EntryReferenceSourceDto;
}

class PublicEntryIncomingReferenceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  sourceEntryId!: string;

  @ApiProperty()
  anchorText!: string;

  @ApiProperty({ type: EntryReferenceTargetDto })
  sourceEntry!: EntryReferenceTargetDto;
}

class PublicEntrySeoDto {
  @ApiProperty()
  title!: string;

  @ApiProperty()
  summary!: string;

  @ApiProperty()
  canonicalSlug!: string;

  @ApiPropertyOptional()
  image!: string | null;

  @ApiProperty()
  author!: string;

  @ApiProperty()
  publishedAt!: Date;

  @ApiProperty()
  modifiedAt!: Date;

  @ApiProperty({ type: [EntryTaxonomyDto] })
  taxonomy!: EntryTaxonomyDto[];

  @ApiProperty()
  plainTextExcerpt!: string;
}

class PublicEntryCardDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  summary!: string;

  @ApiPropertyOptional({ type: PublicEntryImageDto, nullable: true })
  coverImage!: PublicEntryImageDto | null;

  @ApiProperty({ enum: GeographicScope })
  geographicScope!: GeographicScope;

  @ApiPropertyOptional({ type: EntryTaxonomyDto, nullable: true })
  province!: EntryTaxonomyDto | null;

  @ApiProperty({ type: EntryTaxonomyDto })
  category!: EntryTaxonomyDto;

  @ApiProperty({ type: EntryTaxonomyDto })
  contentType!: EntryTaxonomyDto;

  @ApiProperty({ type: [EntryTagDto] })
  tags!: EntryTagDto[];

  @ApiProperty({ type: PublicEntryAuthorDto })
  author!: PublicEntryAuthorDto;

  @ApiProperty()
  publishedAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty()
  averageRating!: number;

  @ApiProperty()
  ratingCount!: number;

  @ApiProperty()
  likeCount!: number;
}

class PublicEntryDetailDto extends PublicEntryCardDto {
  @ApiProperty({ type: Object })
  contentJson!: unknown;

  @ApiProperty()
  plainTextContent!: string;

  @ApiPropertyOptional({ type: EntryTaxonomyDto, nullable: true })
  district!: EntryTaxonomyDto | null;

  @ApiPropertyOptional()
  villageOrLocation!: string | null;

  @ApiProperty({ type: [PublicEntryImageDto] })
  images!: PublicEntryImageDto[];

  @ApiProperty({ type: [PublicEntrySourceDto] })
  sources!: PublicEntrySourceDto[];

  @ApiPropertyOptional({ type: PublicEntryYouTubeVideoDto, nullable: true })
  youtubeVideo!: PublicEntryYouTubeVideoDto | null;

  @ApiProperty({ type: [PublicEntryOutgoingReferenceDto] })
  outgoingReferences!: PublicEntryOutgoingReferenceDto[];

  @ApiProperty({ type: [PublicEntryIncomingReferenceDto] })
  incomingReferences!: PublicEntryIncomingReferenceDto[];

  @ApiProperty({ type: PublicEntrySeoDto })
  seo!: PublicEntrySeoDto;
}

class ContentVersionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  entryId!: string;

  @ApiProperty()
  versionNumber!: number;

  @ApiProperty({ type: Object })
  snapshot!: unknown;

  @ApiProperty()
  plainTextContent!: string;

  @ApiProperty({ enum: VersionReason })
  versionReason!: VersionReason;

  @ApiPropertyOptional()
  createdById!: string | null;

  @ApiPropertyOptional()
  correctionSuggestionId!: string | null;

  @ApiPropertyOptional()
  moderationReviewId!: string | null;

  @ApiProperty()
  createdAt!: Date;
}

class EntryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  key!: string;

  @ApiProperty()
  slug!: string;

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

  @ApiProperty({ enum: GeographicScope })
  geographicScope!: GeographicScope;

  @ApiProperty()
  authorId!: string;

  @ApiPropertyOptional({ nullable: true })
  provinceId!: string | null;

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

  @ApiPropertyOptional({ type: EntryTaxonomyDto, nullable: true })
  province!: EntryTaxonomyDto | null;

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

  @ApiPropertyOptional({ type: EntryModerationFeedbackDto, nullable: true })
  latestModerationReview!: EntryModerationFeedbackDto | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

class EntryResponseDto {
  @ApiProperty({ type: EntryDto })
  data!: EntryDto;
}

class EntrySubmissionDataDto {
  @ApiProperty({ type: EntryDto })
  entry!: EntryDto;

  @ApiProperty({ type: ContentVersionDto })
  contentVersion!: ContentVersionDto;
}

class EntrySubmissionResponseDto {
  @ApiProperty({ type: EntrySubmissionDataDto })
  data!: EntrySubmissionDataDto;
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

class EntryReferenceSearchResponseDto {
  @ApiProperty({ type: [EntryReferenceTargetDto] })
  data!: EntryReferenceTargetDto[];
}

class EntryReferenceValidationResponseDto {
  @ApiProperty({ type: EntryReferenceTargetDto })
  data!: EntryReferenceTargetDto;
}

class EntryReferencesResponseDto {
  @ApiProperty({ type: [EntryReferenceDto] })
  data!: EntryReferenceDto[];
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

class PublicEntryListResponseDto {
  @ApiProperty({ type: [PublicEntryCardDto] })
  data!: PublicEntryCardDto[];

  @ApiProperty({ type: EntryListMetaDto })
  meta!: EntryListMetaDto;
}

class PublicEntryResponseDto {
  @ApiProperty({ type: PublicEntryDetailDto })
  data!: PublicEntryDetailDto;
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
  ContentVersionDto,
  EntryDto,
  EntryImageResponseDto,
  EntryImagesResponseDto,
  EntryListResponseDto,
  EntryMessageResponseDto,
  EntryReferenceSearchResponseDto,
  EntryReferencesResponseDto,
  EntryReferenceValidationResponseDto,
  EntryResponseDto,
  EntrySourceResponseDto,
  EntrySourcesResponseDto,
  EntrySubmissionResponseDto,
  EntryTagsResponseDto,
  EntryYouTubeVideoResponseDto,
  PublicEntryListResponseDto,
  PublicEntryResponseDto,
};
