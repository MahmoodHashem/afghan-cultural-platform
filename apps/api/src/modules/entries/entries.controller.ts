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
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { memoryStorage } from "multer";

import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequireVerifiedEmail } from "../auth/decorators/require-verified-email.decorator";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { CreateEntryDraftDto, UpdateEntryDraftDto } from "./dto/create-entry-draft.dto";
import {
  ReorderEntryImagesDto,
  UpdateEntryImageMetadataDto,
  UploadEntryImageDto,
} from "./dto/entry-images.dto";
import { OwnEntriesQueryDto } from "./dto/entry-query.dto";
import { EntryReferenceSearchQueryDto } from "./dto/entry-references.dto";
import {
  EntryImageResponseDto,
  EntryImagesResponseDto,
  EntryListResponseDto,
  EntryMessageResponseDto,
  EntryReferenceSearchResponseDto,
  EntryReferencesResponseDto,
  EntryReferenceValidationResponseDto,
  EntryResponseDto,
  EntrySourceResponseDto,
  EntrySourcesResponseDto,
  EntrySubmissionResponseDto,
  EntryTagsResponseDto,
  EntryYouTubeVideoResponseDto,
} from "./dto/entry-response.dto";
import {
  CreateEntrySourceDto,
  ReorderEntrySourcesDto,
  UpdateEntrySourceDto,
} from "./dto/entry-sources.dto";
import { EntryTagsDto } from "./dto/entry-tags.dto";
import {
  UpdateEntryYouTubeVideoDto,
  UpsertEntryYouTubeVideoDto,
  YouTubeMetadataRequestDto,
  YouTubeMetadataResponseDto,
} from "./dto/entry-youtube.dto";
import { EntriesService } from "./entries.service";
import { YouTubeMetadataService } from "./youtube-metadata.service";

@ApiTags("Entries")
@ApiBearerAuth()
@ApiExtraModels(
  CreateEntryDraftDto,
  CreateEntrySourceDto,
  EntryReferenceSearchQueryDto,
  EntryTagsDto,
  OwnEntriesQueryDto,
  ReorderEntryImagesDto,
  ReorderEntrySourcesDto,
  UpdateEntryDraftDto,
  UpdateEntryImageMetadataDto,
  UpdateEntrySourceDto,
  UpdateEntryYouTubeVideoDto,
  UploadEntryImageDto,
  UpsertEntryYouTubeVideoDto,
  YouTubeMetadataRequestDto,
)
@RequireVerifiedEmail()
@Controller()
class EntriesController {
  constructor(
    @Inject(EntriesService) private readonly entriesService: EntriesService,
    @Inject(YouTubeMetadataService)
    private readonly youtubeMetadataService: YouTubeMetadataService,
  ) {}

  @Post("entries/youtube-metadata")
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({
    summary: "Resolve public YouTube video metadata for the contribution editor",
    description:
      "Validates a supported YouTube URL and returns normalized public snippet metadata. The server-side YouTube API credential is never exposed.",
  })
  @ApiBody({ type: YouTubeMetadataRequestDto })
  @ApiOkResponse({ type: YouTubeMetadataResponseDto })
  @ApiBadRequestResponse({ description: "YOUTUBE_URL_INVALID or validation failed" })
  @ApiNotFoundResponse({ description: "YOUTUBE_VIDEO_NOT_FOUND" })
  @ApiForbiddenResponse({
    description: "AUTH_EMAIL_VERIFICATION_REQUIRED or AUTH_ACCOUNT_SUSPENDED",
  })
  resolveYouTubeMetadata(@Body() body: YouTubeMetadataRequestDto) {
    return this.youtubeMetadataService.getMetadata(body.url);
  }

