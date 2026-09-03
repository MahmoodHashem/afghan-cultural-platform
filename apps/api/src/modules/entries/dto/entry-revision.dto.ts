import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

class ReplaceRevisionTagsDto {
  @ApiProperty({ type: [String], format: "uuid" })
  @IsArray()
  @ArrayUnique()
  @IsUUID("4", { each: true })
  tagIds!: string[];
}

class RevisionReasonDto {
  @ApiProperty({ minLength: 3, maxLength: 600 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(3)
  @MaxLength(600)
  reason!: string;
}

class ApproveRevisionDto {
  @ApiPropertyOptional({ maxLength: 600 })
  @IsOptional()
  @Transform(normalizeText)
  @IsString()
  @MaxLength(600)
  comments?: string;
}

class RevisionQueueQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 20;
}

export { ApproveRevisionDto, ReplaceRevisionTagsDto, RevisionQueueQueryDto, RevisionReasonDto };
