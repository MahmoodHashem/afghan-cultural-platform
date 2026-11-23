import "server-only";

import { getPublicApiBaseUrl } from "@/lib/api/env";
import type { PaginationMeta, TaxonomyItem } from "../types/public-entry";

type ContributionDistrict = TaxonomyItem & {
  provinceId: string;
};

type TaxonomyListResponse<TItem> = {
  data: TItem[];
  meta: PaginationMeta;
};

type TaxonomyResult<TItem> = TaxonomyListResponse<TItem> & {
  isUnavailable: boolean;
};

type ContributionTaxonomyData = {
  provinces: TaxonomyItem[];
  districts: ContributionDistrict[];
  categories: TaxonomyItem[];
  contentTypes: TaxonomyItem[];
  tags: TaxonomyItem[];
  isUnavailable: boolean;
};

const EMPTY_TAXONOMY_RESPONSE = {
  data: [],
  meta: {
    page: 1,
    limit: 0,
    total: 0,
    totalPages: 0,
  },
};

async function getContributionTaxonomyData(): Promise<ContributionTaxonomyData> {
  const [provinces, districts, categories, contentTypes, tags] = await Promise.all([
    fetchAllTaxonomy<TaxonomyItem>("/taxonomy/provinces"),
    fetchAllTaxonomy<ContributionDistrict>("/taxonomy/districts"),
    fetchAllTaxonomy<TaxonomyItem>("/taxonomy/categories"),
    fetchAllTaxonomy<TaxonomyItem>("/taxonomy/content-types"),
    fetchAllTaxonomy<TaxonomyItem>("/taxonomy/tags"),
  ]);

  return {
    provinces: provinces.data,
    districts: districts.data,
    categories: categories.data,
    contentTypes: contentTypes.data,
    tags: tags.data,
    isUnavailable: [provinces, districts, categories, contentTypes, tags].some(
      (result) => result.isUnavailable,
    ),
  };
}

async function fetchAllTaxonomy<TItem>(path: string): Promise<TaxonomyResult<TItem>> {
  const firstPage = await fetchTaxonomy<TItem>(`${path}?page=1&limit=100`);

  if (firstPage.isUnavailable || firstPage.meta.totalPages <= 1) {
    return firstPage;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.meta.totalPages - 1 }, (_, index) =>
      fetchTaxonomy<TItem>(`${path}?page=${index + 2}&limit=100`),
    ),
  );

  return {
    data: [firstPage, ...remainingPages].flatMap((page) => page.data),
    meta: {
      ...firstPage.meta,
      limit: firstPage.meta.total,
      totalPages: 1,
    },
    isUnavailable: remainingPages.some((page) => page.isUnavailable),
  };
}

async function fetchTaxonomy<TItem>(path: string): Promise<TaxonomyResult<TItem>> {
  try {
    const response = await fetch(`${getPublicApiBaseUrl()}${path}`, {
      next: { revalidate: 120 },
    });

    if (!response.ok) {
      return { ...EMPTY_TAXONOMY_RESPONSE, isUnavailable: true };
    }

    return {
      ...((await response.json()) as TaxonomyListResponse<TItem>),
      isUnavailable: false,
    };
  } catch {
    return { ...EMPTY_TAXONOMY_RESPONSE, isUnavailable: true };
  }
}

export type { ContributionDistrict, ContributionTaxonomyData };
export { getContributionTaxonomyData };
