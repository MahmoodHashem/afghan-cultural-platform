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
} from "@/modules/entries/dto/entry-response.dto";
import { EntriesService } from "@/modules/entries/entries.service";

@ApiTags("Entries")
@ApiBearerAuth()
@ApiExtraModels(CreateEntryDraftDto, OwnEntriesQueryDto, UpdateEntryDraftDto)
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
}

export { EntriesController };
