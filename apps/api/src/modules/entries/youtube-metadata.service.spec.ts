import type { ConfigService } from "@nestjs/config";

import { ENTRY_ERROR_CODES } from "./entries.constants";
import { YouTubeMetadataService } from "./youtube-metadata.service";

describe("YouTubeMetadataService", () => {
  const configService = {
    getOrThrow: jest.fn().mockReturnValue("server-only-test-key"),
  };
  const service = new YouTubeMetadataService(configService as unknown as ConfigService);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns normalized public video metadata", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: "abcdefghijk",
              snippet: {
                title: "  میراث هرات  ",
                description: "توضیح ویدیو",
                channelTitle: "کانال فرهنگی",
                thumbnails: {
                  high: { url: "https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg" },
                },
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(service.getMetadata("https://youtu.be/abcdefghijk")).resolves.toEqual({
      data: {
        videoId: "abcdefghijk",
        url: "https://www.youtube.com/watch?v=abcdefghijk",
        title: "میراث هرات",
        description: "توضیح ویدیو",
        thumbnailUrl: "https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg",
        channelTitle: "کانال فرهنگی",
      },
    });
  });

  it("rejects unsupported URLs before calling YouTube", async () => {
    const fetchSpy = jest.spyOn(global, "fetch");

    await expectErrorCode(
      service.getMetadata("https://example.com/video"),
      ENTRY_ERROR_CODES.YOUTUBE_URL_INVALID,
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns not found when YouTube has no public video", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expectErrorCode(
      service.getMetadata("https://www.youtube.com/watch?v=abcdefghijk"),
      ENTRY_ERROR_CODES.YOUTUBE_VIDEO_NOT_FOUND,
    );
  });

  it("normalizes upstream failures without exposing YouTube responses", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(new Response("quota details", { status: 403 }));

    await expectErrorCode(
      service.getMetadata("https://www.youtube.com/watch?v=abcdefghijk"),
      ENTRY_ERROR_CODES.YOUTUBE_METADATA_UNAVAILABLE,
    );
  });
});

async function expectErrorCode(promise: Promise<unknown>, code: string) {
  try {
    await promise;
    throw new Error(`Expected ${code}.`);
  } catch (error) {
    expect(error).toMatchObject({
      response: {
        error: code,
      },
    });
  }
}
