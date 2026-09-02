import { Logger } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";

import { PublicEntryCacheService } from "./public-entry-cache.service";

const FRONTEND_URL = "https://mirasaf.example";
const SECRET = "a-secure-cache-revalidation-secret-value";

describe("PublicEntryCacheService", () => {
  let fetchMock: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    fetchMock = jest.spyOn(globalThis, "fetch");
    jest.spyOn(Logger.prototype, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("calls the protected frontend revalidation endpoint", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    const service = new PublicEntryCacheService(createConfigService());

    await service.revalidatePublishedEntries();

    expect(fetchMock).toHaveBeenCalledWith(
      new URL("/api/internal/revalidate-public-entries", FRONTEND_URL),
      expect.objectContaining({
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${SECRET}`,
        },
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("does not throw when the frontend returns an error", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 503 }));
    const service = new PublicEntryCacheService(createConfigService());

    await expect(service.revalidatePublishedEntries()).resolves.toBeUndefined();

    expect(Logger.prototype.warn).toHaveBeenCalledWith(
      "Public entry cache revalidation failed with status 503.",
    );
  });

  it("does not throw when the revalidation request rejects", async () => {
    fetchMock.mockRejectedValue(new Error("network unavailable"));
    const service = new PublicEntryCacheService(createConfigService());

    await expect(service.revalidatePublishedEntries()).resolves.toBeUndefined();

    expect(Logger.prototype.warn).toHaveBeenCalledWith(
      "Public entry cache revalidation request failed.",
    );
  });
});

function createConfigService() {
  const values: Record<string, string> = {
    CACHE_REVALIDATION_SECRET: SECRET,
    FRONTEND_URL,
  };

  return {
    getOrThrow: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService;
}
