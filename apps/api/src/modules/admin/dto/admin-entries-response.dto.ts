import { ApiProperty } from "@nestjs/swagger";

import {
  EntryStatus,
  GeographicScope,
  ModerationDecision,
  VersionReason,
} from "@/generated/prisma/enums";

class AdminEntryPaginationMetaDto {
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() total!: number;
  @ApiProperty() totalPages!: number;
}

class AdminEntryStatusCountDto {
  @ApiProperty({ enum: EntryStatus }) status!: EntryStatus;
  @ApiProperty() count!: number;
}

class AdminEntryTaxonomyDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
}

class AdminEntryAuthorDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty() displayName!: string;
  @ApiProperty() email!: string;
  @ApiProperty({ nullable: true }) profileImageUrl!: string | null;
}

class AdminEntryCountsDto {
  @ApiProperty() likes!: number;
  @ApiProperty() bookmarks!: number;
  @ApiProperty() reviews!: number;
  @ApiProperty() openReports!: number;
}

class AdminEntryListItemDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() title!: string;
  @ApiProperty() summary!: string;
  @ApiProperty({ enum: EntryStatus }) status!: EntryStatus;
  @ApiProperty({ enum: GeographicScope }) geographicScope!: GeographicScope;
  @ApiProperty({ nullable: true }) thumbnailUrl!: string | null;
  @ApiProperty({ type: AdminEntryAuthorDto }) author!: AdminEntryAuthorDto;
  @ApiProperty({ type: AdminEntryTaxonomyDto, nullable: true })
  province!: AdminEntryTaxonomyDto | null;
  @ApiProperty({ type: AdminEntryTaxonomyDto }) category!: AdminEntryTaxonomyDto;
  @ApiProperty({ type: AdminEntryTaxonomyDto }) contentType!: AdminEntryTaxonomyDto;
  @ApiProperty() viewCount!: number;
  @ApiProperty({ type: AdminEntryCountsDto }) counts!: AdminEntryCountsDto;
  @ApiProperty({ nullable: true }) submittedAt!: Date | null;
  @ApiProperty({ nullable: true }) publishedAt!: Date | null;
  @ApiProperty({ nullable: true }) archivedAt!: Date | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

class AdminEntriesResponseDto {
  @ApiProperty({ type: [AdminEntryListItemDto] }) data!: AdminEntryListItemDto[];
  @ApiProperty({ type: AdminEntryPaginationMetaDto }) meta!: AdminEntryPaginationMetaDto;
  @ApiProperty({ type: [AdminEntryStatusCountDto] }) statusCounts!: AdminEntryStatusCountDto[];
}

class AdminEntryVersionSummaryDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty() versionNumber!: number;
  @ApiProperty({ enum: VersionReason }) versionReason!: VersionReason;
  @ApiProperty({ nullable: true }) creator!: { id: string; displayName: string } | null;
  @ApiProperty() createdAt!: Date;
}

class AdminEntryModerationHistoryDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty({ enum: ModerationDecision }) decision!: ModerationDecision;
  @ApiProperty({ nullable: true }) comments!: string | null;
  @ApiProperty({ enum: EntryStatus }) previousStatus!: EntryStatus;
  @ApiProperty({ enum: EntryStatus }) nextStatus!: EntryStatus;
  @ApiProperty() moderator!: { id: string; displayName: string };
  @ApiProperty() createdAt!: Date;
}

class AdminEntryDetailResponseDto {
  @ApiProperty({ type: Object }) data!: Record<string, unknown>;
}

class AdminEntryLifecycleResponseDto {
  @ApiProperty({ type: Object }) data!: Record<string, unknown>;
}

export {
  AdminEntriesResponseDto,
  AdminEntryDetailResponseDto,
  AdminEntryLifecycleResponseDto,
  AdminEntryModerationHistoryDto,
  AdminEntryVersionSummaryDto,
};
