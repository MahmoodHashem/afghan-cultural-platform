import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

class CreatePublicReviewDto {
  @ApiProperty({ minLength: 10, maxLength: 1200 })
  @IsString()
  @MinLength(10)
  @MaxLength(1200)
  body!: string;
}

class UpdatePublicReviewDto extends CreatePublicReviewDto {}

export { CreatePublicReviewDto, UpdatePublicReviewDto };
