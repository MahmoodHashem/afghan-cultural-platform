import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

import {
  AuditAction,
  CorrectionStatus,
  ReportReason,
  ReportResolutionAction,
  ReportStatus,
} from "@/generated/prisma/enums";

const CORRECTION_SECTIONS = ["TITLE", "SUMMARY", "CONTENT"] as const;
const REPORT_TARGET_TYPES = ["ENTRY", "COMMENT"] as const;
const REPORT_RESOLUTION_ACTIONS = [
  ReportResolutionAction.DISMISS,
  ReportResolutionAction.HIDE_CONTENT,
  ReportResolutionAction.HIDE_COMMENT,
  ReportResolutionAction.ARCHIVE_CONTENT,
] as const;

class PaginationQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

class SubmitCorrectionDto {
  @ApiProperty({ enum: CORRECTION_SECTIONS })
  @IsIn(CORRECTION_SECTIONS)
  section!: (typeof CORRECTION_SECTIONS)[number];

  @ApiProperty({ minLength: 1, maxLength: 20_000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20_000)
  proposedCorrection!: string;

  @ApiProperty({ minLength: 10, maxLength: 1200 })
  @IsString()
  @MinLength(10)
  @MaxLength(1200)
  reason!: string;

  @ApiPropertyOptional({ maxLength: 3000 })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  sourceText?: string;
}

class CorrectionQueueQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: CorrectionStatus, default: CorrectionStatus.PENDING })
  @IsOptional()
  @IsEnum(CorrectionStatus)
  status?: CorrectionStatus = CorrectionStatus.PENDING;
}

class CorrectionDecisionDto {
  @ApiPropertyOptional({ maxLength: 1200 })
  @IsOptional()
  @IsString()
  @MaxLength(1200)
  comments?: string;
}

class CorrectionRejectionDto {
  @ApiProperty({ minLength: 3, maxLength: 1200 })
  @IsString()
  @MinLength(3)
  @MaxLength(1200)
  reason!: string;
}

class SubmitReportDto {
  @ApiProperty({ enum: ReportReason })
  @IsEnum(ReportReason)
  reason!: ReportReason;

  @ApiProperty({ minLength: 10, maxLength: 2000 })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  explanation!: string;
}

class ReportQueueQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ReportStatus })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({ enum: ReportReason })
  @IsOptional()
  @IsEnum(ReportReason)
  reason?: ReportReason;

  @ApiPropertyOptional({ enum: REPORT_TARGET_TYPES })
  @IsOptional()
  @IsIn(REPORT_TARGET_TYPES)
  targetType?: (typeof REPORT_TARGET_TYPES)[number];
}

class ResolveReportDto {
  @ApiProperty({ enum: REPORT_RESOLUTION_ACTIONS })
  @IsIn(REPORT_RESOLUTION_ACTIONS)
  resolutionAction!: (typeof REPORT_RESOLUTION_ACTIONS)[number];

  @ApiProperty({ minLength: 3, maxLength: 1200 })
  @IsString()
  @MinLength(3)
  @MaxLength(1200)
  notes!: string;
}

class ModerationHistoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: AuditAction })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  entryId?: string;
}

export {
  CORRECTION_SECTIONS,
  CorrectionDecisionDto,
  CorrectionQueueQueryDto,
  CorrectionRejectionDto,
  ModerationHistoryQueryDto,
  REPORT_RESOLUTION_ACTIONS,
  REPORT_TARGET_TYPES,
  ReportQueueQueryDto,
  ResolveReportDto,
  SubmitCorrectionDto,
  SubmitReportDto,
};
