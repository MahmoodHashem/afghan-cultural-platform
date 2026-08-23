import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { Public } from "@/modules/auth/decorators/public.decorator";
import { RequireVerifiedEmail } from "@/modules/auth/decorators/require-verified-email.decorator";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import { CommunityService } from "@/modules/community/community.service";
import type {
  CommentPaginationQueryDto,
  EntryCommentQueryDto,
} from "@/modules/community/dto/comment-query.dto";
import {
  CreateEntryCommentDto,
  UpdateEntryCommentDto,
} from "@/modules/community/dto/community-feedback.dto";
import {
  CommentInteractionStateResponseDto,
  CommentLikeStateResponseDto,
  CommunityMessageResponseDto,
  EntryCommentListResponseDto,
  EntryCommentResponseDto,
  LikeStateResponseDto,
} from "@/modules/community/dto/community-response.dto";

@ApiTags("Entry comments and engagement")
@Controller("entries/:entryId")
class CommunityController {
  constructor(@Inject(CommunityService) private readonly communityService: CommunityService) {}

  @Public()
  @Get("comments")
  @ApiOperation({ summary: "List root comments for a published entry" })
  @ApiOkResponse({ type: EntryCommentListResponseDto })
  @ApiNotFoundResponse({ description: "COMMUNITY_ENTRY_NOT_FOUND" })
  listComments(
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Query() query: EntryCommentQueryDto,
  ) {
    return this.communityService.listComments(entryId, query);
  }

  @Public()
  @Get("comments/:commentId/replies")
  @ApiOperation({ summary: "List direct replies to a comment, oldest first" })
  @ApiOkResponse({ type: EntryCommentListResponseDto })
  @ApiNotFoundResponse({ description: "COMMUNITY_ENTRY_NOT_FOUND or COMMENT_NOT_FOUND" })
  listReplies(
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Param("commentId", ParseUUIDPipe) commentId: string,
    @Query() query: CommentPaginationQueryDto,
  ) {
    return this.communityService.listReplies(entryId, commentId, query);
  }

  @Post("comments")
  @ApiBearerAuth()
  @RequireVerifiedEmail()
  @ApiOperation({ summary: "Create a root comment or reply on a published entry" })
  @ApiBody({ type: CreateEntryCommentDto })
  @ApiOkResponse({ type: EntryCommentResponseDto })
  @ApiBadRequestResponse({ description: "COMMENT_BODY_INVALID or COMMENT_PARENT_INVALID" })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "AUTH_EMAIL_VERIFICATION_REQUIRED" })
  @ApiNotFoundResponse({ description: "COMMUNITY_ENTRY_NOT_FOUND or COMMENT_PARENT_UNAVAILABLE" })
  createComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Body() body: CreateEntryCommentDto,
  ) {
    return this.communityService.createComment(user, entryId, body);
  }

  @Patch("comments/:commentId")
  @ApiBearerAuth()
  @RequireVerifiedEmail()
  @ApiOperation({ summary: "Edit one of the current user's active comments" })
  @ApiBody({ type: UpdateEntryCommentDto })
  @ApiOkResponse({ type: EntryCommentResponseDto })
  @ApiForbiddenResponse({ description: "COMMENT_NOT_OWNED or AUTH_EMAIL_VERIFICATION_REQUIRED" })
  @ApiNotFoundResponse({ description: "COMMUNITY_ENTRY_NOT_FOUND or COMMENT_NOT_FOUND" })
  updateComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Param("commentId", ParseUUIDPipe) commentId: string,
    @Body() body: UpdateEntryCommentDto,
  ) {
    return this.communityService.updateComment(user, entryId, commentId, body);
  }

  @Delete("comments/:commentId")
  @ApiBearerAuth()
  @RequireVerifiedEmail()
  @ApiOperation({ summary: "Soft-delete one of the current user's active comments" })
  @ApiOkResponse({ type: CommunityMessageResponseDto })
  @ApiForbiddenResponse({ description: "COMMENT_NOT_OWNED or AUTH_EMAIL_VERIFICATION_REQUIRED" })
  @ApiNotFoundResponse({ description: "COMMUNITY_ENTRY_NOT_FOUND or COMMENT_NOT_FOUND" })
  deleteComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Param("commentId", ParseUUIDPipe) commentId: string,
  ) {
    return this.communityService.deleteComment(user, entryId, commentId);
  }

  @Get("comment-interactions")
  @ApiBearerAuth()
  @RequireVerifiedEmail()
  @ApiOperation({ summary: "Get comment IDs liked by the current user for an entry" })
  @ApiOkResponse({ type: CommentInteractionStateResponseDto })
  getCommentInteractions(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
  ) {
    return this.communityService.getCommentInteractions(user, entryId);
  }

  @Put("comments/:commentId/like")
  @ApiBearerAuth()
  @RequireVerifiedEmail()
  @ApiOperation({ summary: "Like an active comment", description: "Idempotent." })
  @ApiOkResponse({ type: CommentLikeStateResponseDto })
  @ApiForbiddenResponse({
    description: "AUTH_EMAIL_VERIFICATION_REQUIRED or COMMENT_SELF_LIKE_FORBIDDEN",
  })
  likeComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Param("commentId", ParseUUIDPipe) commentId: string,
  ) {
    return this.communityService.likeComment(user, entryId, commentId);
  }

  @Delete("comments/:commentId/like")
  @ApiBearerAuth()
  @RequireVerifiedEmail()
  @ApiOperation({ summary: "Remove the current user's comment like", description: "Idempotent." })
  @ApiOkResponse({ type: CommentLikeStateResponseDto })
  unlikeComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Param("commentId", ParseUUIDPipe) commentId: string,
  ) {
    return this.communityService.unlikeComment(user, entryId, commentId);
  }

  @Get("like")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the current user's entry-like state" })
  @ApiOkResponse({ type: LikeStateResponseDto })
  getLikeState(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
  ) {
    return this.communityService.getLikeState(user, entryId);
  }

  @Put("like")
  @ApiBearerAuth()
  @RequireVerifiedEmail()
  @ApiOperation({ summary: "Like a published entry", description: "Idempotent." })
  @ApiOkResponse({ type: LikeStateResponseDto })
  likeEntry(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
  ) {
    return this.communityService.likeEntry(user, entryId);
  }

  @Delete("like")
  @ApiBearerAuth()
  @RequireVerifiedEmail()
  @ApiOperation({ summary: "Unlike a published entry", description: "Idempotent." })
  @ApiOkResponse({ type: LikeStateResponseDto })
  unlikeEntry(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
  ) {
    return this.communityService.unlikeEntry(user, entryId);
  }
}

export { CommunityController };
