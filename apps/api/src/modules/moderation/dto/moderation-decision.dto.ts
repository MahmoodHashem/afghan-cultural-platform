import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

class ApproveSubmissionDto {
  @ApiPropertyOptional({ maxLength: 1200 })
  @IsOptional()
  @IsString()
  @MaxLength(1200)
  comments?: string;
}

class ModerationReasonDto {
  @ApiProperty({ maxLength: 1200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1200)
  reason!: string;
}

export { ApproveSubmissionDto, ModerationReasonDto };
