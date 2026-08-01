import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, Query } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
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
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { RequireVerifiedEmail } from "@/modules/auth/decorators/require-verified-email.decorator";
import { Roles } from "@/modules/auth/decorators/roles.decorator";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import {
  ApproveSubmissionDto,
  ModerationReasonDto,
} from "@/modules/moderation/dto/moderation-decision.dto";
import { ModerationSubmissionsQueryDto } from "@/modules/moderation/dto/moderation-query.dto";
import {
  ModerationDecisionResponseDto,
  ModerationSubmissionListResponseDto,
  ModerationSubmissionResponseDto,
} from "@/modules/moderation/dto/moderation-response.dto";
import { ModerationService } from "@/modules/moderation/moderation.service";

@ApiTags("Moderation")
@ApiBearerAuth()
@ApiExtraModels(ApproveSubmissionDto, ModerationReasonDto, ModerationSubmissionsQueryDto)
@RequireVerifiedEmail()
@Roles(UserRole.MODERATOR, UserRole.ADMIN)
@Controller("moderation/submissions")
class ModerationController {
  constructor(@Inject(ModerationService) private readonly moderationService: ModerationService) {}

  @Get()
  @ApiOperation({
    summary: "List pending Cultural Entry submissions",
    description:
      "Returns only PENDING_REVIEW entries and includes the latest submitted ContentVersion snapshot for moderation review.",
  })
  @ApiOkResponse({ type: ModerationSubmissionListResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({
    description: "AUTH_INSUFFICIENT_ROLE, AUTH_EMAIL_VERIFICATION_REQUIRED, or suspended account",
  })
  listSubmissions(@Query() query: ModerationSubmissionsQueryDto) {
    return this.moderationService.listSubmissions(query);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Read one pending Cultural Entry submission",
    description: "Returns the pending submission with its submitted ContentVersion snapshot.",
  })
  @ApiOkResponse({ type: ModerationSubmissionResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({
    description: "AUTH_INSUFFICIENT_ROLE, AUTH_EMAIL_VERIFICATION_REQUIRED, or suspended account",
  })
  @ApiNotFoundResponse({ description: "MODERATION_SUBMISSION_NOT_FOUND" })
  getSubmission(@Param("id", ParseUUIDPipe) id: string) {
    return this.moderationService.getSubmission(id);
  }

  @Post(":id/approve")
  @ApiOperation({
    summary: "Approve and immediately publish a pending Cultural Entry submission",
    description:
      "Uses the submitted ContentVersion as the publication source. Moderators cannot approve their own entries.",
  })
  @ApiBody({ type: ApproveSubmissionDto, required: false })
  @ApiOkResponse({ type: ModerationDecisionResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({
    description:
      "AUTH_INSUFFICIENT_ROLE, AUTH_EMAIL_VERIFICATION_REQUIRED, or MODERATION_SELF_APPROVAL_FORBIDDEN",
  })
  @ApiNotFoundResponse({ description: "MODERATION_SUBMISSION_NOT_FOUND" })
  @ApiConflictResponse({ description: "MODERATION_ALREADY_DECIDED or MODERATION_CONFLICT" })
  approveSubmission(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: ApproveSubmissionDto,
  ) {
    return this.moderationService.approveSubmission(user, id, body);
  }

  @Post(":id/request-changes")
  @ApiOperation({
    summary: "Request changes for a pending Cultural Entry submission",
    description:
      "Moves the entry back to CHANGES_REQUESTED and stores moderator feedback for the author.",
  })
  @ApiBody({ type: ModerationReasonDto })
  @ApiOkResponse({ type: ModerationDecisionResponseDto })
  @ApiBadRequestResponse({ description: "MODERATION_REASON_REQUIRED or validation failed" })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({
    description: "AUTH_INSUFFICIENT_ROLE, AUTH_EMAIL_VERIFICATION_REQUIRED, or suspended account",
  })
  @ApiNotFoundResponse({ description: "MODERATION_SUBMISSION_NOT_FOUND" })
  @ApiConflictResponse({ description: "MODERATION_ALREADY_DECIDED or MODERATION_CONFLICT" })
  requestChanges(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: ModerationReasonDto,
  ) {
    return this.moderationService.requestChanges(user, id, body);
  }

  @Post(":id/reject")
  @ApiOperation({
    summary: "Reject a pending Cultural Entry submission",
    description: "Moves the entry to REJECTED while preserving the submitted ContentVersion.",
  })
  @ApiBody({ type: ModerationReasonDto })
  @ApiOkResponse({ type: ModerationDecisionResponseDto })
  @ApiBadRequestResponse({ description: "MODERATION_REASON_REQUIRED or validation failed" })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({
    description: "AUTH_INSUFFICIENT_ROLE, AUTH_EMAIL_VERIFICATION_REQUIRED, or suspended account",
  })
  @ApiNotFoundResponse({ description: "MODERATION_SUBMISSION_NOT_FOUND" })
  @ApiConflictResponse({ description: "MODERATION_ALREADY_DECIDED or MODERATION_CONFLICT" })
  rejectSubmission(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: ModerationReasonDto,
  ) {
    return this.moderationService.rejectSubmission(user, id, body);
  }
}

export { ModerationController };
