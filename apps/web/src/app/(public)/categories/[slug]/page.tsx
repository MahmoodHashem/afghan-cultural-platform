import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageTransition } from "@/components/layout/page-transition";
import {
  type GeographicScope,
  getPublicCategories,
  getPublicProvinces,
  getPublishedEntries,
  getPublishedEntryCount,
  type PublicEntryListQuery,
  type PublicEntrySort,
} from "@/features/entries/api/public-entries-api";
import { CategoryDetailContent } from "@/features/entries/components/taxonomy-discovery-pages";
import {
  getGeographicScope,
  getOptionalSearchParam,
  getPositiveIntegerSearchParam,
  getPublicEntrySort,
} from "@/features/entries/utils/public-entry-query";
import { sortTaxonomyItems } from "@/features/entries/utils/taxonomy";
import { findTaxonomyItemByRouteSegment } from "@/features/entries/utils/taxonomy-route";
import { createPersianPathSegment } from "@/lib/utils/persian";

type CategoryDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const PAGE_LIMIT = 8;

const sortLabels: Record<PublicEntrySort, string> = {
  newest: "تازه‌ترین",
  oldest: "قدیمی‌ترین",
  recentlyUpdated: "به‌روزشده",
};

export async function generateMetadata({ params }: CategoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryByRouteSegment(slug);

  if (!category) {
    return {
      title: "موضوع پیدا نشد | میراث افغانستان",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${category.name} | موضوع‌ها | میراث افغانستان`,
    description: `مطالب منتشرشده در موضوع ${category.name}.`,
    openGraph: {
      title: `${category.name} | میراث افغانستان`,
      description: `مطالب منتشرشده درباره ${category.name}.`,
      images: ["/images/herat-grand-mosque.webp"],
    },
  };
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: CategoryDetailPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const [categoriesResponse, provincesResponse] = await Promise.all([
    getPublicCategories(),
    getPublicProvinces(),
  ]);
  const category = findTaxonomyItemByRouteSegment(categoriesResponse.data, slug);

  if (!category) {
    notFound();
  }

  const page = getPositiveIntegerSearchParam(resolvedSearchParams.page, 1);
  const sort = getPublicEntrySort(resolvedSearchParams.sort);
  const selectedProvinceSlug = getOptionalSearchParam(resolvedSearchParams.provinceSlug);
  const selectedGeographicScope = getGeographicScope(resolvedSearchParams.geographicScope);
  const effectiveProvinceSlug =
    selectedGeographicScope === "NATIONAL" ? undefined : selectedProvinceSlug;
  const effectiveGeographicScope: GeographicScope | undefined = effectiveProvinceSlug
    ? "PROVINCE"
    : selectedGeographicScope;
  const baseHref = `/categories/${encodeURIComponent(createPersianPathSegment(category.name))}`;
  const entryQuery: PublicEntryListQuery = {
    page,
    limit: PAGE_LIMIT,
    sort,
    categorySlug: category.slug,
    provinceSlug: effectiveProvinceSlug,
    geographicScope: effectiveGeographicScope,
  };

  const [entries, categoryTotal, nationalCountResult, provinceCounts] = await Promise.all([
    getPublishedEntries(entryQuery),
    getPublishedEntryCount({ categorySlug: category.slug }),
    getPublishedEntryCount({ categorySlug: category.slug, geographicScope: "NATIONAL" }),
    Promise.all(
      sortTaxonomyItems(provincesResponse.data).map(async (province) => {
        const { count, isUnavailable } = await getPublishedEntryCount({
          categorySlug: category.slug,
          provinceSlug: province.slug,
          geographicScope: "PROVINCE",
        });

        return {
          ...province,
          entryCount: count,
          isUnavailable,
          href: createCategoryHref(baseHref, {
            provinceSlug: province.slug,
            geographicScope: "PROVINCE",
            sort,
          }),
          isActive: effectiveProvinceSlug === province.slug,
        };
      }),
    ),
  ]);
  const provinceFilters = provinceCounts.filter((province) => province.entryCount > 0);

  return (
    <PageTransition>
      <CategoryDetailContent
        category={{
          ...category,
          entryCount: categoryTotal.count,
        }}
        entries={entries}
        provinceFilters={provinceFilters}
        allAfghanistanHref={createCategoryHref(baseHref, { sort })}
        nationalHref={createCategoryHref(baseHref, { geographicScope: "NATIONAL", sort })}
        isAllAfghanistanActive={!effectiveProvinceSlug && !selectedGeographicScope}
        isNationalActive={selectedGeographicScope === "NATIONAL"}
        nationalCount={nationalCountResult.count}
        sortOptions={Object.entries(sortLabels).map(([value, label]) => ({
          label,
          value: value as PublicEntrySort,
          href: createCategoryHref(baseHref, {
            provinceSlug: effectiveProvinceSlug,
            geographicScope: effectiveGeographicScope,
            sort: value as PublicEntrySort,
          }),
          isActive: sort === value,
        }))}
        createPageHref={(nextPage) =>
          createCategoryHref(baseHref, {
            provinceSlug: effectiveProvinceSlug,
            geographicScope: effectiveGeographicScope,
            sort,
            page: nextPage,
          })
        }
        isUnavailable={
          categoriesResponse.isUnavailable ||
          provincesResponse.isUnavailable ||
          entries.isUnavailable ||
          categoryTotal.isUnavailable ||
          nationalCountResult.isUnavailable ||
          provinceCounts.some((province) => province.isUnavailable)
        }
      />
    </PageTransition>
  );
}

async function getCategoryByRouteSegment(slug: string) {
  const categoriesResponse = await getPublicCategories();

  return findTaxonomyItemByRouteSegment(categoriesResponse.data, slug);
}

function createCategoryHref(
  baseHref: string,
  query: {
    provinceSlug?: string;
    geographicScope?: GeographicScope;
    sort?: PublicEntrySort;
    page?: number;
  },
) {
  const searchParams = new URLSearchParams();

  if (query.provinceSlug) {
    searchParams.set("provinceSlug", query.provinceSlug);
  }

  if (query.geographicScope) {
    searchParams.set("geographicScope", query.geographicScope);
  }

  if (query.sort && query.sort !== "newest") {
    searchParams.set("sort", query.sort);
  }

  if (query.page && query.page > 1) {
    searchParams.set("page", String(query.page));
  }

  const queryString = searchParams.toString();

  return queryString ? `${baseHref}?${queryString}` : baseHref;
}
