import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";

import { PrismaService } from "@/database/prisma.service";

type HealthResponse = {
  status: "ok";
  service: "afghan-cultural-platform-api";
  database: "up";
};

@Injectable()
class HealthService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getHealth(): Promise<HealthResponse> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: "ok",
        service: "afghan-cultural-platform-api",
        database: "up",
      };
    } catch {
      throw new ServiceUnavailableException({
        code: "DATABASE_UNAVAILABLE",
        message: "The database is unavailable.",
      });
    }
  }
}

export type { HealthResponse };
export { HealthService };
