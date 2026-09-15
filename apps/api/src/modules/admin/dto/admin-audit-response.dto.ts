import { ApiProperty } from "@nestjs/swagger";

import {
  AuditAction,
  CorrectionStatus,
  EntryRevisionStatus,
  ReportReason,
  ReportStatus,
  UserRole,
} from "../../../generated/prisma/enums";

class AdminAuditPersonDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty() displayName!: string;
  @ApiProperty({ enum: UserRole }) role!: UserRole;
  @ApiProperty({ nullable: true }) profileImageUrl!: string | null;
}

class AdminAuditEntryDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty() title!: string;
  @ApiProperty({ nullable: true }) slug!: string | null;
}

class AdminAuditReportDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty({ enum: ReportReason }) reason!: ReportReason;
  @ApiProperty({ enum: ReportStatus }) status!: ReportStatus;
}

class AdminAuditCorrectionDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty({ example: "TITLE" }) section!: string;
  @ApiProperty({ enum: CorrectionStatus }) status!: CorrectionStatus;
}

class AdminAuditRevisionDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty({ enum: EntryRevisionStatus }) status!: EntryRevisionStatus;
}

class AdminAuditItemDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty({ enum: AuditAction }) action!: AuditAction;
  @ApiProperty({ type: AdminAuditPersonDto, nullable: true }) actor!: AdminAuditPersonDto | null;
  @ApiProperty({ type: AdminAuditPersonDto, nullable: true })
  targetUser!: AdminAuditPersonDto | null;
  @ApiProperty({ type: AdminAuditEntryDto, nullable: true }) entry!: AdminAuditEntryDto | null;
  @ApiProperty({ type: AdminAuditReportDto, nullable: true }) report!: AdminAuditReportDto | null;
  @ApiProperty({ type: AdminAuditCorrectionDto, nullable: true })
  correctionSuggestion!: AdminAuditCorrectionDto | null;
  @ApiProperty({ type: AdminAuditRevisionDto, nullable: true })
  entryRevision!: AdminAuditRevisionDto | null;
  @ApiProperty({ type: Object, nullable: true, additionalProperties: true }) metadata!: Record<
    string,
    string | number | boolean | null
  > | null;
  @ApiProperty() createdAt!: Date;
}

class AdminAuditMetaDto {
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() total!: number;
  @ApiProperty() totalPages!: number;
}

class AdminAuditResponseDto {
  @ApiProperty({ type: [AdminAuditItemDto] }) data!: AdminAuditItemDto[];
  @ApiProperty({ type: AdminAuditMetaDto }) meta!: AdminAuditMetaDto;
}

export { AdminAuditItemDto, AdminAuditResponseDto };
