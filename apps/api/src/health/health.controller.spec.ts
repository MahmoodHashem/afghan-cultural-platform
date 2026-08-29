import { ServiceUnavailableException } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { PrismaService } from "@/database/prisma.service";
import { HealthController } from "@/health/health.controller";
import { HealthService } from "@/health/health.service";

describe("HealthController", () => {
  let healthController: HealthController;
  const queryRaw = jest.fn();

  beforeEach(async () => {
    queryRaw.mockReset();
    queryRaw.mockResolvedValue([{ result: 1 }]);

    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: { $queryRaw: queryRaw },
        },
      ],
    }).compile();

    healthController = module.get<HealthController>(HealthController);
  });

  it("returns the service and database health status", async () => {
    await expect(healthController.getHealth()).resolves.toEqual({
      data: {
        status: "ok",
        service: "afghan-cultural-platform-api",
        database: "up",
      },
    });
  });

  it("returns service unavailable when PostgreSQL cannot be reached", async () => {
    queryRaw.mockRejectedValueOnce(new Error("connection unavailable"));

    await expect(healthController.getHealth()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
