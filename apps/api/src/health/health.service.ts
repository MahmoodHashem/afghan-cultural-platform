import { Injectable } from "@nestjs/common";

type HealthResponse = {
  status: "ok";
  service: "afghan-cultural-platform-api";
};

@Injectable()
class HealthService {
  getHealth(): HealthResponse {
    return {
      status: "ok",
      service: "afghan-cultural-platform-api",
    };
  }
}

export type { HealthResponse };
export { HealthService };