  @Post("entries")
  @ApiOperation({
    summary: "Create a Cultural Entry draft",
    description:
      "Creates an authenticated user's draft. Email verification is required. Submission, publishing, media, sources, tags, and moderation are not handled by this endpoint.",
  })
  @ApiBody({ type: CreateEntryDraftDto })
  @ApiOkResponse({ type: EntryResponseDto })
  @ApiBadRequestResponse({
    description:
      "ENTRY_TITLE_REQUIRED, ENTRY_TAXONOMY_INVALID, ENTRY_DISTRICT_PROVINCE_MISMATCH, ENTRY_CONTENT_INVALID, or validation failed",
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({
    description:
      "AUTH_EMAIL_VERIFICATION_REQUIRED, AUTH_ACCOUNT_SUSPENDED, or ENTRY_INVALID_STATUS",
  })
  createDraft(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateEntryDraftDto) {
    return this.entriesService.createDraft(user, body);
  }

  @Post("me/entries/:id/submit")
  @ApiOperation({
    summary: "Submit the current user's draft Cultural Entry for moderation",
    description:
      "Allowed from DRAFT or CHANGES_REQUESTED. Creates a permanent ContentVersion, moves the entry to PENDING_REVIEW, and writes an audit record.",
  })
  @ApiOkResponse({ type: EntrySubmissionResponseDto })
  @ApiBadRequestResponse({
    description:
      "ENTRY_SUBMISSION_INCOMPLETE, ENTRY_SUBMISSION_REFERENCE_INVALID, ENTRY_CONTENT_INVALID, or validation failed",
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({
    description:
      "AUTH_EMAIL_VERIFICATION_REQUIRED, AUTH_ACCOUNT_SUSPENDED, or ENTRY_INVALID_STATUS",
  })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND" })
  submitOwnEntry(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseUUIDPipe) id: string) {
    return this.entriesService.submitOwnEntry(user, id);
  }

  @Get("entries/reference-targets")
  @ApiOperation({
    summary: "Search published Cultural Entries for internal editor links",
    description:
      "Returns only PUBLISHED Cultural Entries. Drafts, hidden entries, archived entries, and unpublished content are never returned.",
  })
  @ApiOkResponse({ type: EntryReferenceSearchResponseDto })
  @ApiBadRequestResponse({ description: "Validation failed" })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({
    description: "AUTH_EMAIL_VERIFICATION_REQUIRED or AUTH_ACCOUNT_SUSPENDED",
  })
  searchReferenceTargets(@Query() query: EntryReferenceSearchQueryDto) {
    return this.entriesService.searchReferenceTargets(query);
  }

  @Get("entries/reference-targets/:targetEntryId")
  @ApiOperation({
    summary: "Validate one published Cultural Entry target for an internal editor link",
  })
  @ApiOkResponse({ type: EntryReferenceValidationResponseDto })
  @ApiBadRequestResponse({ description: "ENTRY_REFERENCE_TARGET_INVALID" })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({
    description: "AUTH_EMAIL_VERIFICATION_REQUIRED or AUTH_ACCOUNT_SUSPENDED",
  })
  validateReferenceTarget(@Param("targetEntryId", ParseUUIDPipe) targetEntryId: string) {
    return this.entriesService.validateReferenceTarget(targetEntryId);
  }

  @Get("me/entries")
  @ApiOperation({ summary: "List the current user's Cultural Entries" })
  @ApiOkResponse({ type: EntryListResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({
    description: "AUTH_EMAIL_VERIFICATION_REQUIRED or AUTH_ACCOUNT_SUSPENDED",
  })
  listOwnEntries(@CurrentUser() user: AuthenticatedUser, @Query() query: OwnEntriesQueryDto) {
    return this.entriesService.listOwnEntries(user, query);
  }

  @Get("me/entries/:id")
  @ApiOperation({ summary: "Read one current-user Cultural Entry draft or editable entry" })
  @ApiOkResponse({ type: EntryResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({
    description: "AUTH_EMAIL_VERIFICATION_REQUIRED or AUTH_ACCOUNT_SUSPENDED",
  })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND" })
  getOwnEntry(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseUUIDPipe) id: string) {
    return this.entriesService.getOwnEntry(user, id);
  }

  @Get("me/entries/:id/references/outgoing")
  @ApiOperation({ summary: "List outgoing internal references for the current user's entry" })
  @ApiOkResponse({ type: EntryReferencesResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({
    description: "AUTH_EMAIL_VERIFICATION_REQUIRED or AUTH_ACCOUNT_SUSPENDED",
  })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND" })
  listOutgoingReferences(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.entriesService.listOutgoingReferences(user, id);
  }

  @Get("me/entries/:id/references/incoming")
  @ApiOperation({
    summary: "List incoming internal references for the current user's entry",
    description:
      "Does not expose private drafts owned by other users. Incoming sources are limited to published entries or the current user's own entries.",
  })
  @ApiOkResponse({ type: EntryReferencesResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({
    description: "AUTH_EMAIL_VERIFICATION_REQUIRED or AUTH_ACCOUNT_SUSPENDED",
  })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND" })
  listIncomingReferences(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.entriesService.listIncomingReferences(user, id);
  }

  @Patch("me/entries/:id")
  @ApiOperation({
    summary: "Update the current user's editable Cultural Entry draft",
    description:
      "Only DRAFT and CHANGES_REQUESTED entries can be edited in this foundation phase. Resubmission is not implemented.",
  })
  @ApiBody({ type: UpdateEntryDraftDto })
  @ApiOkResponse({ type: EntryResponseDto })
  @ApiBadRequestResponse({
    description:
      "ENTRY_TITLE_REQUIRED, ENTRY_TAXONOMY_INVALID, ENTRY_DISTRICT_PROVINCE_MISMATCH, ENTRY_CONTENT_INVALID, or validation failed",
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({
    description:
      "AUTH_EMAIL_VERIFICATION_REQUIRED, AUTH_ACCOUNT_SUSPENDED, or ENTRY_INVALID_STATUS",
  })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND" })
  updateOwnEntry(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateEntryDraftDto,
  ) {
    return this.entriesService.updateOwnEntry(user, id, body);
  }

  @Delete("me/entries/:id")
  @ApiOperation({ summary: "Delete the current user's unsubmitted draft" })
  @ApiOkResponse({ type: EntryMessageResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({
    description:
      "AUTH_EMAIL_VERIFICATION_REQUIRED, AUTH_ACCOUNT_SUSPENDED, or ENTRY_INVALID_STATUS",
  })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND" })
  deleteOwnDraft(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseUUIDPipe) id: string) {
    return this.entriesService.deleteOwnDraft(user, id);
  }

  @Post("me/entries/:id/tags")
  @ApiOperation({ summary: "Add existing active tags to the current user's editable entry" })
  @ApiBody({ type: EntryTagsDto })
  @ApiOkResponse({ type: EntryTagsResponseDto })
  @ApiBadRequestResponse({
    description: "ENTRY_TAG_DUPLICATE, ENTRY_TAG_INVALID, or validation failed",
  })
  @ApiForbiddenResponse({
    description:
      "AUTH_EMAIL_VERIFICATION_REQUIRED, AUTH_ACCOUNT_SUSPENDED, or ENTRY_INVALID_STATUS",
  })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND" })
  addTags(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: EntryTagsDto,
  ) {
    return this.entriesService.addTags(user, id, body);
  }

  @Patch("me/entries/:id/tags")
  @ApiOperation({ summary: "Replace all tags on the current user's editable entry" })
  @ApiBody({ type: EntryTagsDto })
  @ApiOkResponse({ type: EntryTagsResponseDto })
  @ApiBadRequestResponse({
    description: "ENTRY_TAG_DUPLICATE, ENTRY_TAG_INVALID, or validation failed",
  })
  @ApiForbiddenResponse({
    description:
      "AUTH_EMAIL_VERIFICATION_REQUIRED, AUTH_ACCOUNT_SUSPENDED, or ENTRY_INVALID_STATUS",
  })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND" })
  replaceTags(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: EntryTagsDto,
  ) {
    return this.entriesService.replaceTags(user, id, body);
  }

  @Delete("me/entries/:id/tags/:tagId")
  @ApiOperation({ summary: "Remove one tag from the current user's editable entry" })
  @ApiOkResponse({ type: EntryTagsResponseDto })
  @ApiBadRequestResponse({ description: "ENTRY_TAG_INVALID" })
  @ApiForbiddenResponse({
    description:
      "AUTH_EMAIL_VERIFICATION_REQUIRED, AUTH_ACCOUNT_SUSPENDED, or ENTRY_INVALID_STATUS",
  })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND" })
  removeTag(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("tagId", ParseUUIDPipe) tagId: string,
  ) {
    return this.entriesService.removeTag(user, id, tagId);
  }

  @Post("me/entries/:id/sources")
  @ApiOperation({ summary: "Create a source on the current user's editable entry" })
  @ApiBody({ type: CreateEntrySourceDto })
  @ApiOkResponse({ type: EntrySourceResponseDto })
  @ApiBadRequestResponse({
    description: "ENTRY_SOURCE_INVALID, ENTRY_SOURCE_ORDER_DUPLICATE, or validation failed",
  })
  @ApiForbiddenResponse({
    description:
      "AUTH_EMAIL_VERIFICATION_REQUIRED, AUTH_ACCOUNT_SUSPENDED, or ENTRY_INVALID_STATUS",
  })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND" })
  createSource(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: CreateEntrySourceDto,
  ) {
    return this.entriesService.createSource(user, id, body);
  }

  @Patch("me/entries/:id/sources/reorder")
  @ApiOperation({ summary: "Reorder sources on the current user's editable entry" })
  @ApiBody({ type: ReorderEntrySourcesDto })
  @ApiOkResponse({ type: EntrySourcesResponseDto })
  @ApiBadRequestResponse({ description: "ENTRY_SOURCE_INVALID or ENTRY_SOURCE_ORDER_DUPLICATE" })
  @ApiForbiddenResponse({
    description:
      "AUTH_EMAIL_VERIFICATION_REQUIRED, AUTH_ACCOUNT_SUSPENDED, or ENTRY_INVALID_STATUS",
  })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND or ENTRY_SOURCE_NOT_FOUND" })
  reorderSources(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: ReorderEntrySourcesDto,
  ) {
    return this.entriesService.reorderSources(user, id, body);
  }

  @Patch("me/entries/:id/sources/:sourceId")
  @ApiOperation({ summary: "Update a source on the current user's editable entry" })
  @ApiBody({ type: UpdateEntrySourceDto })
  @ApiOkResponse({ type: EntrySourceResponseDto })
  @ApiBadRequestResponse({
    description: "ENTRY_SOURCE_INVALID, ENTRY_SOURCE_ORDER_DUPLICATE, or validation failed",
  })
  @ApiForbiddenResponse({
    description:
      "AUTH_EMAIL_VERIFICATION_REQUIRED, AUTH_ACCOUNT_SUSPENDED, or ENTRY_INVALID_STATUS",
  })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND or ENTRY_SOURCE_NOT_FOUND" })
  updateSource(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("sourceId", ParseUUIDPipe) sourceId: string,
    @Body() body: UpdateEntrySourceDto,
  ) {
    return this.entriesService.updateSource(user, id, sourceId, body);
  }

  @Delete("me/entries/:id/sources/:sourceId")
  @ApiOperation({ summary: "Delete a source from the current user's editable entry" })
  @ApiOkResponse({ type: EntryMessageResponseDto })
  @ApiForbiddenResponse({
    description:
      "AUTH_EMAIL_VERIFICATION_REQUIRED, AUTH_ACCOUNT_SUSPENDED, or ENTRY_INVALID_STATUS",
  })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND or ENTRY_SOURCE_NOT_FOUND" })
  deleteSource(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("sourceId", ParseUUIDPipe) sourceId: string,
  ) {
    return this.entriesService.deleteSource(user, id, sourceId);
  }

  @Get("me/entries/:id/images")
  @ApiOperation({ summary: "List images attached to the current user's editable entry" })
  @ApiOkResponse({ type: EntryImagesResponseDto })
  @ApiForbiddenResponse({
    description:
      "AUTH_EMAIL_VERIFICATION_REQUIRED, AUTH_ACCOUNT_SUSPENDED, or ENTRY_INVALID_STATUS",
  })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND" })
  listImages(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseUUIDPipe) id: string) {
    return this.entriesService.listImages(user, id);
  }

  @Post("me/entries/:id/images")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: memoryStorage(),
    }),
  )
  @ApiOperation({
    summary: "Upload an image to the current user's editable entry",
    description:
      "Accepts multipart/form-data with an image file up to 4 MB. JPEG, PNG, and WebP are supported. The backend validates actual file signatures, size, count, permission confirmation, and metadata.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["image", "altText", "permissionConfirmed"],
      properties: {
        image: {
          type: "string",
          format: "binary",
        },
        altText: {
          type: "string",
          maxLength: 220,
        },
        caption: {
          type: "string",
          maxLength: 500,
        },
        photographerOrSource: {
          type: "string",
          maxLength: 180,
        },
        permissionConfirmed: {
          type: "boolean",
        },
        displayOrder: {
          type: "integer",
          minimum: 0,
          maximum: 1_000_000,
        },
      },
    },
  })
  @ApiOkResponse({ type: EntryImageResponseDto })
  @ApiBadRequestResponse({
    description:
      "IMAGE_LIMIT_EXCEEDED, IMAGE_TOO_LARGE, IMAGE_INVALID_TYPE, IMAGE_UPLOAD_FAILED, IMAGE_PERMISSION_REQUIRED, IMAGE_ORDER_DUPLICATE, or validation failed",
  })
  @ApiForbiddenResponse({
    description:
      "AUTH_EMAIL_VERIFICATION_REQUIRED, AUTH_ACCOUNT_SUSPENDED, or ENTRY_INVALID_STATUS",
  })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND" })
  uploadImage(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UploadEntryImageDto,
    @UploadedFile() image: Express.Multer.File | undefined,
  ) {
    return this.entriesService.uploadImage(user, id, body, image);
  }

  @Patch("me/entries/:id/images/reorder")
  @ApiOperation({ summary: "Reorder images on the current user's editable entry" })
  @ApiBody({ type: ReorderEntryImagesDto })
  @ApiOkResponse({ type: EntryImagesResponseDto })
  @ApiBadRequestResponse({
    description: "IMAGE_NOT_FOUND, IMAGE_ORDER_DUPLICATE, or validation failed",
  })
  @ApiForbiddenResponse({
    description:
      "AUTH_EMAIL_VERIFICATION_REQUIRED, AUTH_ACCOUNT_SUSPENDED, or ENTRY_INVALID_STATUS",
  })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND or IMAGE_NOT_FOUND" })
  reorderImages(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: ReorderEntryImagesDto,
  ) {
    return this.entriesService.reorderImages(user, id, body);
  }

  @Patch("me/entries/:id/images/:imageId")
  @ApiOperation({ summary: "Update image metadata on the current user's editable entry" })
  @ApiBody({ type: UpdateEntryImageMetadataDto })
  @ApiOkResponse({ type: EntryImageResponseDto })
  @ApiBadRequestResponse({
    description: "IMAGE_PERMISSION_REQUIRED, IMAGE_ORDER_DUPLICATE, or validation failed",
  })
  @ApiForbiddenResponse({
    description:
      "AUTH_EMAIL_VERIFICATION_REQUIRED, AUTH_ACCOUNT_SUSPENDED, or ENTRY_INVALID_STATUS",
  })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND or IMAGE_NOT_FOUND" })
  updateImageMetadata(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("imageId", ParseUUIDPipe) imageId: string,
    @Body() body: UpdateEntryImageMetadataDto,
  ) {
    return this.entriesService.updateImageMetadata(user, id, imageId, body);
  }

  @Delete("me/entries/:id/images/:imageId")
  @ApiOperation({ summary: "Delete an image from the current user's editable entry" })
  @ApiOkResponse({ type: EntryMessageResponseDto })
  @ApiBadRequestResponse({ description: "IMAGE_DELETE_FAILED" })
  @ApiForbiddenResponse({
    description:
      "AUTH_EMAIL_VERIFICATION_REQUIRED, AUTH_ACCOUNT_SUSPENDED, or ENTRY_INVALID_STATUS",
  })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND or IMAGE_NOT_FOUND" })
  deleteImage(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("imageId", ParseUUIDPipe) imageId: string,
  ) {
    return this.entriesService.deleteImage(user, id, imageId);
  }

  @Get("me/entries/:id/youtube-video")
  @ApiOperation({ summary: "Get the current user's editable entry YouTube video" })
  @ApiOkResponse({ type: EntryYouTubeVideoResponseDto })
  @ApiForbiddenResponse({
    description:
      "AUTH_EMAIL_VERIFICATION_REQUIRED, AUTH_ACCOUNT_SUSPENDED, or ENTRY_INVALID_STATUS",
  })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND" })
  getYouTubeVideo(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseUUIDPipe) id: string) {
    return this.entriesService.getYouTubeVideo(user, id);
  }

  @Post("me/entries/:id/youtube-video")
  @ApiOperation({
    summary: "Add or replace the current user's editable entry YouTube video",
    description:
      "Accepts supported YouTube URL forms only and stores the extracted YouTube video ID. Raw iframe HTML is rejected.",
  })
  @ApiBody({ type: UpsertEntryYouTubeVideoDto })
  @ApiOkResponse({ type: EntryYouTubeVideoResponseDto })
  @ApiBadRequestResponse({ description: "YOUTUBE_URL_INVALID or validation failed" })
  @ApiForbiddenResponse({
    description:
      "AUTH_EMAIL_VERIFICATION_REQUIRED, AUTH_ACCOUNT_SUSPENDED, or ENTRY_INVALID_STATUS",
  })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND" })
  upsertYouTubeVideo(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpsertEntryYouTubeVideoDto,
  ) {
    return this.entriesService.upsertYouTubeVideo(user, id, body);
  }

  @Patch("me/entries/:id/youtube-video")
  @ApiOperation({ summary: "Update YouTube video metadata on the current user's editable entry" })
  @ApiBody({ type: UpdateEntryYouTubeVideoDto })
  @ApiOkResponse({ type: EntryYouTubeVideoResponseDto })
  @ApiBadRequestResponse({ description: "Validation failed" })
  @ApiForbiddenResponse({
    description:
      "AUTH_EMAIL_VERIFICATION_REQUIRED, AUTH_ACCOUNT_SUSPENDED, or ENTRY_INVALID_STATUS",
  })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND or YOUTUBE_VIDEO_NOT_FOUND" })
  updateYouTubeVideo(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateEntryYouTubeVideoDto,
  ) {
    return this.entriesService.updateYouTubeVideo(user, id, body);
  }

  @Delete("me/entries/:id/youtube-video")
  @ApiOperation({ summary: "Remove the current user's editable entry YouTube video" })
  @ApiOkResponse({ type: EntryMessageResponseDto })
  @ApiForbiddenResponse({
    description:
      "AUTH_EMAIL_VERIFICATION_REQUIRED, AUTH_ACCOUNT_SUSPENDED, or ENTRY_INVALID_STATUS",
  })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND or YOUTUBE_VIDEO_NOT_FOUND" })
  removeYouTubeVideo(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.entriesService.removeYouTubeVideo(user, id);
  }
}

export { EntriesController };
