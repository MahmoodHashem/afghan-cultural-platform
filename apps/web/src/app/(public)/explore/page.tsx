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
import { JsonLd } from "@/lib/seo/json-ld";
import {
  createCanonicalPath,
  createRobotsMetadata,
  createSocialMetadata,
  hasFunctionalSearchParams,
} from "@/lib/seo/metadata";
import { createCollectionStructuredData } from "@/lib/seo/structured-data";

const EXPLORE_DESCRIPTION = "مطالب فرهنگی افغانستان را بر اساس ولایت، موضوع و نوع محتوا پیدا کنید.";

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
    description: EXPLORE_DESCRIPTION,
    alternates: { canonical: "/explore" },
    robots: createRobotsMetadata(!isFiltered),
    ...createSocialMetadata({
      title: "مطالب فرهنگی | میراث افغانستان",
      description: EXPLORE_DESCRIPTION,
      canonicalPath: "/explore",
    }),
  };
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = normalizeExploreQuery(resolvedSearchParams);
  const [entries, taxonomy] = await Promise.all([
    getPublishedEntries(query),
    getExploreTaxonomyData(),
  ]);
  const isFiltered = hasFunctionalSearchParams(
    resolvedSearchParams,
    EXPLORE_FUNCTIONAL_SEARCH_PARAMS,
  );

  return (
    <>
      {!isFiltered && !entries.isUnavailable ? (
        <JsonLd
          data={createCollectionStructuredData({
            name: "مطالب فرهنگی افغانستان",
            description: EXPLORE_DESCRIPTION,
            canonicalPath: "/explore",
            breadcrumbs: [
              { name: "خانه", path: "/" },
              { name: "مطالب", path: "/explore" },
            ],
            items: entries.data.map((entry) => ({
              name: entry.title,
              path: createCanonicalPath("entries", entry.slug),
            })),
            totalItems: entries.meta.total,
          })}
        />
      ) : null}
      <PageTransition>
        <ExploreContent
          entries={entries}
          taxonomy={taxonomy}
          query={query}
          isEntriesUnavailable={entries.isUnavailable}
        />
      </PageTransition>
    </>
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
