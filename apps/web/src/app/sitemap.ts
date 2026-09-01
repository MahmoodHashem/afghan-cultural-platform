import type { MetadataRoute } from "next";

import {
  getPublicCategories,
  getPublicProvinces,
  getPublishedEntries,
} from "@/features/entries/api/public-entries-api";
import type { PublicEntryCard, TaxonomyItem } from "@/features/entries/types/public-entry";
import { createAbsoluteUrl, createCanonicalPath, isSiteIndexingEnabled } from "@/lib/seo/metadata";
import { createPersianPathSegment } from "@/lib/utils/persian";

const STATIC_PUBLIC_PATHS = ["/", "/explore", "/provinces", "/categories"] as const;
const SITEMAP_PAGE_SIZE = 100;
const SITEMAP_REVALIDATE_SECONDS = 3600;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isSiteIndexingEnabled()) {
    return [];
  }

  const [provinces, categories, entries] = await Promise.all([
    getPublicProvinces({ revalidate: SITEMAP_REVALIDATE_SECONDS }),
    getPublicCategories({ revalidate: SITEMAP_REVALIDATE_SECONDS }),
    getAllPublishedEntries(),
  ]);
  const records: MetadataRoute.Sitemap = [
    ...STATIC_PUBLIC_PATHS.map((path) => ({ url: createAbsoluteUrl(path) })),
    ...createTaxonomySitemapRecords("provinces", provinces.data),
    ...createTaxonomySitemapRecords("categories", categories.data),
    ...entries.map((entry) => ({
      url: createAbsoluteUrl(createCanonicalPath("entries", entry.slug)),
      lastModified: toValidDate(entry.updatedAt),
    })),
  ];

  return [...new Map(records.map((record) => [record.url, record])).values()];
}

async function getAllPublishedEntries(): Promise<PublicEntryCard[]> {
  const firstPage = await getPublishedEntries(
    {
      page: 1,
      limit: SITEMAP_PAGE_SIZE,
      sort: "recentlyUpdated",
    },
    { revalidate: SITEMAP_REVALIDATE_SECONDS },
  );

  if (firstPage.isUnavailable) {
    return [];
  }

  const entries = [...firstPage.data];

  for (let page = 2; page <= firstPage.meta.totalPages; page += 1) {
    const response = await getPublishedEntries(
      {
        page,
        limit: SITEMAP_PAGE_SIZE,
        sort: "recentlyUpdated",
      },
      { revalidate: SITEMAP_REVALIDATE_SECONDS },
    );

    if (response.isUnavailable) {
      break;
    }

    entries.push(...response.data);
  }

  return entries;
}

function createTaxonomySitemapRecords(
  segment: "categories" | "provinces",
  items: TaxonomyItem[],
): MetadataRoute.Sitemap {
  return items.map((item) => ({
    url: createAbsoluteUrl(createCanonicalPath(segment, createPersianPathSegment(item.name))),
    lastModified: toValidDate(item.updatedAt),
  }));
}

function toValidDate(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}
