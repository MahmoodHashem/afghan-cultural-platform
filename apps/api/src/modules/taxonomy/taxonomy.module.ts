import { Module } from "@nestjs/common";

import { PrismaModule } from "@/database/prisma.module";
import { TaxonomyController } from "@/modules/taxonomy/taxonomy.controller";
import { TaxonomyService } from "@/modules/taxonomy/taxonomy.service";

@Module({
  imports: [PrismaModule],
  controllers: [TaxonomyController],
  providers: [TaxonomyService],
  exports: [TaxonomyService],
})
class TaxonomyModule {}

export { TaxonomyModule };
