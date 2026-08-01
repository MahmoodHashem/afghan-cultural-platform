import { Module } from "@nestjs/common";

import { PrismaModule } from "@/database/prisma.module";
import { AuditModule } from "@/modules/audit/audit.module";
import { ModerationController } from "@/modules/moderation/moderation.controller";
import { ModerationService } from "@/modules/moderation/moderation.service";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [ModerationController],
  providers: [ModerationService],
  exports: [ModerationService],
})
class ModerationModule {}

export { ModerationModule };
