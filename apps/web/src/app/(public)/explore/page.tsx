import type { Metadata } from "next";

import {
  type GeographicScope,
  getExploreTaxonomyData,
  getPublishedEntries,
  type PublicEntryListQuery,
  type PublicEntrySort,
} from "@/features/entries/api/public-entries-api";
import { ExploreContent } from "@/features/entries/components/explore-content";
import { HomeFooter } from "@/features/home/components/home-footer";

type ExplorePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "مطالب فرهنگی | میراث افغانستان",
  description: "مطالب فرهنگی افغانستان را بر اساس ولایت، موضوع و نوع محتوا پیدا کنید.",
  openGraph: {
    title: "مطالب فرهنگی | میراث افغانستان",
    description: "مطالب منتشرشده درباره فرهنگ افغانستان.",
    images: ["/images/HERAT02.jpg"],
  },
};

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = normalizeExploreQuery(resolvedSearchParams);
  const [entries, taxonomy] = await Promise.all([
    getPublishedEntries(query),
    getExploreTaxonomyData(),
  ]);

  return (

    <ExploreContent
      entries={entries}
      taxonomy={taxonomy}
      query={query}
      isEntriesUnavailable={entries.isUnavailable}
    />


  );
}

function normalizeExploreQuery(
  searchParams: Record<string, string | string[] | undefined>,
): Required<Pick<PublicEntryListQuery, "page" | "limit" | "sort">> &
  Omit<PublicEntryListQuery, "page" | "limit" | "sort"> {
  return {
    page: getPositiveInteger(searchParams.page, 1),
    limit: 12,
    sort: getSort(searchParams.sort),
    provinceSlug: getOptionalString(searchParams.provinceSlug),
    categorySlug: getOptionalString(searchParams.categorySlug),
    contentTypeSlug: getOptionalString(searchParams.contentTypeSlug),
    tagSlug: getOptionalString(searchParams.tagSlug),
    geographicScope: getGeographicScope(searchParams.geographicScope),
  };
}

function getOptionalString(value: string | string[] | undefined) {
  const stringValue = Array.isArray(value) ? value[0] : value;

  return stringValue?.trim() || undefined;
}

function getPositiveInteger(value: string | string[] | undefined, fallback: number) {
  const stringValue = getOptionalString(value);
  const parsedValue = stringValue ? Number(stringValue) : Number.NaN;

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}

function getSort(value: string | string[] | undefined): PublicEntrySort {
  const sort = getOptionalString(value);

  if (sort === "oldest" || sort === "recentlyUpdated") {
    return sort;
  }

  return "newest";
}

function getGeographicScope(value: string | string[] | undefined): GeographicScope | undefined {
  const geographicScope = getOptionalString(value);

  if (
    geographicScope === "PROVINCE" ||
    geographicScope === "NATIONAL" ||
    geographicScope === "NONE"
  ) {
    return geographicScope;
  }

  return undefined;
}
