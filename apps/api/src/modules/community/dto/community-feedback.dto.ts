import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

class CreateEntryCommentDto {
  @ApiProperty({ minLength: 1, maxLength: 1000 })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  body!: string;

  @ApiPropertyOptional({ format: "uuid", description: "Parent comment for a reply" })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

class UpdateEntryCommentDto {
  @ApiProperty({ minLength: 1, maxLength: 1000 })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  body!: string;
}

export { CreateEntryCommentDto, UpdateEntryCommentDto };
