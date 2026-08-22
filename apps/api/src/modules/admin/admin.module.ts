import { Module } from "@nestjs/common";

import { PrismaModule } from "@/database/prisma.module";
import { AdminController } from "@/modules/admin/admin.controller";
import { AdminOverviewService } from "@/modules/admin/admin-overview.service";
import { AdminUsersController } from "@/modules/admin/admin-users.controller";
import { AdminUsersService } from "@/modules/admin/admin-users.service";
import { AuditModule } from "@/modules/audit/audit.module";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [AdminController, AdminUsersController],
  providers: [AdminOverviewService, AdminUsersService],
})
class AdminModule {}

export { AdminModule };
