import "server-only";

import { getPublicApiBaseUrl } from "@/lib/api/env";
import type { EntryListResponse, TaxonomyItem, TaxonomyListResponse } from "../types/public-entry";

type PublicEntrySort = "newest" | "oldest" | "recentlyUpdated";
type GeographicScope = "PROVINCE" | "NATIONAL" | "NONE";

type PublicEntryListQuery = {
  page?: number;
  limit?: number;
  sort?: PublicEntrySort;
  provinceSlug?: string;
  districtSlug?: string;
  categorySlug?: string;
  contentTypeSlug?: string;
  tagSlug?: string;
  geographicScope?: GeographicScope;
};

type PublicEntryListResult = EntryListResponse & {
  isUnavailable: boolean;
};

type TaxonomyResult<TItem> = TaxonomyListResponse<TItem> & {
  isUnavailable: boolean;
};

type ExploreTaxonomyData = {
  provinces: TaxonomyItem[];
  categories: TaxonomyItem[];
  contentTypes: TaxonomyItem[];
  tags: TaxonomyItem[];
  isUnavailable: boolean;
};

const EMPTY_ENTRY_RESPONSE: EntryListResponse = {
  data: [],
  meta: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  },
};

const EMPTY_TAXONOMY_RESPONSE: TaxonomyListResponse<TaxonomyItem> = {
  data: [],
  meta: {
    page: 1,
    limit: 0,
    total: 0,
    totalPages: 0,
  },
};

async function getPublishedEntries(query: PublicEntryListQuery): Promise<PublicEntryListResult> {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(query.page ?? 1));
  searchParams.set("limit", String(query.limit ?? 12));
  searchParams.set("sort", query.sort ?? "newest");

  setOptionalParam(searchParams, "provinceSlug", query.provinceSlug);
  setOptionalParam(searchParams, "districtSlug", query.districtSlug);
  setOptionalParam(searchParams, "categorySlug", query.categorySlug);
  setOptionalParam(searchParams, "contentTypeSlug", query.contentTypeSlug);
  setOptionalParam(searchParams, "tagSlug", query.tagSlug);
  setOptionalParam(searchParams, "geographicScope", query.geographicScope);

  return fetchApi<EntryListResponse>(`/entries?${searchParams.toString()}`, EMPTY_ENTRY_RESPONSE);
}

async function getExploreTaxonomyData(): Promise<ExploreTaxonomyData> {
  const [provinces, categories, contentTypes, tags] = await Promise.all([
    fetchTaxonomy("/taxonomy/provinces?limit=100"),
    fetchTaxonomy("/taxonomy/categories?limit=100"),
    fetchTaxonomy("/taxonomy/content-types?limit=100"),
    fetchTaxonomy("/taxonomy/tags?limit=100"),
  ]);

  return {
    provinces: provinces.data,
    categories: categories.data,
    contentTypes: contentTypes.data,
    tags: tags.data,
    isUnavailable: [provinces, categories, contentTypes, tags].some(
      (result) => result.isUnavailable,
    ),
  };
}

async function fetchTaxonomy(path: string): Promise<TaxonomyResult<TaxonomyItem>> {
  return fetchApi<TaxonomyListResponse<TaxonomyItem>>(path, EMPTY_TAXONOMY_RESPONSE);
}

async function fetchApi<TResponse>(path: string, fallback: TResponse) {
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

function setOptionalParam(searchParams: URLSearchParams, key: string, value: string | undefined) {
  if (value) {
    searchParams.set(key, value);
  }
}

export type { GeographicScope, PublicEntryListQuery, PublicEntrySort };
export { getExploreTaxonomyData, getPublishedEntries };
