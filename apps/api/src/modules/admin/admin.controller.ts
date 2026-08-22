import { Controller, Get, Inject } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { UserRole } from "@/generated/prisma/enums";
import { AdminOverviewService } from "@/modules/admin/admin-overview.service";
import { AdminOverviewResponseDto } from "@/modules/admin/dto/admin-overview-response.dto";
import { Roles } from "@/modules/auth/decorators/roles.decorator";

@ApiTags("Admin")
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller("admin")
class AdminController {
  constructor(
    @Inject(AdminOverviewService) private readonly adminOverviewService: AdminOverviewService,
  ) {}

  @Get("overview")
  @ApiOperation({
    summary: "Get the Admin dashboard overview",
    description:
      "Returns real aggregate metrics, 30-day growth, actionable queue counts, and recent safe audit activity. Available only to ADMIN users.",
  })
  @ApiOkResponse({ type: AdminOverviewResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "AUTH_INSUFFICIENT_ROLE or suspended account" })
  getOverview() {
    return this.adminOverviewService.getOverview();
  }
}

export { AdminController };
