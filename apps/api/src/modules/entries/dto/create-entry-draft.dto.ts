import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";

class CreateEntryDraftDto {
  @ApiProperty({ minLength: 2, maxLength: 180 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(180)
  title!: string;

  @ApiProperty({ minLength: 10, maxLength: 700 })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(700)
  summary!: string;

  @ApiProperty({
    description: "Tiptap JSON document using the approved v1 editor schema.",
    type: Object,
  })
  @IsObject()
  contentJson!: Record<string, unknown>;

  @ApiProperty()
  @IsUUID()
  provinceId!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  districtId?: string | null;

  @ApiProperty()
  @IsUUID()
  categoryId!: string;

  @ApiProperty()
  @IsUUID()
  contentTypeId!: string;

  @ApiPropertyOptional({ maxLength: 220, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  villageOrLocation?: string | null;
}

class UpdateEntryDraftDto extends PartialType(CreateEntryDraftDto) {}

export { CreateEntryDraftDto, UpdateEntryDraftDto };
