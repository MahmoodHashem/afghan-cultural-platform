import { Module } from "@nestjs/common";

import { PrismaModule } from "@/database/prisma.module";
import { ProfileController } from "@/modules/profile/profile.controller";
import { ProfileService } from "@/modules/profile/profile.service";

@Module({
  imports: [PrismaModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
class ProfileModule {}

export { ProfileModule };
