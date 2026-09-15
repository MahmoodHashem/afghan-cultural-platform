import { Module } from "@nestjs/common";

import { PrismaModule } from "../../database/prisma.module";
import { AuditModule } from "../audit/audit.module";
import { AdminController } from "./admin.controller";
import { AdminAuditController } from "./admin-audit.controller";
import { AdminAuditService } from "./admin-audit.service";
import { AdminEntriesController } from "./admin-entries.controller";
import { AdminEntriesService } from "./admin-entries.service";
import { AdminOverviewService } from "./admin-overview.service";
import { AdminUsersController } from "./admin-users.controller";
import { AdminUsersService } from "./admin-users.service";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [
    AdminController,
    AdminAuditController,
    AdminEntriesController,
    AdminUsersController,
  ],
  providers: [AdminOverviewService, AdminAuditService, AdminEntriesService, AdminUsersService],
})
class AdminModule {}

export { AdminModule };
