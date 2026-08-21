import "server-only";

import { getPublicApiBaseUrl } from "@/lib/api/env";
import { setOptionalSearchParam } from "@/lib/utils/url-search-params";
import type {
  EntryDetailResponse,
  EntryListResponse,
  PublicEntryDetail,
  PublicReviewListResponse,
  TaxonomyItem,
  TaxonomyListResponse,
} from "../types/public-entry";

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

  setOptionalSearchParam(searchParams, "provinceSlug", query.provinceSlug);
  setOptionalSearchParam(searchParams, "districtSlug", query.districtSlug);
  setOptionalSearchParam(searchParams, "categorySlug", query.categorySlug);
  setOptionalSearchParam(searchParams, "contentTypeSlug", query.contentTypeSlug);
  setOptionalSearchParam(searchParams, "tagSlug", query.tagSlug);
  setOptionalSearchParam(searchParams, "geographicScope", query.geographicScope);

  return fetchApi<EntryListResponse>(`/entries?${searchParams.toString()}`, EMPTY_ENTRY_RESPONSE);
}

async function getPublishedEntryCount(query: Omit<PublicEntryListQuery, "page" | "limit">) {
  const response = await getPublishedEntries({ ...query, page: 1, limit: 1 });

  return {
    count: response.meta.total,
    isUnavailable: response.isUnavailable,
  };
}

async function getPublishedEntryBySlug(slug: string): Promise<PublicEntryDetail | null> {
  try {
    const response = await fetch(
      `${getPublicApiBaseUrl()}/entries/${encodeURIComponent(normalizeSlug(slug))}`,
      {
        next: { revalidate: 120 },
      },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Published entry request failed.");
    }

    const parsedResponse = (await response.json()) as EntryDetailResponse;

    return parsedResponse.data;
  } catch {
    return null;
  }
}

async function getPublicEntryReviews(entryId: string) {
  try {
    const response = await fetch(`${getPublicApiBaseUrl()}/entries/${entryId}/reviews`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    return ((await response.json()) as PublicReviewListResponse).data;
  } catch {
    return [];
  }
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

async function getPublicProvinces() {
  return fetchTaxonomy("/taxonomy/provinces?limit=100");
}

async function getPublicCategories() {
  return fetchTaxonomy("/taxonomy/categories?limit=100");
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

function normalizeSlug(slug: string) {
  return decodeURIComponent(slug).trim();
}

export type { GeographicScope, PublicEntryListQuery, PublicEntrySort };
export {
  getExploreTaxonomyData,
  getPublicCategories,
  getPublicEntryReviews,
  getPublicProvinces,
  getPublishedEntries,
  getPublishedEntryBySlug,
  getPublishedEntryCount,
};
