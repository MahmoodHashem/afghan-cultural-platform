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

class LikeStateDto {
  @ApiProperty()
  entryId!: string;

  @ApiProperty()
  likeCount!: number;

  @ApiProperty()
  isLikedByCurrentUser!: boolean;
}

class LikeStateResponseDto {
  @ApiProperty({ type: LikeStateDto })
  data!: LikeStateDto;
}

class CommunityMessageResponseDto {
  @ApiProperty()
  data!: {
    message: string;
  };
}

export {
  CommunityMessageResponseDto,
  LikeStateResponseDto,
  PublicReviewDto,
  PublicReviewListResponseDto,
  PublicReviewResponseDto,
};
