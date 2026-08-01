import { Module } from "@nestjs/common";

import { PrismaModule } from "@/database/prisma.module";
import { EntriesController } from "@/modules/entries/entries.controller";
import { EntriesService } from "@/modules/entries/entries.service";

@Module({
  imports: [PrismaModule],
  controllers: [EntriesController],
  providers: [EntriesService],
  exports: [EntriesService],
})
class EntriesModule {}

export { EntriesModule };
