import { Body, Controller, Inject, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { RequireVerifiedEmail } from "@/modules/auth/decorators/require-verified-email.decorator";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import { ContentModerationService } from "@/modules/moderation/content-moderation.service";
import type {
  SubmitCorrectionDto,
  SubmitReportDto,
} from "@/modules/moderation/dto/content-moderation.dto";

@ApiTags("Community moderation")
@ApiBearerAuth()
@RequireVerifiedEmail()
@Controller("entries/:entryId")
class CommunityModerationController {
  constructor(
    @Inject(ContentModerationService)
    private readonly contentModerationService: ContentModerationService,
  ) {}

  @Post("corrections")
  @ApiOperation({ summary: "Suggest a correction to a published Cultural Entry" })
  @ApiCreatedResponse({ description: "Correction suggestion created" })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "AUTH_EMAIL_VERIFICATION_REQUIRED" })
  @ApiNotFoundResponse({ description: "CORRECTION_ENTRY_NOT_FOUND" })
  @ApiConflictResponse({ description: "CORRECTION_ALREADY_PENDING" })
  submitCorrection(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Body() input: SubmitCorrectionDto,
  ) {
    return this.contentModerationService.submitCorrection(user, entryId, input);
  }

  @Post("reports")
  @ApiOperation({ summary: "Report a published Cultural Entry" })
  @ApiCreatedResponse({ description: "Report created" })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "AUTH_EMAIL_VERIFICATION_REQUIRED" })
  @ApiNotFoundResponse({ description: "REPORT_TARGET_NOT_FOUND" })
  @ApiConflictResponse({ description: "REPORT_ALREADY_OPEN" })
  reportEntry(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Body() input: SubmitReportDto,
  ) {
    return this.contentModerationService.submitReport(user, entryId, null, input);
  }

  @Post("comments/:commentId/reports")
  @ApiOperation({ summary: "Report an active entry comment" })
  @ApiCreatedResponse({ description: "Comment report created" })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "AUTH_EMAIL_VERIFICATION_REQUIRED" })
  @ApiNotFoundResponse({ description: "REPORT_TARGET_NOT_FOUND" })
  @ApiConflictResponse({ description: "REPORT_ALREADY_OPEN" })
  reportComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Param("commentId", ParseUUIDPipe) commentId: string,
    @Body() input: SubmitReportDto,
  ) {
    return this.contentModerationService.submitReport(user, entryId, commentId, input);
  }
}

export { CommunityModerationController };
