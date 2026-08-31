import { Controller, Get, Inject } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { UserRole } from "../../generated/prisma/enums";
import { Roles } from "../auth/decorators/roles.decorator";
import { AdminOverviewService } from "./admin-overview.service";
import { AdminOverviewResponseDto } from "./dto/admin-overview-response.dto";

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
