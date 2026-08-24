import { Module } from "@nestjs/common";

import { PrismaModule } from "@/database/prisma.module";
import { AuditModule } from "@/modules/audit/audit.module";
import { EntriesController } from "@/modules/entries/entries.controller";
import { EntriesService } from "@/modules/entries/entries.service";
import { PublicEntriesController } from "@/modules/entries/public-entries.controller";
import { YouTubeMetadataService } from "@/modules/entries/youtube-metadata.service";
import { MediaModule } from "@/modules/media/media.module";

@Module({
  imports: [PrismaModule, AuditModule, MediaModule],
  controllers: [EntriesController, PublicEntriesController],
  providers: [EntriesService, YouTubeMetadataService],
  exports: [EntriesService],
})
class EntriesModule {}

export { EntriesModule };
