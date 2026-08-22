import {
  Body,
  Controller,
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
import { AdminUsersService } from "@/modules/admin/admin-users.service";
import { UpdateAdminUserStatusDto } from "@/modules/admin/dto/admin-user-actions.dto";
import {
  AdminUserActivityQueryDto,
  AdminUserEntriesQueryDto,
  AdminUserReviewsQueryDto,
  AdminUsersQueryDto,
} from "@/modules/admin/dto/admin-users-query.dto";
import {
  AdminRevokeSessionsEnvelopeDto,
  AdminUserActivityResponseDto,
  AdminUserDetailResponseDto,
  AdminUserEntriesResponseDto,
  AdminUserReviewsResponseDto,
  AdminUserStatusEnvelopeDto,
  AdminUsersResponseDto,
} from "@/modules/admin/dto/admin-users-response.dto";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { Roles } from "@/modules/auth/decorators/roles.decorator";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";

@ApiTags("Admin Users")
@ApiExtraModels(
  AdminUsersQueryDto,
  AdminUserEntriesQueryDto,
  AdminUserReviewsQueryDto,
  AdminUserActivityQueryDto,
  UpdateAdminUserStatusDto,
)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
@ApiForbiddenResponse({ description: "AUTH_INSUFFICIENT_ROLE or suspended account" })
@Roles(UserRole.ADMIN)
@Controller("admin/users")
class AdminUsersController {
  constructor(@Inject(AdminUsersService) private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({
    summary: "List users for administration",
    description:
      "Returns safe account fields, authentication method labels, activity counts, server-side filters, sorting, and pagination. Security credentials are never returned.",
  })
  @ApiOkResponse({ type: AdminUsersResponseDto })
  @ApiBadRequestResponse({ description: "Validation failed" })
  listUsers(@Query() query: AdminUsersQueryDto) {
    return this.adminUsersService.listUsers(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get safe administrative details for one user" })
  @ApiOkResponse({ type: AdminUserDetailResponseDto })
  @ApiNotFoundResponse({ description: "ADMIN_USER_NOT_FOUND" })
  getUser(@Param("id", ParseUUIDPipe) userId: string) {
    return this.adminUsersService.getUser(userId);
  }

  @Get(":id/entries")
  @ApiOperation({ summary: "List one user's Cultural Entries" })
  @ApiOkResponse({ type: AdminUserEntriesResponseDto })
  @ApiNotFoundResponse({ description: "ADMIN_USER_NOT_FOUND" })
  listUserEntries(
    @Param("id", ParseUUIDPipe) userId: string,
    @Query() query: AdminUserEntriesQueryDto,
  ) {
    return this.adminUsersService.listUserEntries(userId, query);
  }

  @Get(":id/reviews")
  @ApiOperation({ summary: "List one user's public reviews" })
  @ApiOkResponse({ type: AdminUserReviewsResponseDto })
  @ApiNotFoundResponse({ description: "ADMIN_USER_NOT_FOUND" })
  listUserReviews(
    @Param("id", ParseUUIDPipe) userId: string,
    @Query() query: AdminUserReviewsQueryDto,
  ) {
    return this.adminUsersService.listUserReviews(userId, query);
  }

  @Get(":id/activity")
  @ApiOperation({ summary: "List safe account-administration history for one user" })
  @ApiOkResponse({ type: AdminUserActivityResponseDto })
  @ApiNotFoundResponse({ description: "ADMIN_USER_NOT_FOUND" })
  listUserActivity(
    @Param("id", ParseUUIDPipe) userId: string,
    @Query() query: AdminUserActivityQueryDto,
  ) {
    return this.adminUsersService.listUserActivity(userId, query);
  }

  @Patch(":id/status")
  @ApiOperation({
    summary: "Suspend or reactivate one user",
    description:
      "Suspension requires a reason and revokes existing refresh sessions. Administrators cannot change their own status. Every successful change is audited.",
  })
  @ApiOkResponse({ type: AdminUserStatusEnvelopeDto })
  @ApiBadRequestResponse({ description: "ADMIN_USER_SUSPENSION_REASON_REQUIRED" })
  @ApiForbiddenResponse({ description: "ADMIN_USER_SELF_ACTION_FORBIDDEN" })
  @ApiNotFoundResponse({ description: "ADMIN_USER_NOT_FOUND" })
  @ApiConflictResponse({
    description:
      "ADMIN_USER_ALREADY_SUSPENDED, ADMIN_USER_ALREADY_ACTIVE, or ADMIN_USER_STATUS_CONFLICT",
  })
  updateUserStatus(
    @CurrentUser() actor: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) userId: string,
    @Body() body: UpdateAdminUserStatusDto,
  ) {
    return this.adminUsersService.updateUserStatus(actor, userId, body);
  }

  @Post(":id/revoke-sessions")
  @ApiOperation({
    summary: "Revoke all active refresh sessions for one user",
    description:
      "Revokes active device sessions without exposing session identifiers, user agents, IP addresses, or token hashes. The action is audited.",
  })
  @ApiOkResponse({ type: AdminRevokeSessionsEnvelopeDto })
  @ApiNotFoundResponse({ description: "ADMIN_USER_NOT_FOUND" })
  revokeUserSessions(
    @CurrentUser() actor: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) userId: string,
  ) {
    return this.adminUsersService.revokeUserSessions(actor, userId);
  }
}

export { AdminUsersController };
