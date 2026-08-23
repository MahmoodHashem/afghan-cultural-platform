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
  Query,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { RequireVerifiedEmail } from "@/modules/auth/decorators/require-verified-email.decorator";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import {
  ProfileBookmarksQueryDto,
  ProfileCommentsQueryDto,
} from "@/modules/profile/dto/profile-query.dto";
import {
  ProfileBookmarkStatusResponseDto,
  ProfileBookmarksResponseDto,
  ProfileCommentsResponseDto,
  ProfileResponseDto,
  ProfileStatsResponseDto,
} from "@/modules/profile/dto/profile-response.dto";
import { UpdateProfileDto } from "@/modules/profile/dto/update-profile.dto";
import { ProfileService } from "@/modules/profile/profile.service";

@ApiTags("Profile")
@ApiBearerAuth()
@ApiExtraModels(ProfileBookmarksQueryDto, ProfileCommentsQueryDto, UpdateProfileDto)
@Controller("profile/me")
class ProfileController {
  constructor(@Inject(ProfileService) private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({
    summary: "Get the current user's owner profile",
    description:
      "Returns safe profile fields for the authenticated owner profile page. Password hashes, token hashes, OAuth provider tokens, and private security fields are never returned.",
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.profileService.getMyProfile(user);
  }

  @Patch()
  @ApiOperation({
    summary: "Update the current user's safe profile fields",
    description:
      "Updates display name, biography, profile image URL, optional province, and cultural interests. Email, role, status, and security fields cannot be changed here.",
  })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiBadRequestResponse({
    description:
      "PROFILE_DISPLAY_NAME_INVALID, PROFILE_BIOGRAPHY_INVALID, PROFILE_PROVINCE_INVALID, PROFILE_CULTURAL_INTEREST_INVALID, or validation failed",
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  updateMyProfile(@CurrentUser() user: AuthenticatedUser, @Body() body: UpdateProfileDto) {
    return this.profileService.updateMyProfile(user, body);
  }

  @Get("stats")
  @ApiOperation({
    summary: "Get current-user profile stats",
    description:
      "Returns real owner counts for entries by status, comments, visible bookmarks, and contribution items needing attention.",
  })
  @ApiOkResponse({ type: ProfileStatsResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  getMyStats(@CurrentUser() user: AuthenticatedUser) {
    return this.profileService.getMyStats(user);
  }

  @Get("comments")
  @ApiOperation({
    summary: "List current-user comments",
    description:
      "Returns the authenticated user's comments and replies with safe entry summaries and pagination.",
  })
  @ApiOkResponse({ type: ProfileCommentsResponseDto })
  @ApiBadRequestResponse({ description: "Validation failed" })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  listMyComments(@CurrentUser() user: AuthenticatedUser, @Query() query: ProfileCommentsQueryDto) {
    return this.profileService.listMyComments(user, query);
  }

  @Get("bookmarks")
  @ApiOperation({
    summary: "List current-user bookmarks",
    description:
      "Returns bookmarks for entries that are still published. Drafts, hidden entries, archived entries, and unavailable entries are not exposed.",
  })
  @ApiOkResponse({ type: ProfileBookmarksResponseDto })
  @ApiBadRequestResponse({ description: "Validation failed" })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  listMyBookmarks(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ProfileBookmarksQueryDto,
  ) {
    return this.profileService.listMyBookmarks(user, query);
  }

  @Get("bookmarks/:entryId")
  @ApiOperation({ summary: "Get current user's bookmark status for one published entry" })
  @ApiOkResponse({ type: ProfileBookmarkStatusResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiNotFoundResponse({ description: "PROFILE_BOOKMARK_ENTRY_NOT_FOUND" })
  getMyBookmarkStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
  ) {
    return this.profileService.getMyBookmarkStatus(user, entryId);
  }

  @Put("bookmarks/:entryId")
  @RequireVerifiedEmail()
  @ApiOperation({
    summary: "Save one published entry to the current user's bookmarks",
    description: "Idempotent. The raw published entry is not duplicated.",
  })
  @ApiOkResponse({ type: ProfileBookmarkStatusResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "AUTH_EMAIL_VERIFICATION_REQUIRED" })
  @ApiNotFoundResponse({ description: "PROFILE_BOOKMARK_ENTRY_NOT_FOUND" })
  saveBookmark(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
  ) {
    return this.profileService.saveBookmark(user, entryId);
  }

  @Delete("bookmarks/:entryId")
  @RequireVerifiedEmail()
  @ApiOperation({
    summary: "Remove one entry from the current user's bookmarks",
    description: "Idempotent. Removing a missing bookmark still returns bookmarked=false.",
  })
  @ApiOkResponse({ type: ProfileBookmarkStatusResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "AUTH_EMAIL_VERIFICATION_REQUIRED" })
  @ApiNotFoundResponse({ description: "PROFILE_BOOKMARK_ENTRY_NOT_FOUND" })
  removeBookmark(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
  ) {
    return this.profileService.removeBookmark(user, entryId);
  }
}

export { ProfileController };
