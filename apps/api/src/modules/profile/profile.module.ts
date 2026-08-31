import { Module } from "@nestjs/common";

import { PrismaModule } from "../../database/prisma.module";
import { MediaModule } from "../media/media.module";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

@Module({
  imports: [PrismaModule, MediaModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
class ProfileModule {}

export { ProfileModule };
