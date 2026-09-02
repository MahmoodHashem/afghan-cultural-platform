import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageTransition } from "@/components/layout/page-transition";
import {
  getPublicCategories,
  getPublicDistricts,
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
import { JsonLd } from "@/lib/seo/json-ld";
import {
  createCanonicalPath,
  createRobotsMetadata,
  createSocialMetadata,
  hasFunctionalSearchParams,
} from "@/lib/seo/metadata";
import { createCollectionStructuredData } from "@/lib/seo/structured-data";
import { createPersianPathSegment } from "@/lib/utils/persian";
import ProvinceDetailLoading from "./loading";

type ProvinceDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const PAGE_LIMIT = 8;
const PROVINCE_FUNCTIONAL_SEARCH_PARAMS = ["page", "categorySlug", "districtSlug"] as const;

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
    ...createSocialMetadata({
      title: `${province.name} | میراث افغانستان`,
      description,
      canonicalPath,
      image: { url: image.src, alt: image.alt },
    }),
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
  const requestedDistrictSlug = getOptionalSearchParam(resolvedSearchParams.districtSlug);
  const baseHref = `/provinces/${encodeURIComponent(createPersianPathSegment(province.name))}`;
  const canonicalPath = createCanonicalPath("provinces", createPersianPathSegment(province.name));
  const isFiltered = hasFunctionalSearchParams(
    resolvedSearchParams,
    PROVINCE_FUNCTIONAL_SEARCH_PARAMS,
  );
  const districtsResponse = await getPublicDistricts(province.slug);
  const selectedDistrict = districtsResponse.data.find(
    (district) => district.slug === requestedDistrictSlug,
  );
  const selectedDistrictSlug = selectedDistrict?.slug;
  const entryQuery: PublicEntryListQuery = {
    page,
    limit: PAGE_LIMIT,
    sort: "newest",
    provinceSlug: province.slug,
    districtSlug: selectedDistrictSlug,
    geographicScope: "PROVINCE",
    categorySlug: selectedCategorySlug,
  };

  const [entries, provinceEntryCount, categoryCounts] = await Promise.all([
    getPublishedEntries(entryQuery),
    getPublishedEntryCount({
      provinceSlug: province.slug,
      geographicScope: "PROVINCE",
    }),
    Promise.all(
      sortTaxonomyItems(categoriesResponse.data).map(async (category) => {
        const { count, isUnavailable } = await getPublishedEntryCount({
          provinceSlug: province.slug,
          districtSlug: selectedDistrictSlug,
          geographicScope: "PROVINCE",
          categorySlug: category.slug,
        });

        return {
          ...category,
          entryCount: count,
          isUnavailable,
          href: createProvinceHref(baseHref, {
            categorySlug: category.slug,
            districtSlug: selectedDistrictSlug,
          }),
          isActive: selectedCategorySlug === category.slug,
        };
      }),
    ),
  ]);
  const categoryFilters = categoryCounts.filter((category) => category.entryCount > 0);
  const allCategoriesHref = createProvinceHref(baseHref, {
    districtSlug: selectedDistrictSlug,
  });
  const allDistrictsHref = createProvinceHref(baseHref, {
    categorySlug: selectedCategorySlug,
  });
  const districtLinks = districtsResponse.data.map((district) => ({
    id: district.id,
    name: district.name,
    slug: district.slug,
    href: createProvinceHref(baseHref, {
      districtSlug: district.slug,
    }),
    isActive: district.slug === selectedDistrictSlug,
  }));

  return (
    <>
      {!isFiltered && !entries.isUnavailable ? (
        <JsonLd
          data={createCollectionStructuredData({
            name: `مطالب فرهنگی ولایت ${province.name}`,
            description: province.description || `مطالب منتشرشده درباره ولایت ${province.name}.`,
            canonicalPath,
            breadcrumbs: [
              { name: "خانه", path: "/" },
              { name: "ولایت‌ها", path: "/provinces" },
              { name: province.name, path: canonicalPath },
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
        <ProvinceDetailContent
          province={province}
          entries={entries}
          provinceEntryCount={provinceEntryCount.count}
          districts={districtLinks}
          categoryFilters={categoryFilters}
          allCategoriesHref={allCategoriesHref}
          allDistrictsHref={allDistrictsHref}
          isAllCategoriesActive={!selectedCategorySlug}
          selectedDistrictName={selectedDistrict?.name}
          createPageHref={(nextPage) =>
            createProvinceHref(baseHref, {
              categorySlug: selectedCategorySlug,
              districtSlug: selectedDistrictSlug,
              page: nextPage,
            })
          }
          isUnavailable={
            provincesResponse.isUnavailable ||
            categoriesResponse.isUnavailable ||
            districtsResponse.isUnavailable ||
            entries.isUnavailable ||
            provinceEntryCount.isUnavailable ||
            categoryCounts.some((category) => category.isUnavailable)
          }
        />
      </PageTransition>
    </>
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
    districtSlug?: string;
    page?: number;
  },
) {
  const searchParams = new URLSearchParams();

  if (query.categorySlug) {
    searchParams.set("categorySlug", query.categorySlug);
  }

  if (query.districtSlug) {
    searchParams.set("districtSlug", query.districtSlug);
  }

  if (query.page && query.page > 1) {
    searchParams.set("page", String(query.page));
  }

  const queryString = searchParams.toString();

  return queryString ? `${baseHref}?${queryString}` : baseHref;
}
