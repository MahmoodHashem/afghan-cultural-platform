import type { Metadata } from "next";

type SearchParams = Record<string, string | string[] | undefined>;

const publicOpenGraphDefaults = {
  locale: "fa_AF",
  siteName: "میراث افغانستان",
} as const;

function isSiteIndexingEnabled(): boolean {
  return process.env.NODE_ENV === "production" && process.env.SITE_INDEXING_ENABLED === "true";
}

function createCanonicalPath(...segments: string[]): string {
  if (segments.length === 0) {
    return "/";
  }

  return `/${segments.map((segment) => encodeURIComponent(segment.trim())).join("/")}`;
}

function hasFunctionalSearchParams(searchParams: SearchParams, keys: readonly string[]): boolean {
  return keys.some((key) => searchParams[key] !== undefined);
}

function createRobotsMetadata(indexable = true): Metadata["robots"] {
  if (!isSiteIndexingEnabled()) {
    return { index: false, follow: false };
  }

  if (!indexable) {
    return { index: false, follow: true };
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

export type { SearchParams };
export {
  createCanonicalPath,
  createRobotsMetadata,
  hasFunctionalSearchParams,
  isSiteIndexingEnabled,
  publicOpenGraphDefaults,
};
