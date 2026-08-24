const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

function isSupportedYouTubeUrl(value: string | undefined) {
  if (!value?.trim() || value.includes("<") || value.includes(">")) {
    return false;
  }

  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    return false;
  }

  const hostname = url.hostname.toLowerCase();

  if (hostname === "youtu.be") {
    return isVideoId(url.pathname.split("/").filter(Boolean)[0]);
  }

  if (hostname !== "youtube.com" && hostname !== "www.youtube.com") {
    return false;
  }

  if (url.pathname === "/watch") {
    return isVideoId(url.searchParams.get("v") ?? undefined);
  }

  const pathParts = url.pathname.split("/").filter(Boolean);

  return pathParts[0] === "shorts" && isVideoId(pathParts[1]);
}

function isVideoId(value: string | undefined): value is string {
  return Boolean(value && YOUTUBE_VIDEO_ID_PATTERN.test(value));
}

export { isSupportedYouTubeUrl };
