import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";

class ReplaceRevisionTagsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID("4", { each: true })
  tagIds!: string[];
}

class RevisionReasonDto {
  @ApiProperty({ minLength: 3, maxLength: 1200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1200)
  reason!: string;
}

class ApproveRevisionDto {
  @ApiPropertyOptional({ maxLength: 1200 })
  @IsOptional()
  @IsString()
  @MaxLength(1200)
  comments?: string;
}

class RevisionQueueQueryDto {
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}

export { ApproveRevisionDto, ReplaceRevisionTagsDto, RevisionQueueQueryDto, RevisionReasonDto };
