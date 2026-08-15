import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class ReviewAuthorDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  displayName!: string;

  @ApiPropertyOptional()
  profileImageUrl!: string | null;
}

class PublicReviewDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  entryId!: string;

  @ApiProperty()
  body!: string;

  @ApiProperty({ type: ReviewAuthorDto })
  author!: ReviewAuthorDto;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

class PublicReviewListResponseDto {
  @ApiProperty({ type: [PublicReviewDto] })
  data!: PublicReviewDto[];
}

class PublicReviewResponseDto {
  @ApiProperty({ type: PublicReviewDto })
  data!: PublicReviewDto;
}

class RatingDto {
  @ApiProperty()
  entryId!: string;

  @ApiProperty()
  value!: number;

  @ApiProperty()
  averageRating!: number;

  @ApiProperty()
  ratingCount!: number;
}

class RatingResponseDto {
  @ApiProperty({ type: RatingDto })
  data!: RatingDto;
}

class CommunityMessageResponseDto {
  @ApiProperty()
  data!: {
    message: string;
  };
}

export {
  CommunityMessageResponseDto,
  PublicReviewDto,
  PublicReviewListResponseDto,
  PublicReviewResponseDto,
  RatingResponseDto,
};
