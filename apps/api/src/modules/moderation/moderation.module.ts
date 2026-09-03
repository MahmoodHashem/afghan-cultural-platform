import { Module } from "@nestjs/common";

import { PublicEntryCacheService } from "../../common/cache/public-entry-cache.service";
import { PrismaModule } from "../../database/prisma.module";
import { AuditModule } from "../audit/audit.module";
import { EntriesModule } from "../entries/entries.module";
import { CommunityModerationController } from "./community-moderation.controller";
import { ContentModerationController } from "./content-moderation.controller";
import { ContentModerationService } from "./content-moderation.service";
import { EntryRevisionModerationController } from "./entry-revision-moderation.controller";
import { ModerationController } from "./moderation.controller";
import { ModerationService } from "./moderation.service";

@Module({
  imports: [PrismaModule, AuditModule, EntriesModule],
  controllers: [
    ModerationController,
    CommunityModerationController,
    ContentModerationController,
    EntryRevisionModerationController,
  ],
  providers: [ModerationService, ContentModerationService, PublicEntryCacheService],
  exports: [ModerationService, ContentModerationService],
})
class ModerationModule {}

export { ModerationModule };
