import { Module } from "@nestjs/common";

import { PrismaModule } from "@/database/prisma.module";
import { AuditService } from "@/modules/audit/audit.service";

@Module({
  imports: [PrismaModule],
  providers: [AuditService],
  exports: [AuditService],
})
class AuditModule {}

export { AuditModule };
