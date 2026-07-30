import { Global, Module } from "@nestjs/common";

import { PrismaService } from "@/database/prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
class PrismaModule {}

export { PrismaModule };
