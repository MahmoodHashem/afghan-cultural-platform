import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getPublicCategories,
  getPublicProvinces,
  getPublishedEntries,
  getPublishedEntryCount,
  type PublicEntryListQuery,
} from "@/features/entries/api/public-entries-api";
import {
  createPersianPathSegment,
  ProvinceDetailContent,
} from "@/features/entries/components/taxonomy-discovery-pages";
import type { TaxonomyItem } from "@/features/entries/types/public-entry";

type ProvinceDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const PAGE_LIMIT = 8;

export async function generateMetadata({ params }: ProvinceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const province = await getProvinceByRouteSegment(slug);

  if (!province) {
    return {
      title: "ولایت پیدا نشد | میراث افغانستان",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${province.name} | ولایت‌ها | میراث افغانستان`,
    description: `مطالب مربوط به ${province.name}.`,
    openGraph: {
      title: `${province.name} | میراث افغانستان`,
      description: `مطالب مربوط به ${province.name}.`,
      images: ["/images/HERAT02.jpg"],
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

  const page = getPositiveInteger(resolvedSearchParams.page, 1);
  const selectedCategorySlug = getOptionalString(resolvedSearchParams.categorySlug);
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

function findTaxonomyItemByRouteSegment(items: TaxonomyItem[], segment: string) {
  const normalizedSegment = normalizeRouteSegment(segment);

  return items.find((item) => {
    return (
      normalizeRouteSegment(item.slug) === normalizedSegment ||
      normalizeRouteSegment(item.name) === normalizedSegment ||
      normalizeRouteSegment(createPersianPathSegment(item.name)) === normalizedSegment
    );
  });
}

function normalizeRouteSegment(value: string) {
  return safeDecodeURIComponent(value)
    .trim()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
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

function sortTaxonomyItems(items: TaxonomyItem[]) {
  return [...items].sort((first, second) => {
    const firstOrder = first.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const secondOrder = second.sortOrder ?? Number.MAX_SAFE_INTEGER;

    return firstOrder - secondOrder || first.name.localeCompare(second.name, "fa");
  });
}
