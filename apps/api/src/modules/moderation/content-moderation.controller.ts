import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, Query } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { UserRole } from "@/generated/prisma/enums";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { RequireVerifiedEmail } from "@/modules/auth/decorators/require-verified-email.decorator";
import { Roles } from "@/modules/auth/decorators/roles.decorator";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import { ContentModerationService } from "@/modules/moderation/content-moderation.service";
import {
  CorrectionDecisionDto,
  CorrectionQueueQueryDto,
  CorrectionRejectionDto,
  ModerationHistoryQueryDto,
  ReportQueueQueryDto,
  ResolveReportDto,
} from "@/modules/moderation/dto/content-moderation.dto";

@ApiTags("Content moderation")
@ApiExtraModels(
  CorrectionDecisionDto,
  CorrectionQueueQueryDto,
  CorrectionRejectionDto,
  ModerationHistoryQueryDto,
  ReportQueueQueryDto,
  ResolveReportDto,
)
@ApiBearerAuth()
@RequireVerifiedEmail()
@Roles(UserRole.MODERATOR, UserRole.ADMIN)
@Controller("moderation")
class ContentModerationController {
  constructor(
    @Inject(ContentModerationService)
    private readonly contentModerationService: ContentModerationService,
  ) {}

  @Get("corrections")
  @ApiOperation({ summary: "List correction suggestions" })
  @ApiOkResponse({ description: "Paginated correction queue" })
  listCorrections(@Query() query: CorrectionQueueQueryDto) {
    return this.contentModerationService.listCorrections(query);
  }

  @Get("corrections/:id")
  @ApiOperation({ summary: "Read a correction suggestion with original content" })
  @ApiNotFoundResponse({ description: "CORRECTION_NOT_FOUND" })
  getCorrection(@Param("id", ParseUUIDPipe) id: string) {
    return this.contentModerationService.getCorrection(id);
  }

  @Post("corrections/:id/accept")
  @ApiOperation({ summary: "Accept a correction and create a permanent content version" })
  @ApiOkResponse({ description: "Correction accepted" })
  @ApiConflictResponse({ description: "CORRECTION_ALREADY_DECIDED or CORRECTION_CONFLICT" })
  acceptCorrection(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() input: CorrectionDecisionDto,
  ) {
    return this.contentModerationService.acceptCorrection(user, id, input);
  }

  @Post("corrections/:id/reject")
  @ApiOperation({ summary: "Reject a correction suggestion" })
  @ApiOkResponse({ description: "Correction rejected" })
  @ApiConflictResponse({ description: "CORRECTION_ALREADY_DECIDED or CORRECTION_CONFLICT" })
  rejectCorrection(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() input: CorrectionRejectionDto,
  ) {
    return this.contentModerationService.rejectCorrection(user, id, input);
  }

  @Get("reports")
  @ApiOperation({ summary: "List Cultural Entry and public-review reports" })
  @ApiOkResponse({ description: "Paginated reports queue" })
  listReports(@Query() query: ReportQueueQueryDto) {
    return this.contentModerationService.listReports(query);
  }

  @Get("reports/:id")
  @ApiOperation({ summary: "Read a report and its moderation context" })
  @ApiNotFoundResponse({ description: "REPORT_NOT_FOUND" })
  getReport(@Param("id", ParseUUIDPipe) id: string) {
    return this.contentModerationService.getReport(id);
  }

  @Post("reports/:id/resolve")
  @ApiOperation({ summary: "Resolve a report using a supported moderator action" })
  @ApiOkResponse({ description: "Report resolved" })
  @ApiConflictResponse({ description: "REPORT_ALREADY_RESOLVED or REPORT_CONFLICT" })
  resolveReport(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() input: ResolveReportDto,
  ) {
    return this.contentModerationService.resolveReport(user, id, input);
  }

  @Get("history")
  @ApiOperation({ summary: "List audit-backed content moderation history" })
  @ApiOkResponse({ description: "Paginated moderation history" })
  listHistory(@Query() query: ModerationHistoryQueryDto) {
    return this.contentModerationService.listHistory(query);
  }
}

export { ContentModerationController };
