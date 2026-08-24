"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getYouTubeMetadata } from "@/features/entries/api/entry-drafts-api";
import { isSupportedYouTubeUrl } from "@/features/entries/utils/youtube-url";

const YOUTUBE_METADATA_DEBOUNCE_MS = 650;

const youtubeMetadataQueryKeys = {
  all: ["entry-youtube-metadata"] as const,
  detail: (url: string) => [...youtubeMetadataQueryKeys.all, url] as const,
};

function useYouTubeMetadata(url: string) {
  const normalizedUrl = url.trim();
  const isValidUrl = isSupportedYouTubeUrl(normalizedUrl);
  const [debouncedUrl, setDebouncedUrl] = useState("");

  useEffect(() => {
    if (!isValidUrl) {
      setDebouncedUrl("");
      return;
    }

    const timeoutId = window.setTimeout(
      () => setDebouncedUrl(normalizedUrl),
      YOUTUBE_METADATA_DEBOUNCE_MS,
    );

    return () => window.clearTimeout(timeoutId);
  }, [isValidUrl, normalizedUrl]);

  const query = useQuery({
    queryKey: youtubeMetadataQueryKeys.detail(debouncedUrl),
    queryFn: ({ signal }) => getYouTubeMetadata(debouncedUrl, signal),
    enabled: Boolean(debouncedUrl),
    staleTime: 5 * 60_000,
    retry: false,
  });
  const hasCurrentQuery = isValidUrl && debouncedUrl === normalizedUrl;

  return {
    ...query,
    data: hasCurrentQuery ? query.data : undefined,
    error: hasCurrentQuery ? query.error : null,
    isError: hasCurrentQuery && query.isError,
    isFetching: hasCurrentQuery && query.isFetching,
    isWaiting: isValidUrl && debouncedUrl !== normalizedUrl,
  };
}

export { useYouTubeMetadata, youtubeMetadataQueryKeys };
