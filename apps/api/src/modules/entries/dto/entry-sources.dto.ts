import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

import { SourceType } from "../../../generated/prisma/enums";

class CreateEntrySourceDto {
  @ApiProperty({ enum: SourceType })
  @IsEnum(SourceType)
  type!: SourceType;

  @ApiPropertyOptional({ maxLength: 220 })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  title?: string | null;

  @ApiPropertyOptional({ maxLength: 180 })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  authorOrProvider?: string | null;

  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  publicationDate?: string | null;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsUrl({
    protocols: ["http", "https"],
    require_protocol: true,
  })
  @MaxLength(500)
  websiteUrl?: string | null;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bookOrArticleDetails?: string | null;

  @ApiPropertyOptional({ format: "date-time" })
  @IsOptional()
  @IsISO8601()
  interviewDate?: string | null;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  explanation?: string | null;

  @ApiPropertyOptional({ minimum: 0, maximum: 1_000_000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  displayOrder?: number;
}

class UpdateEntrySourceDto extends PartialType(CreateEntrySourceDto) {}

class ReorderEntrySourceItemDto {
  @ApiProperty()
  @IsUUID()
  id!: string;

  @ApiProperty({ minimum: 0, maximum: 1_000_000 })
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  displayOrder!: number;
}

class ReorderEntrySourcesDto {
  @ApiProperty({ type: [ReorderEntrySourceItemDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReorderEntrySourceItemDto)
  items!: ReorderEntrySourceItemDto[];
}

export { CreateEntrySourceDto, ReorderEntrySourcesDto, UpdateEntrySourceDto };
