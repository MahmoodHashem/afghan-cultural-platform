import {
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

@Injectable()
class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(@Inject(ConfigService) configService: ConfigService) {
    const databaseUrl = configService.getOrThrow<string>("DATABASE_URL");
    const adapter = new PrismaPg({ connectionString: databaseUrl });

    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown database connection error";
      this.logger.error(`Failed to connect to PostgreSQL through Prisma: ${message}`);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

export { PrismaService };
