import "server-only";

import type { Metadata } from "next";

import { getPublicSiteUrl } from "./site-url";

type SearchParams = Record<string, string | string[] | undefined>;

const SITE_NAME = "میراث افغانستان";
const SITE_DESCRIPTION = "جایی برای خواندن، ثبت و شناخت فرهنگ، تاریخ و میراث افغانستان.";
const DEFAULT_SOCIAL_IMAGE = {
  url: "/images/HERAT02.jpg",
  width: 1200,
  height: 675,
  alt: "نمایی از میراث فرهنگی افغانستان",
} as const;

type SocialImage = {
  url: string;
  width?: number | null;
  height?: number | null;
  alt: string;
};

type SocialMetadataInput = {
  title: string;
  description: string;
  canonicalPath: string;
  image?: SocialImage | null;
  article?: {
    publishedTime: string;
    modifiedTime: string;
    section: string;
    tags: string[];
  };
};

function isSiteIndexingEnabled(): boolean {
  return process.env.NODE_ENV === "production" && process.env.SITE_INDEXING_ENABLED === "true";
}

function createCanonicalPath(...segments: string[]): string {
  if (segments.length === 0) {
    return "/";
  }

  return `/${segments.map((segment) => encodeURIComponent(segment.trim())).join("/")}`;
}

function createAbsoluteUrl(path: string): string {
  return new URL(path, getPublicSiteUrl()).toString();
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

function createSocialMetadata({
  title,
  description,
  canonicalPath,
  image,
  article,
}: SocialMetadataInput): Pick<Metadata, "openGraph" | "twitter"> {
  const socialImage = image ?? DEFAULT_SOCIAL_IMAGE;
  const openGraphImage = {
    url: socialImage.url,
    alt: socialImage.alt,
    ...(socialImage.width ? { width: socialImage.width } : {}),
    ...(socialImage.height ? { height: socialImage.height } : {}),
  };
  const sharedOpenGraph = {
    locale: "fa_AF",
    siteName: SITE_NAME,
    title,
    description,
    url: canonicalPath,
    images: [openGraphImage],
  };

  return {
    openGraph: article
      ? {
          ...sharedOpenGraph,
          type: "article",
          publishedTime: article.publishedTime,
          modifiedTime: article.modifiedTime,
          section: article.section,
          tags: article.tags,
        }
      : {
          ...sharedOpenGraph,
          type: "website",
        },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: socialImage.url, alt: socialImage.alt }],
    },
  };
}

export type { SearchParams, SocialImage };
export {
  createAbsoluteUrl,
  createCanonicalPath,
  createRobotsMetadata,
  createSocialMetadata,
  DEFAULT_SOCIAL_IMAGE,
  hasFunctionalSearchParams,
  isSiteIndexingEnabled,
  SITE_DESCRIPTION,
  SITE_NAME,
};
