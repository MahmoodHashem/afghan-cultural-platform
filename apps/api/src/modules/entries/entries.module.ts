import { Module } from "@nestjs/common";

import { PrismaModule } from "../../database/prisma.module";
import { AuditModule } from "../audit/audit.module";
import { MediaModule } from "../media/media.module";
import { EntriesController } from "./entries.controller";
import { EntriesService } from "./entries.service";
import { PublicEntriesController } from "./public-entries.controller";
import { YouTubeMetadataService } from "./youtube-metadata.service";

@Module({
  imports: [PrismaModule, AuditModule, MediaModule],
  controllers: [EntriesController, PublicEntriesController],
  providers: [EntriesService, YouTubeMetadataService],
  exports: [EntriesService],
})
class EntriesModule {}

export { EntriesModule };
