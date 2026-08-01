import { ApiProperty, ApiPropertyOptional, PartialType, PickType } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

class UpsertEntryYouTubeVideoDto {
  @ApiProperty({ maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  url!: string;

  @ApiPropertyOptional({ maxLength: 220 })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  title?: string | null;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;
}

class UpdateEntryYouTubeVideoDto extends PartialType(
  PickType(UpsertEntryYouTubeVideoDto, ["title", "description"] as const),
) {}

export { UpdateEntryYouTubeVideoDto, UpsertEntryYouTubeVideoDto };
