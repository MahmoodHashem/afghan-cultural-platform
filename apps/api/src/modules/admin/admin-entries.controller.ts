import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, Query } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { UserRole } from "@/generated/prisma/enums";
import { AdminEntriesService } from "@/modules/admin/admin-entries.service";
import { AdminEntriesQueryDto } from "@/modules/admin/dto/admin-entries-query.dto";
import {
  AdminEntriesResponseDto,
  AdminEntryDetailResponseDto,
  AdminEntryLifecycleResponseDto,
} from "@/modules/admin/dto/admin-entries-response.dto";
import { AdminEntryLifecycleReasonDto } from "@/modules/admin/dto/admin-entry-actions.dto";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { Roles } from "@/modules/auth/decorators/roles.decorator";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";

@ApiTags("Admin Entries")
@ApiExtraModels(AdminEntriesQueryDto, AdminEntryLifecycleReasonDto)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
@ApiForbiddenResponse({ description: "AUTH_INSUFFICIENT_ROLE or suspended account" })
@Roles(UserRole.ADMIN)
@Controller("admin/entries")
class AdminEntriesController {
  constructor(@Inject(AdminEntriesService) private readonly entriesService: AdminEntriesService) {}

  @Get()
  @ApiOperation({
    summary: "List Cultural Entries for administration",
    description:
      "Returns every lifecycle status with compact safe fields, server-side filtering, sorting, pagination, and global status counts.",
  })
  @ApiOkResponse({ type: AdminEntriesResponseDto })
  @ApiBadRequestResponse({ description: "Validation failed" })
  listEntries(@Query() query: AdminEntriesQueryDto) {
    return this.entriesService.listEntries(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Inspect one Cultural Entry and its lifecycle history" })
  @ApiOkResponse({ type: AdminEntryDetailResponseDto })
  @ApiNotFoundResponse({ description: "ADMIN_ENTRY_NOT_FOUND" })
  getEntry(@Param("id", ParseUUIDPipe) entryId: string) {
    return this.entriesService.getEntry(entryId);
  }

  @Post(":id/archive")
  @ApiOperation({
    summary: "Archive a published Cultural Entry",
    description:
      "Only PUBLISHED entries may be archived. The action preserves publication history, creates a moderation record, and is audited.",
  })
  @ApiOkResponse({ type: AdminEntryLifecycleResponseDto })
  @ApiBadRequestResponse({
    description: "ADMIN_ENTRY_REASON_REQUIRED or ADMIN_ENTRY_INVALID_STATUS",
  })
  @ApiNotFoundResponse({ description: "ADMIN_ENTRY_NOT_FOUND" })
  @ApiConflictResponse({
    description: "ADMIN_ENTRY_ALREADY_ARCHIVED or ADMIN_ENTRY_LIFECYCLE_CONFLICT",
  })
  archiveEntry(
    @CurrentUser() actor: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) entryId: string,
    @Body() input: AdminEntryLifecycleReasonDto,
  ) {
    return this.entriesService.archiveEntry(actor, entryId, input);
  }

  @Post(":id/restore")
  @ApiOperation({
    summary: "Restore an archived Cultural Entry",
    description:
      "Only previously published ARCHIVED entries may be restored. The existing slug and publication timestamp are preserved.",
  })
  @ApiOkResponse({ type: AdminEntryLifecycleResponseDto })
  @ApiBadRequestResponse({
    description: "ADMIN_ENTRY_REASON_REQUIRED or ADMIN_ENTRY_INVALID_STATUS",
  })
  @ApiNotFoundResponse({ description: "ADMIN_ENTRY_NOT_FOUND" })
  @ApiConflictResponse({
    description: "ADMIN_ENTRY_ALREADY_RESTORED or ADMIN_ENTRY_LIFECYCLE_CONFLICT",
  })
  restoreEntry(
    @CurrentUser() actor: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) entryId: string,
    @Body() input: AdminEntryLifecycleReasonDto,
  ) {
    return this.entriesService.restoreEntry(actor, entryId, input);
  }
}

export { AdminEntriesController };
