import { Module } from "@nestjs/common";

import { PublicEntryCacheService } from "../../common/cache/public-entry-cache.service";
import { PrismaModule } from "../../database/prisma.module";
import { AuditModule } from "../audit/audit.module";
import { MediaModule } from "../media/media.module";
import { EntriesController } from "./entries.controller";
import { EntriesService } from "./entries.service";
import { EntryRevisionsController } from "./entry-revisions.controller";
import { EntryRevisionsService } from "./entry-revisions.service";
import { PublicEntriesController } from "./public-entries.controller";
import { YouTubeMetadataService } from "./youtube-metadata.service";

@Module({
  imports: [PrismaModule, AuditModule, MediaModule],
  controllers: [EntriesController, EntryRevisionsController, PublicEntriesController],
  providers: [
    EntriesService,
    EntryRevisionsService,
    YouTubeMetadataService,
    PublicEntryCacheService,
  ],
  exports: [EntriesService, EntryRevisionsService],
})
class EntriesModule {}

export { EntriesModule };
