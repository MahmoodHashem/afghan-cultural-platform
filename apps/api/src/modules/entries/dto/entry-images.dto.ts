import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

function toOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function toBoolean(value: unknown): boolean | unknown {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === "true") {
      return true;
    }

    if (normalizedValue === "false") {
      return false;
    }
  }

  return value;
}

class UploadEntryImageDto {
  @ApiProperty({ maxLength: 220 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(220)
  altText!: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @Transform(({ value }) => toOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;

  @ApiPropertyOptional({ maxLength: 180 })
  @Transform(({ value }) => toOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(180)
  photographerOrSource?: string;

  @ApiProperty()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  permissionConfirmed!: boolean;

  @ApiPropertyOptional({ minimum: 0, maximum: 1_000_000 })
  @Transform(({ value }) => (value === undefined || value === "" ? undefined : Number(value)))
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  displayOrder?: number;
}

class UpdateEntryImageMetadataDto extends PartialType(UploadEntryImageDto) {}

class ReorderEntryImageItemDto {
  @ApiProperty()
  @IsUUID()
  id!: string;

  @ApiProperty({ minimum: 0, maximum: 1_000_000 })
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  displayOrder!: number;
}

class ReorderEntryImagesDto {
  @ApiProperty({ type: [ReorderEntryImageItemDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReorderEntryImageItemDto)
  items!: ReorderEntryImageItemDto[];
}

export { ReorderEntryImagesDto, UpdateEntryImageMetadataDto, UploadEntryImageDto };
