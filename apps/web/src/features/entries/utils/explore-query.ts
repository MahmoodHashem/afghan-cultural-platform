import type { PublicEntryListQuery } from "../api/public-entries-api";

type NormalizedExploreQuery = Required<Pick<PublicEntryListQuery, "page" | "limit" | "sort">> &
  Omit<PublicEntryListQuery, "page" | "limit" | "sort">;

function createExploreHref(
  query: NormalizedExploreQuery,
  updates: Partial<NormalizedExploreQuery>,
) {
  const nextQuery = { ...query, ...updates };
  const searchParams = new URLSearchParams();

  setParam(searchParams, "page", nextQuery.page > 1 ? String(nextQuery.page) : undefined);
  setParam(searchParams, "sort", nextQuery.sort !== "newest" ? nextQuery.sort : undefined);
  setParam(searchParams, "provinceSlug", nextQuery.provinceSlug);
  setParam(searchParams, "categorySlug", nextQuery.categorySlug);
  setParam(searchParams, "contentTypeSlug", nextQuery.contentTypeSlug);
  setParam(searchParams, "tagSlug", nextQuery.tagSlug);
  setParam(searchParams, "geographicScope", nextQuery.geographicScope);

  const queryString = searchParams.toString();

  return queryString ? `/explore?${queryString}` : "/explore";
}

function setParam(searchParams: URLSearchParams, key: string, value: string | undefined) {
  if (value) {
    searchParams.set(key, value);
  }
}

export type { NormalizedExploreQuery };
export { createExploreHref };
