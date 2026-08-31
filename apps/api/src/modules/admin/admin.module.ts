import { Module } from "@nestjs/common";

import { PrismaModule } from "../../database/prisma.module";
import { AuditModule } from "../audit/audit.module";
import { AdminController } from "./admin.controller";
import { AdminEntriesController } from "./admin-entries.controller";
import { AdminEntriesService } from "./admin-entries.service";
import { AdminOverviewService } from "./admin-overview.service";
import { AdminUsersController } from "./admin-users.controller";
import { AdminUsersService } from "./admin-users.service";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [AdminController, AdminEntriesController, AdminUsersController],
  providers: [AdminOverviewService, AdminEntriesService, AdminUsersService],
})
class AdminModule {}

export { AdminModule };
