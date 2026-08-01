import { ApiProperty } from "@nestjs/swagger";
import { ArrayMaxSize, IsArray, IsUUID } from "class-validator";

class EntryTagsDto {
  @ApiProperty({
    description: "Existing active tag IDs to assign to the entry.",
    type: [String],
  })
  @IsArray()
  @ArrayMaxSize(50)
  @IsUUID("4", { each: true })
  tagIds!: string[];
}

export { EntryTagsDto };
