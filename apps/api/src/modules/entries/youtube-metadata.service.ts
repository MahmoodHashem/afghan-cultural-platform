import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { ENTRY_ERROR_CODES } from "@/modules/entries/entries.constants";
import {
  createCanonicalYouTubeUrl,
  extractYouTubeVideoId,
} from "@/modules/entries/utils/youtube-url.util";

const YOUTUBE_METADATA_TIMEOUT_MS = 6_000;
const MAX_STORED_DESCRIPTION_LENGTH = 1_000;

type YouTubeSnippet = {
  title?: unknown;
  description?: unknown;
  channelTitle?: unknown;
  thumbnails?: Record<string, { url?: unknown }>;
};

type YouTubeVideosResponse = {
  items?: Array<{
    id?: unknown;
    snippet?: YouTubeSnippet;
  }>;
};

@Injectable()
class YouTubeMetadataService {
  private readonly logger = new Logger(YouTubeMetadataService.name);

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {}

  async getMetadata(url: string) {
    const videoId = extractYouTubeVideoId(url);

    if (!videoId) {
      throw new BadRequestException({
        error: ENTRY_ERROR_CODES.YOUTUBE_URL_INVALID,
        message: "YouTube URL is invalid.",
      });
    }

    const endpoint = new URL("https://www.googleapis.com/youtube/v3/videos");
    endpoint.search = new URLSearchParams({
      part: "snippet",
      id: videoId,
      key: this.configService.getOrThrow<string>("YOUTUBE_API_KEY"),
      fields: "items(id,snippet(title,description,channelTitle,thumbnails))",
    }).toString();

    let response: Response;

    try {
      response = await fetch(endpoint, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(YOUTUBE_METADATA_TIMEOUT_MS),
      });
    } catch {
      throw this.metadataUnavailable();
    }

    if (!response.ok) {
      this.logger.warn(`YouTube metadata request failed with status ${response.status}.`);
      throw this.metadataUnavailable();
    }

    let payload: YouTubeVideosResponse;

    try {
      payload = (await response.json()) as YouTubeVideosResponse;
    } catch {
      throw this.metadataUnavailable();
    }

    const item = payload.items?.[0];
    const snippet = item?.snippet;
    const title = readString(snippet?.title);

    if (!item || item.id !== videoId || !snippet || !title) {
      throw new NotFoundException({
        error: ENTRY_ERROR_CODES.YOUTUBE_VIDEO_NOT_FOUND,
        message: "YouTube video was not found or is unavailable.",
      });
    }

    return {
      data: {
        videoId,
        url: createCanonicalYouTubeUrl(videoId),
        title,
        description: readString(snippet.description).slice(0, MAX_STORED_DESCRIPTION_LENGTH),
        thumbnailUrl: selectThumbnailUrl(snippet.thumbnails),
        channelTitle: readString(snippet.channelTitle) || null,
      },
    };
  }

  private metadataUnavailable() {
    return new ServiceUnavailableException({
      error: ENTRY_ERROR_CODES.YOUTUBE_METADATA_UNAVAILABLE,
      message: "YouTube metadata is temporarily unavailable.",
    });
  }
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function selectThumbnailUrl(thumbnails: YouTubeSnippet["thumbnails"]) {
  if (!thumbnails) {
    return null;
  }

  for (const key of ["maxres", "standard", "high", "medium", "default"]) {
    const value = readString(thumbnails[key]?.url);

    if (value.startsWith("https://")) {
      return value;
    }
  }

  return null;
}

export { YouTubeMetadataService };
