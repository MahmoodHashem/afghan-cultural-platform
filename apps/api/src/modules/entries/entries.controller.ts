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
  CreateEntryDraftDto,
  UpdateEntryDraftDto,
} from "@/modules/entries/dto/create-entry-draft.dto";
import { OwnEntriesQueryDto } from "@/modules/entries/dto/entry-query.dto";
import {
  EntryListResponseDto,
  EntryMessageResponseDto,
  EntryResponseDto,
  EntrySourceResponseDto,
  EntrySourcesResponseDto,
  EntryTagsResponseDto,
} from "@/modules/entries/dto/entry-response.dto";
import {
  CreateEntrySourceDto,
  ReorderEntrySourcesDto,
  UpdateEntrySourceDto,
} from "@/modules/entries/dto/entry-sources.dto";
import { EntryTagsDto } from "@/modules/entries/dto/entry-tags.dto";
import { EntriesService } from "@/modules/entries/entries.service";

@ApiTags("Entries")
@ApiBearerAuth()
@ApiExtraModels(
  CreateEntryDraftDto,
  CreateEntrySourceDto,
  EntryTagsDto,
  OwnEntriesQueryDto,
  ReorderEntrySourcesDto,
  UpdateEntryDraftDto,
  UpdateEntrySourceDto,
)
@RequireVerifiedEmail()
@Controller()
class EntriesController {
  constructor(@Inject(EntriesService) private readonly entriesService: EntriesService) {}

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
}

export { EntriesController };
