import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { EntryCommentStatus } from "@/generated/prisma/enums";

class CommentAuthorDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  displayName!: string;

  @ApiPropertyOptional({ nullable: true })
  profileImageUrl!: string | null;

  @ApiProperty()
  isEntryAuthor!: boolean;
}

class EntryCommentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  entryId!: string;

  @ApiPropertyOptional({ nullable: true })
  parentId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  body!: string | null;

  @ApiProperty({ enum: EntryCommentStatus })
  status!: EntryCommentStatus;

  @ApiPropertyOptional({ type: CommentAuthorDto, nullable: true })
  author!: CommentAuthorDto | null;

  @ApiProperty()
  likeCount!: number;

  @ApiProperty()
  directReplyCount!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

class CommentPaginationMetaDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  totalPages!: number;
}

class EntryCommentListResponseDto {
  @ApiProperty({ type: [EntryCommentDto] })
  data!: EntryCommentDto[];

  @ApiProperty({ type: CommentPaginationMetaDto })
  meta!: CommentPaginationMetaDto;

  @ApiProperty({ description: "All active root comments and replies on the entry" })
  commentCount!: number;
}

class EntryCommentResponseDto {
  @ApiProperty({ type: EntryCommentDto })
  data!: EntryCommentDto;
}

class CommentInteractionStateResponseDto {
  @ApiProperty({
    example: { entryId: "uuid", likedCommentIds: ["uuid"] },
  })
  data!: { entryId: string; likedCommentIds: string[] };
}

class CommentLikeStateResponseDto {
  @ApiProperty({
    example: { commentId: "uuid", likeCount: 4, isLikedByCurrentUser: true },
  })
  data!: { commentId: string; likeCount: number; isLikedByCurrentUser: boolean };
}

class LikeStateResponseDto {
  @ApiProperty({
    example: { entryId: "uuid", likeCount: 12, isLikedByCurrentUser: true },
  })
  data!: { entryId: string; likeCount: number; isLikedByCurrentUser: boolean };
}

class CommunityMessageResponseDto {
  @ApiProperty()
  data!: { message: string };
}

export {
  CommentInteractionStateResponseDto,
  CommentLikeStateResponseDto,
  CommunityMessageResponseDto,
  EntryCommentDto,
  EntryCommentListResponseDto,
  EntryCommentResponseDto,
  LikeStateResponseDto,
};
