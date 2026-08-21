import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Put,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
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
import {
  CreatePublicReviewDto,
  UpdatePublicReviewDto,
  UpsertRatingDto,
} from "@/modules/community/dto/community-feedback.dto";
import {
  CommunityMessageResponseDto,
  LikeStateResponseDto,
  PublicReviewListResponseDto,
  PublicReviewResponseDto,
  RatingResponseDto,
} from "@/modules/community/dto/community-response.dto";

@ApiTags("Community feedback")
@Controller("entries/:entryId")
class CommunityController {
  constructor(@Inject(CommunityService) private readonly communityService: CommunityService) {}

  @Public()
  @Get("reviews")
  @ApiOperation({ summary: "List active public reviews for a published entry" })
  @ApiOkResponse({ type: PublicReviewListResponseDto })
  @ApiNotFoundResponse({ description: "COMMUNITY_ENTRY_NOT_FOUND" })
  listPublicReviews(@Param("entryId", ParseUUIDPipe) entryId: string) {
    return this.communityService.listPublicReviews(entryId);
  }

  @Get("like")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the current user's like state for a published entry" })
  @ApiOkResponse({ type: LikeStateResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiNotFoundResponse({ description: "COMMUNITY_ENTRY_NOT_FOUND" })
  getLikeState(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
  ) {
    return this.communityService.getLikeState(user, entryId);
  }

  @Put("like")
  @ApiBearerAuth()
  @RequireVerifiedEmail()
  @ApiOperation({
    summary: "Like a published entry",
    description: "Idempotent. Repeating the request does not create another like.",
  })
  @ApiOkResponse({ type: LikeStateResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "AUTH_EMAIL_VERIFICATION_REQUIRED" })
  @ApiNotFoundResponse({ description: "COMMUNITY_ENTRY_NOT_FOUND" })
  likeEntry(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
  ) {
    return this.communityService.likeEntry(user, entryId);
  }

  @Delete("like")
  @ApiBearerAuth()
  @RequireVerifiedEmail()
  @ApiOperation({
    summary: "Unlike a published entry",
    description: "Idempotent. Removing an absent like still returns an unliked state.",
  })
  @ApiOkResponse({ type: LikeStateResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "AUTH_EMAIL_VERIFICATION_REQUIRED" })
  @ApiNotFoundResponse({ description: "COMMUNITY_ENTRY_NOT_FOUND" })
  unlikeEntry(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
  ) {
    return this.communityService.unlikeEntry(user, entryId);
  }

  @Patch("reviews/me")
  @ApiBearerAuth()
  @RequireVerifiedEmail()
  @ApiOperation({ summary: "Update the current user's active public review" })
  @ApiBody({ type: UpdatePublicReviewDto })
  @ApiOkResponse({ type: PublicReviewResponseDto })
  @ApiBadRequestResponse({ description: "COMMUNITY_REVIEW_BODY_INVALID or validation failed" })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "AUTH_EMAIL_VERIFICATION_REQUIRED" })
  @ApiNotFoundResponse({ description: "COMMUNITY_ENTRY_NOT_FOUND or COMMUNITY_REVIEW_NOT_FOUND" })
  updateOwnPublicReview(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Body() body: UpdatePublicReviewDto,
  ) {
    return this.communityService.updateOwnPublicReview(user, entryId, body);
  }

  @Put("reviews")
  @ApiBearerAuth()
  @RequireVerifiedEmail()
  @ApiOperation({ summary: "Create a public review for a published entry" })
  @ApiBody({ type: CreatePublicReviewDto })
  @ApiOkResponse({ type: PublicReviewResponseDto })
  @ApiBadRequestResponse({ description: "COMMUNITY_REVIEW_BODY_INVALID or validation failed" })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "AUTH_EMAIL_VERIFICATION_REQUIRED" })
  @ApiConflictResponse({ description: "COMMUNITY_REVIEW_ALREADY_EXISTS" })
  @ApiNotFoundResponse({ description: "COMMUNITY_ENTRY_NOT_FOUND" })
  createPublicReview(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Body() body: CreatePublicReviewDto,
  ) {
    return this.communityService.createPublicReview(user, entryId, body);
  }

  @Delete("reviews/me")
  @ApiBearerAuth()
  @RequireVerifiedEmail()
  @ApiOperation({ summary: "Delete the current user's active public review" })
  @ApiOkResponse({ type: CommunityMessageResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "AUTH_EMAIL_VERIFICATION_REQUIRED" })
  @ApiNotFoundResponse({ description: "COMMUNITY_ENTRY_NOT_FOUND or COMMUNITY_REVIEW_NOT_FOUND" })
  deleteOwnPublicReview(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
  ) {
    return this.communityService.deleteOwnPublicReview(user, entryId);
  }

  @Put("rating")
  @ApiBearerAuth()
  @RequireVerifiedEmail()
  @ApiOperation({ summary: "Set or update the current user's helpfulness rating" })
  @ApiBody({ type: UpsertRatingDto })
  @ApiOkResponse({ type: RatingResponseDto })
  @ApiBadRequestResponse({ description: "COMMUNITY_RATING_INVALID or validation failed" })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "AUTH_EMAIL_VERIFICATION_REQUIRED" })
  @ApiNotFoundResponse({ description: "COMMUNITY_ENTRY_NOT_FOUND" })
  upsertRating(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Body() body: UpsertRatingDto,
  ) {
    return this.communityService.upsertRating(user, entryId, body);
  }

  @Delete("rating")
  @ApiBearerAuth()
  @RequireVerifiedEmail()
  @ApiOperation({ summary: "Remove the current user's helpfulness rating" })
  @ApiOkResponse({ type: CommunityMessageResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "AUTH_EMAIL_VERIFICATION_REQUIRED" })
  @ApiNotFoundResponse({ description: "COMMUNITY_ENTRY_NOT_FOUND" })
  removeRating(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
  ) {
    return this.communityService.removeRating(user, entryId);
  }
}

export { CommunityController };
