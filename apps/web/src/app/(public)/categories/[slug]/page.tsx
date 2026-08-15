import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  type GeographicScope,
  getPublicCategories,
  getPublicProvinces,
  getPublishedEntries,
  getPublishedEntryCount,
  type PublicEntryListQuery,
  type PublicEntrySort,
} from "@/features/entries/api/public-entries-api";
import {
  CategoryDetailContent,
  createPersianPathSegment,
} from "@/features/entries/components/taxonomy-discovery-pages";
import type { TaxonomyItem } from "@/features/entries/types/public-entry";

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
      title: "دسته‌بندی پیدا نشد | میراث افغانستان",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${category.name} | دسته‌بندی‌ها | میراث افغانستان`,
    description: `کاوش محتوای فرهنگی افغانستان در دسته‌بندی ${category.name}.`,
    openGraph: {
      title: `${category.name} | میراث افغانستان`,
      description: `مدخل‌های منتشرشده درباره ${category.name}.`,
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

  const page = getPositiveInteger(resolvedSearchParams.page, 1);
  const sort = getSort(resolvedSearchParams.sort);
  const selectedProvinceSlug = getOptionalString(resolvedSearchParams.provinceSlug);
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

function sortTaxonomyItems(items: TaxonomyItem[]) {
  return [...items].sort((first, second) => {
    const firstOrder = first.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const secondOrder = second.sortOrder ?? Number.MAX_SAFE_INTEGER;

    return firstOrder - secondOrder || first.name.localeCompare(second.name, "fa");
  });
}
