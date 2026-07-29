import { Test, type TestingModule } from "@nestjs/testing";

import { HealthController } from "@/health/health.controller";
import { HealthService } from "@/health/health.service";

describe("HealthController", () => {
  let healthController: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();

    healthController = module.get<HealthController>(HealthController);
  });

  it("returns the service health status", () => {
    expect(healthController.getHealth()).toEqual({
      data: {
        status: "ok",
        service: "afghan-cultural-platform-api",
      },
    });
  });

  it("echoes validation preview data after global validation", () => {
    expect(healthController.validatePreview({ name: "test" })).toEqual({
      data: {
        name: "test",
      },
    });
  });
});
