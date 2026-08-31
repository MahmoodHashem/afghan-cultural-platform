import { Module } from "@nestjs/common";

import { PrismaModule } from "../../database/prisma.module";
import { AuditModule } from "../audit/audit.module";
import { CommunityModerationController } from "./community-moderation.controller";
import { ContentModerationController } from "./content-moderation.controller";
import { ContentModerationService } from "./content-moderation.service";
import { ModerationController } from "./moderation.controller";
import { ModerationService } from "./moderation.service";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [ModerationController, CommunityModerationController, ContentModerationController],
  providers: [ModerationService, ContentModerationService],
  exports: [ModerationService, ContentModerationService],
})
class ModerationModule {}

export { ModerationModule };
