const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

function extractYouTubeVideoId(value: string): string | null {
  const normalizedValue = value.trim();

  if (!normalizedValue || normalizedValue.includes("<") || normalizedValue.includes(">")) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(normalizedValue);
  } catch {
    return null;
  }

  const hostname = url.hostname.toLowerCase();

  if (hostname === "youtu.be") {
    return normalizeVideoId(url.pathname.split("/").filter(Boolean)[0]);
  }

  if (hostname === "www.youtube.com" || hostname === "youtube.com") {
    if (url.pathname === "/watch") {
      return normalizeVideoId(url.searchParams.get("v"));
    }

    const pathParts = url.pathname.split("/").filter(Boolean);

    if (pathParts[0] === "shorts") {
      return normalizeVideoId(pathParts[1]);
    }
  }

  return null;
}

function normalizeVideoId(videoId: string | null | undefined): string | null {
  if (!videoId || !YOUTUBE_VIDEO_ID_PATTERN.test(videoId)) {
    return null;
  }

  return videoId;
}

function createCanonicalYouTubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export { createCanonicalYouTubeUrl, extractYouTubeVideoId };
