import { Module } from "@nestjs/common";

import { PrismaModule } from "@/database/prisma.module";
import { AuditModule } from "@/modules/audit/audit.module";
import { CommunityModerationController } from "@/modules/moderation/community-moderation.controller";
import { ContentModerationController } from "@/modules/moderation/content-moderation.controller";
import { ContentModerationService } from "@/modules/moderation/content-moderation.service";
import { ModerationController } from "@/modules/moderation/moderation.controller";
import { ModerationService } from "@/modules/moderation/moderation.service";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [ModerationController, CommunityModerationController, ContentModerationController],
  providers: [ModerationService, ContentModerationService],
  exports: [ModerationService, ContentModerationService],
})
class ModerationModule {}

export { ModerationModule };
