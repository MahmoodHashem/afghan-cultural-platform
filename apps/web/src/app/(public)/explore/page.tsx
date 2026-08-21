import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/page-transition";
import {
  getExploreTaxonomyData,
  getPublishedEntries,
  type PublicEntryListQuery,
} from "@/features/entries/api/public-entries-api";
import { ExploreContent } from "@/features/entries/components/explore-content";
import {
  getGeographicScope,
  getOptionalSearchParam,
  getPositiveIntegerSearchParam,
  getPublicEntrySort,
} from "@/features/entries/utils/public-entry-query";

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
    <PageTransition>
      <ExploreContent
        entries={entries}
        taxonomy={taxonomy}
        query={query}
        isEntriesUnavailable={entries.isUnavailable}
      />
    </PageTransition>
  );
}

function normalizeExploreQuery(
  searchParams: Record<string, string | string[] | undefined>,
): Required<Pick<PublicEntryListQuery, "page" | "limit" | "sort">> &
  Omit<PublicEntryListQuery, "page" | "limit" | "sort"> {
  return {
    page: getPositiveIntegerSearchParam(searchParams.page, 1),
    limit: 12,
    sort: getPublicEntrySort(searchParams.sort),
    provinceSlug: getOptionalSearchParam(searchParams.provinceSlug),
    categorySlug: getOptionalSearchParam(searchParams.categorySlug),
    contentTypeSlug: getOptionalSearchParam(searchParams.contentTypeSlug),
    tagSlug: getOptionalSearchParam(searchParams.tagSlug),
    geographicScope: getGeographicScope(searchParams.geographicScope),
  };
}
