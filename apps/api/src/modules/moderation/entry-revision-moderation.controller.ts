import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { UserRole } from "../../generated/prisma/enums";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequireVerifiedEmail } from "../auth/decorators/require-verified-email.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import type {
  ApproveRevisionDto,
  RevisionQueueQueryDto,
  RevisionReasonDto,
} from "../entries/dto/entry-revision.dto";
import { EntryRevisionsService } from "../entries/entry-revisions.service";

@ApiTags("Moderation entry revisions")
@ApiBearerAuth()
@RequireVerifiedEmail()
@Roles(UserRole.MODERATOR, UserRole.ADMIN)
@Controller("moderation")
class EntryRevisionModerationController {
  constructor(
    @Inject(EntryRevisionsService)
    private readonly revisionsService: EntryRevisionsService,
  ) {}

  @Post("entries/:entryId/request-revision")
  requestRevision(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Body() body: RevisionReasonDto,
  ) {
    return this.revisionsService.requestRevision(user, entryId, body.reason);
  }

  @Get("revisions")
  list(@Query() query: RevisionQueueQueryDto) {
    return this.revisionsService.listPendingRevisions(query.page, query.limit);
  }

  @Get("revisions/:revisionId")
  get(@Param("revisionId", ParseUUIDPipe) revisionId: string) {
    return this.revisionsService.getModerationRevision(revisionId);
  }

  @Post("revisions/:revisionId/approve")
  approve(
    @CurrentUser() user: AuthenticatedUser,
    @Param("revisionId", ParseUUIDPipe) revisionId: string,
    @Body() body: ApproveRevisionDto,
  ) {
    return this.revisionsService.approveRevision(user, revisionId, body.comments);
  }

  @Post("revisions/:revisionId/request-changes")
  requestChanges(
    @CurrentUser() user: AuthenticatedUser,
    @Param("revisionId", ParseUUIDPipe) revisionId: string,
    @Body() body: RevisionReasonDto,
  ) {
    return this.revisionsService.requestRevisionChanges(user, revisionId, body.reason);
  }

  @Post("revisions/:revisionId/reject")
  reject(
    @CurrentUser() user: AuthenticatedUser,
    @Param("revisionId", ParseUUIDPipe) revisionId: string,
    @Body() body: RevisionReasonDto,
  ) {
    return this.revisionsService.rejectRevision(user, revisionId, body.reason);
  }
}

export { EntryRevisionModerationController };
