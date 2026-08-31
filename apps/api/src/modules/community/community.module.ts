import { Module } from "@nestjs/common";

import { PrismaModule } from "../../database/prisma.module";
import { CommunityController } from "./community.controller";
import { CommunityService } from "./community.service";

@Module({
  imports: [PrismaModule],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
class CommunityModule {}

export { CommunityModule };
