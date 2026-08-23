import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsInt, IsOptional, Max, Min } from "class-validator";

const COMMENT_SORT_VALUES = ["newest", "oldest", "mostLiked"] as const;

class CommentPaginationQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 10 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

class EntryCommentQueryDto extends CommentPaginationQueryDto {
  @ApiPropertyOptional({ enum: COMMENT_SORT_VALUES, default: "newest" })
  @IsOptional()
  @IsIn(COMMENT_SORT_VALUES)
  sort?: (typeof COMMENT_SORT_VALUES)[number] = "newest";
}

export { COMMENT_SORT_VALUES, CommentPaginationQueryDto, EntryCommentQueryDto };
