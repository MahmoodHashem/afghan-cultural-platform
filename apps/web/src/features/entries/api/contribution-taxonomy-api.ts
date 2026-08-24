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
    fetchTaxonomy<TaxonomyItem>("/taxonomy/provinces?limit=100"),
    fetchTaxonomy<ContributionDistrict>("/taxonomy/districts?limit=500"),
    fetchTaxonomy<TaxonomyItem>("/taxonomy/categories?limit=100"),
    fetchTaxonomy<TaxonomyItem>("/taxonomy/content-types?limit=100"),
    fetchTaxonomy<TaxonomyItem>("/taxonomy/tags?limit=100"),
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
