import { Body, Controller, Get, Inject, Post } from "@nestjs/common";
import { ApiExcludeEndpoint } from "@nestjs/swagger";

import type { HealthValidationPreviewDto } from "@/health/dto/health-validation-preview.dto";
import { HealthService } from "@/health/health.service";

@Controller("health")
class HealthController {
  constructor(@Inject(HealthService) private readonly healthService: HealthService) {}

  @Get()
  getHealth() {
    return {
      data: this.healthService.getHealth(),
    };
  }

  @Post("validation-preview")
  @ApiExcludeEndpoint()
  validatePreview(@Body() body: HealthValidationPreviewDto) {
    return {
      data: body,
    };
  }
}

export { HealthController };
