import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { EntryStatus, ModerationDecision } from "@/generated/prisma/enums";
import { ContentVersionDto } from "@/modules/entries/dto/entry-response.dto";

class ModerationAuthorDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  displayName!: string;
}

class ModerationTaxonomyDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;
}

class ModerationSubmissionDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional()
  slug!: string | null;

  @ApiProperty({ enum: EntryStatus })
  status!: EntryStatus;

  @ApiProperty()
  authorId!: string;

  @ApiProperty({ type: ModerationAuthorDto })
  author!: ModerationAuthorDto;

  @ApiProperty({ type: ModerationTaxonomyDto })
  province!: ModerationTaxonomyDto;

  @ApiProperty({ type: ModerationTaxonomyDto })
  category!: ModerationTaxonomyDto;

  @ApiProperty({ type: ModerationTaxonomyDto })
  contentType!: ModerationTaxonomyDto;

  @ApiPropertyOptional()
  submittedAt!: Date | null;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ type: ContentVersionDto, nullable: true })
  submittedVersion!: ContentVersionDto | null;
}

class ModerationSubmissionsMetaDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  totalPages!: number;
}

class ModerationSubmissionListResponseDto {
  @ApiProperty({ type: [ModerationSubmissionDto] })
  data!: ModerationSubmissionDto[];

  @ApiProperty({ type: ModerationSubmissionsMetaDto })
  meta!: ModerationSubmissionsMetaDto;
}

class ModerationSubmissionResponseDto {
  @ApiProperty({ type: ModerationSubmissionDto })
  data!: ModerationSubmissionDto;
}

class ModerationReviewDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  entryId!: string;

  @ApiProperty()
  moderatorId!: string;

  @ApiProperty({ enum: ModerationDecision })
  decision!: ModerationDecision;

  @ApiPropertyOptional()
  comments!: string | null;

  @ApiProperty({ enum: EntryStatus })
  previousStatus!: EntryStatus;

  @ApiProperty({ enum: EntryStatus })
  nextStatus!: EntryStatus;

  @ApiProperty()
  createdAt!: Date;
}

class ModerationDecisionEntryDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional()
  slug!: string | null;

  @ApiProperty({ enum: EntryStatus })
  status!: EntryStatus;

  @ApiPropertyOptional()
  publishedAt!: Date | null;
}

class ModerationDecisionDataDto {
  @ApiProperty({ type: ModerationDecisionEntryDto })
  entry!: ModerationDecisionEntryDto;

  @ApiProperty({ type: ModerationReviewDto })
  review!: ModerationReviewDto;

  @ApiProperty({ type: ContentVersionDto })
  contentVersion!: ContentVersionDto;
}

class ModerationDecisionResponseDto {
  @ApiProperty({ type: ModerationDecisionDataDto })
  data!: ModerationDecisionDataDto;
}

export {
  ModerationDecisionResponseDto,
  ModerationSubmissionListResponseDto,
  ModerationSubmissionResponseDto,
};
