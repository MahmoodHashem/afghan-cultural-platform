import { ApiProperty } from "@nestjs/swagger";

import { AuditAction } from "@/generated/prisma/enums";

class AdminOverviewMetricDto {
  @ApiProperty({ example: 2901 })
  total!: number;

  @ApiProperty({ example: 42 })
  last30Days!: number;
}

class AdminOverviewStatsDto {
  @ApiProperty({ type: AdminOverviewMetricDto })
  users!: AdminOverviewMetricDto;

  @ApiProperty({ type: AdminOverviewMetricDto })
  publishedEntries!: AdminOverviewMetricDto;

  @ApiProperty({ example: 34 })
  pendingReview!: number;

  @ApiProperty({ example: 12 })
  openReports!: number;

  @ApiProperty({ example: 3 })
  staleReports!: number;
}

class AdminOverviewGrowthPointDto {
  @ApiProperty({ example: "2026-08-22" })
  date!: string;

  @ApiProperty({ example: 2901 })
  users!: number;

  @ApiProperty({ example: 1248 })
  publishedEntries!: number;
}

class AdminOverviewAttentionDto {
  @ApiProperty({ example: 34 })
  pendingSubmissions!: number;

  @ApiProperty({ example: 4 })
  pendingCorrections!: number;

  @ApiProperty({ example: 12 })
  openReports!: number;

  @ApiProperty({ example: 3 })
  staleReports!: number;
}

class AdminOverviewActorDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ example: "احمد رضایی" })
  displayName!: string;
}

class AdminOverviewEntryDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ example: "ارگ-هرات" })
  slug!: string;

  @ApiProperty({ example: "ارگ هرات" })
  title!: string;
}

class AdminOverviewActivityDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ enum: AuditAction })
  action!: AuditAction;

  @ApiProperty({ type: AdminOverviewActorDto, nullable: true })
  actor!: AdminOverviewActorDto | null;

  @ApiProperty({ type: AdminOverviewActorDto, nullable: true })
  targetUser!: AdminOverviewActorDto | null;

  @ApiProperty({ type: AdminOverviewEntryDto, nullable: true })
  entry!: AdminOverviewEntryDto | null;

  @ApiProperty({ example: "2026-08-22T08:30:00.000Z" })
  createdAt!: Date;
}

class AdminOverviewDataDto {
  @ApiProperty({ type: AdminOverviewStatsDto })
  stats!: AdminOverviewStatsDto;

  @ApiProperty({ type: [AdminOverviewGrowthPointDto] })
  growth!: AdminOverviewGrowthPointDto[];

  @ApiProperty({ type: AdminOverviewAttentionDto })
  attention!: AdminOverviewAttentionDto;

  @ApiProperty({ type: [AdminOverviewActivityDto] })
  recentActivity!: AdminOverviewActivityDto[];

  @ApiProperty({ example: "2026-08-22T08:30:00.000Z" })
  generatedAt!: Date;
}

class AdminOverviewResponseDto {
  @ApiProperty({ type: AdminOverviewDataDto })
  data!: AdminOverviewDataDto;
}

export {
  AdminOverviewActivityDto,
  AdminOverviewAttentionDto,
  AdminOverviewDataDto,
  AdminOverviewEntryDto,
  AdminOverviewGrowthPointDto,
  AdminOverviewMetricDto,
  AdminOverviewResponseDto,
  AdminOverviewStatsDto,
};
