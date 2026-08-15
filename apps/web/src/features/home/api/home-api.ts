import "server-only";

import { getPublicApiBaseUrl } from "@/lib/api/env";

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type TaxonomyItem = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
};

type PublicEntryImage = {
  id: string;
  secureUrl: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  caption: string | null;
  altText: string;
  photographerOrSource: string | null;
  displayOrder: number;
};

type PublicEntryAuthor = {
  id: string;
  displayName: string;
  profileImageUrl: string | null;
};

type PublicEntryCard = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverImage: PublicEntryImage | null;
  geographicScope: "PROVINCE" | "NATIONAL" | "NONE";
  province: Pick<TaxonomyItem, "id" | "name" | "slug"> | null;
  category: Pick<TaxonomyItem, "id" | "name" | "slug">;
  contentType: Pick<TaxonomyItem, "id" | "name" | "slug">;
  tags: Array<Pick<TaxonomyItem, "id" | "name" | "slug">>;
  author: PublicEntryAuthor;
  publishedAt: string;
  updatedAt: string;
  averageRating: number;
  ratingCount: number;
};

type EntryListResponse = {
  data: PublicEntryCard[];
  meta: PaginationMeta;
};

type TaxonomyListResponse<TItem> = {
  data: TItem[];
  meta: PaginationMeta;
};

type HomeData = {
  latestEntries: PublicEntryCard[];
  recentlyUpdatedEntries: PublicEntryCard[];
  nationalEntries: PublicEntryCard[];
  provinces: TaxonomyItem[];
  categories: TaxonomyItem[];
  contentTypes: TaxonomyItem[];
  stats: {
    publishedEntries: number;
    provinces: number;
    categories: number;
  };
  isApiUnavailable: boolean;
};

const EMPTY_META: PaginationMeta = {
  page: 1,
  limit: 0,
  total: 0,
  totalPages: 0,
};

async function getHomeData(): Promise<HomeData> {
  const [
    latestEntries,
    recentlyUpdatedEntries,
    nationalEntries,
    provinces,
    categories,
    contentTypes,
  ] = await Promise.all([
    fetchEntryList("/entries?limit=6&sort=newest"),
    fetchEntryList("/entries?limit=4&sort=recentlyUpdated"),
    fetchEntryList("/entries?limit=3&sort=newest&geographicScope=NATIONAL"),
    fetchTaxonomyList<TaxonomyItem>("/taxonomy/provinces?limit=8"),
    fetchTaxonomyList<TaxonomyItem>("/taxonomy/categories?limit=8"),
    fetchTaxonomyList<TaxonomyItem>("/taxonomy/content-types?limit=6"),
  ]);

  return {
    latestEntries: latestEntries.data,
    recentlyUpdatedEntries: recentlyUpdatedEntries.data,
    nationalEntries: nationalEntries.data,
    provinces: provinces.data,
    categories: categories.data,
    contentTypes: contentTypes.data,
    stats: {
      publishedEntries: latestEntries.meta.total,
      provinces: provinces.meta.total,
      categories: categories.meta.total,
    },
    isApiUnavailable: [
      latestEntries,
      recentlyUpdatedEntries,
      nationalEntries,
      provinces,
      categories,
      contentTypes,
    ].some((response) => response.isUnavailable),
  };
}

async function fetchEntryList(path: string) {
  return fetchApiList<EntryListResponse>(path, { data: [], meta: EMPTY_META });
}

async function fetchTaxonomyList<TItem>(path: string) {
  return fetchApiList<TaxonomyListResponse<TItem>>(path, { data: [], meta: EMPTY_META });
}

async function fetchApiList<TResponse extends { data: unknown[]; meta: PaginationMeta }>(
  path: string,
  fallback: TResponse,
) {
  try {
    const response = await fetch(`${getPublicApiBaseUrl()}${path}`, {
      next: { revalidate: 120 },
    });

    if (!response.ok) {
      return { ...fallback, isUnavailable: true };
    }

    return {
      ...((await response.json()) as TResponse),
      isUnavailable: false,
    };
  } catch {
    return { ...fallback, isUnavailable: true };
  }
}

export type { HomeData, PublicEntryCard, TaxonomyItem };
export { getHomeData };
