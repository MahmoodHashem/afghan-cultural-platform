import { Controller, Get, Inject, Query } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { UserRole } from "../../generated/prisma/enums";
import { Roles } from "../auth/decorators/roles.decorator";
import { AdminAuditService } from "./admin-audit.service";
import { AdminAuditQueryDto } from "./dto/admin-audit-query.dto";
import { AdminAuditResponseDto } from "./dto/admin-audit-response.dto";

@ApiTags("Admin Audit")
@ApiExtraModels(AdminAuditQueryDto)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
@ApiForbiddenResponse({ description: "AUTH_INSUFFICIENT_ROLE or suspended account" })
@Roles(UserRole.ADMIN)
@Controller("admin/audit")
class AdminAuditController {
  constructor(@Inject(AdminAuditService) private readonly auditService: AdminAuditService) {}

  @Get()
  @ApiOperation({
    summary: "List the global audit history",
    description:
      "Returns paginated safe audit events without request identifiers, network addresses, user agents, or unknown metadata fields.",
  })
  @ApiOkResponse({ type: AdminAuditResponseDto })
  @ApiBadRequestResponse({ description: "Validation failed or ADMIN_AUDIT_DATE_RANGE_INVALID" })
  list(@Query() query: AdminAuditQueryDto) {
    return this.auditService.list(query);
  }
}

export { AdminAuditController };
