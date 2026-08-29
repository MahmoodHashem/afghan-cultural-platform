import { Controller, Get, Inject } from "@nestjs/common";
import { HealthService } from "@/health/health.service";
import { Public } from "@/modules/auth/decorators/public.decorator";

@Public()
@Controller("health")
class HealthController {
  constructor(@Inject(HealthService) private readonly healthService: HealthService) {}

  @Get()
  async getHealth() {
    return {
      data: await this.healthService.getHealth(),
    };
  }
}

export { HealthController };
