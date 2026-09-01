import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageTransition } from "@/components/layout/page-transition";
import {
  getPublicCategories,
  getPublicProvinces,
  getPublishedEntries,
  getPublishedEntryCount,
  type PublicEntryListQuery,
} from "@/features/entries/api/public-entries-api";
import { ProvinceDetailContent } from "@/features/entries/components/taxonomy-discovery-pages";
import {
  getOptionalSearchParam,
  getPositiveIntegerSearchParam,
} from "@/features/entries/utils/public-entry-query";
import { sortTaxonomyItems } from "@/features/entries/utils/taxonomy";
import { findTaxonomyItemByRouteSegment } from "@/features/entries/utils/taxonomy-route";
import { getProvinceImage } from "@/lib/images/province-images";
import {
  createCanonicalPath,
  createRobotsMetadata,
  hasFunctionalSearchParams,
  publicOpenGraphDefaults,
} from "@/lib/seo/metadata";
import { createPersianPathSegment } from "@/lib/utils/persian";

type ProvinceDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const PAGE_LIMIT = 8;
const PROVINCE_FUNCTIONAL_SEARCH_PARAMS = ["page", "categorySlug"] as const;

export async function generateMetadata({
  params,
  searchParams,
}: ProvinceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const province = await getProvinceByRouteSegment(slug);

  if (!province) {
    return {
      title: "ولایت پیدا نشد",
      robots: { index: false, follow: false },
    };
  }

  const description = province.description || `مطالب مربوط به ${province.name}.`;
  const image = getProvinceImage(province);
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const canonicalPath = createCanonicalPath("provinces", createPersianPathSegment(province.name));
  const isFiltered = hasFunctionalSearchParams(
    resolvedSearchParams,
    PROVINCE_FUNCTIONAL_SEARCH_PARAMS,
  );

  return {
    title: `${province.name} | ولایت‌ها`,
    description,
    alternates: { canonical: canonicalPath },
    robots: createRobotsMetadata(!isFiltered),
    openGraph: {
      ...publicOpenGraphDefaults,
      type: "website",
      title: `${province.name} | میراث افغانستان`,
      description,
      images: [image.src],
    },
  };
}

export default async function ProvinceDetailPage({
  params,
  searchParams,
}: ProvinceDetailPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const [provincesResponse, categoriesResponse] = await Promise.all([
    getPublicProvinces(),
    getPublicCategories(),
  ]);
  const province = findTaxonomyItemByRouteSegment(provincesResponse.data, slug);

  if (!province) {
    notFound();
  }

  const page = getPositiveIntegerSearchParam(resolvedSearchParams.page, 1);
  const selectedCategorySlug = getOptionalSearchParam(resolvedSearchParams.categorySlug);
  const baseHref = `/provinces/${encodeURIComponent(createPersianPathSegment(province.name))}`;
  const entryQuery: PublicEntryListQuery = {
    page,
    limit: PAGE_LIMIT,
    sort: "newest",
    provinceSlug: province.slug,
    geographicScope: "PROVINCE",
    categorySlug: selectedCategorySlug,
  };

  const [entries, categoryCounts] = await Promise.all([
    getPublishedEntries(entryQuery),
    Promise.all(
      sortTaxonomyItems(categoriesResponse.data).map(async (category) => {
        const { count, isUnavailable } = await getPublishedEntryCount({
          provinceSlug: province.slug,
          geographicScope: "PROVINCE",
          categorySlug: category.slug,
        });

        return {
          ...category,
          entryCount: count,
          isUnavailable,
          href: createProvinceHref(baseHref, { categorySlug: category.slug }),
          isActive: selectedCategorySlug === category.slug,
        };
      }),
    ),
  ]);
  const categoryFilters = categoryCounts.filter((category) => category.entryCount > 0);

  return (
    <PageTransition>
      <ProvinceDetailContent
        province={province}
        entries={entries}
        categoryFilters={categoryFilters}
        allCategoriesHref={baseHref}
        isAllCategoriesActive={!selectedCategorySlug}
        createPageHref={(nextPage) =>
          createProvinceHref(baseHref, {
            categorySlug: selectedCategorySlug,
            page: nextPage,
          })
        }
        isUnavailable={
          provincesResponse.isUnavailable ||
          categoriesResponse.isUnavailable ||
          entries.isUnavailable ||
          categoryCounts.some((category) => category.isUnavailable)
        }
      />
    </PageTransition>
  );
}

async function getProvinceByRouteSegment(slug: string) {
  const provincesResponse = await getPublicProvinces();

  return findTaxonomyItemByRouteSegment(provincesResponse.data, slug);
}

function createProvinceHref(
  baseHref: string,
  query: {
    categorySlug?: string;
    page?: number;
  },
) {
  const searchParams = new URLSearchParams();

  if (query.categorySlug) {
    searchParams.set("categorySlug", query.categorySlug);
  }

  if (query.page && query.page > 1) {
    searchParams.set("page", String(query.page));
  }

  const queryString = searchParams.toString();

  return queryString ? `${baseHref}?${queryString}` : baseHref;
}
