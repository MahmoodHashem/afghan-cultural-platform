import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

class UpsertRatingDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  value!: number;
}

class CreatePublicReviewDto {
  @ApiProperty({ minLength: 10, maxLength: 1200 })
  @IsString()
  @MinLength(10)
  @MaxLength(1200)
  body!: string;
}

class UpdatePublicReviewDto extends CreatePublicReviewDto {}

export { CreatePublicReviewDto, UpdatePublicReviewDto, UpsertRatingDto };
