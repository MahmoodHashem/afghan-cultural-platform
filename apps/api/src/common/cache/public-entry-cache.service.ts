import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const CACHE_REVALIDATION_PATH = "/api/internal/revalidate-public-entries";
const CACHE_REVALIDATION_TIMEOUT_MS = 3_000;

@Injectable()
class PublicEntryCacheService {
  private readonly logger = new Logger(PublicEntryCacheService.name);

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {}

  async revalidatePublishedEntries(): Promise<void> {
    const frontendUrl = this.configService.getOrThrow<string>("FRONTEND_URL");
    const secret = this.configService.getOrThrow<string>("CACHE_REVALIDATION_SECRET");
    const endpoint = new URL(CACHE_REVALIDATION_PATH, frontendUrl);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${secret}`,
        },
        signal: AbortSignal.timeout(CACHE_REVALIDATION_TIMEOUT_MS),
      });

      if (!response.ok) {
        this.logger.warn(`Public entry cache revalidation failed with status ${response.status}.`);
      }
    } catch {
      this.logger.warn("Public entry cache revalidation request failed.");
    }
  }
}

export { PublicEntryCacheService };
