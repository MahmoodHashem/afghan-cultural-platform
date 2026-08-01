import { Module } from "@nestjs/common";

import { PrismaModule } from "@/database/prisma.module";
import { AuditModule } from "@/modules/audit/audit.module";
import { EntriesController } from "@/modules/entries/entries.controller";
import { EntriesService } from "@/modules/entries/entries.service";
import { PublicEntriesController } from "@/modules/entries/public-entries.controller";
import { MediaModule } from "@/modules/media/media.module";

@Module({
  imports: [PrismaModule, AuditModule, MediaModule],
  controllers: [EntriesController, PublicEntriesController],
  providers: [EntriesService],
  exports: [EntriesService],
})
class EntriesModule {}

export { EntriesModule };
