import { Module } from "@nestjs/common";

import { PrismaModule } from "../../database/prisma.module";
import { MediaModule } from "../media/media.module";
import { TaxonomyController } from "./taxonomy.controller";
import { TaxonomyService } from "./taxonomy.service";

@Module({
  imports: [PrismaModule, MediaModule],
  controllers: [TaxonomyController],
  providers: [TaxonomyService],
  exports: [TaxonomyService],
})
class TaxonomyModule {}

export { TaxonomyModule };
