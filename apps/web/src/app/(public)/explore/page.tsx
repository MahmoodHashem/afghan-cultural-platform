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
import {
  createRobotsMetadata,
  hasFunctionalSearchParams,
  publicOpenGraphDefaults,
} from "@/lib/seo/metadata";

type ExplorePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const EXPLORE_FUNCTIONAL_SEARCH_PARAMS = [
  "page",
  "sort",
  "search",
  "provinceSlug",
  "categorySlug",
  "contentTypeSlug",
  "tagSlug",
  "geographicScope",
] as const;

export async function generateMetadata({ searchParams }: ExplorePageProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const isFiltered = hasFunctionalSearchParams(
    resolvedSearchParams,
    EXPLORE_FUNCTIONAL_SEARCH_PARAMS,
  );

  return {
    title: "مطالب فرهنگی",
    description: "مطالب فرهنگی افغانستان را بر اساس ولایت، موضوع و نوع محتوا پیدا کنید.",
    alternates: { canonical: "/explore" },
    robots: createRobotsMetadata(!isFiltered),
    openGraph: {
      ...publicOpenGraphDefaults,
      type: "website",
      title: "مطالب فرهنگی | میراث افغانستان",
      description: "مطالب منتشرشده درباره فرهنگ افغانستان.",
      images: ["/images/HERAT02.jpg"],
    },
  };
}

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
    search: getOptionalSearchParam(searchParams.search),
    provinceSlug: getOptionalSearchParam(searchParams.provinceSlug),
    categorySlug: getOptionalSearchParam(searchParams.categorySlug),
    contentTypeSlug: getOptionalSearchParam(searchParams.contentTypeSlug),
    tagSlug: getOptionalSearchParam(searchParams.tagSlug),
    geographicScope: getGeographicScope(searchParams.geographicScope),
  };
}
