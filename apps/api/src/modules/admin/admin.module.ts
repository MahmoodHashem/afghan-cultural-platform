import { Module } from "@nestjs/common";

import { PrismaModule } from "@/database/prisma.module";
import { AdminController } from "@/modules/admin/admin.controller";
import { AdminOverviewService } from "@/modules/admin/admin-overview.service";

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [AdminOverviewService],
})
class AdminModule {}

export { AdminModule };
