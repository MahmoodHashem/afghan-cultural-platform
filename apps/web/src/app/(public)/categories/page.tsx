import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/page-transition";
import {
  getPublicCategories,
  getPublishedEntryCount,
} from "@/features/entries/api/public-entries-api";
import { CategoriesIndexContent } from "@/features/entries/components/taxonomy-discovery-pages";
import { sortTaxonomyItems } from "@/features/entries/utils/taxonomy";
import { JsonLd } from "@/lib/seo/json-ld";
import { createCanonicalPath, createSocialMetadata } from "@/lib/seo/metadata";
import { createCollectionStructuredData } from "@/lib/seo/structured-data";
import { createPersianPathSegment } from "@/lib/utils/persian";

const CATEGORIES_DESCRIPTION = "مطالب فرهنگی افغانستان را بر اساس موضوع ببینید.";

export const metadata: Metadata = {
  title: "موضوع‌ها",
  description: CATEGORIES_DESCRIPTION,
  alternates: { canonical: "/categories" },
  ...createSocialMetadata({
    title: "موضوع‌ها | میراث افغانستان",
    description: CATEGORIES_DESCRIPTION,
    canonicalPath: "/categories",
  }),
};

export default async function CategoriesPage() {
  const categoriesResponse = await getPublicCategories();
  const categories = sortTaxonomyItems(categoriesResponse.data);
  const countedCategories = await Promise.all(
    categories.map(async (category) => {
      const { count, isUnavailable } = await getPublishedEntryCount({
        categorySlug: category.slug,
      });

      return {
        ...category,
        entryCount: count,
        isUnavailable,
      };
    }),
  );

  return (
    <>
      {!categoriesResponse.isUnavailable ? (
        <JsonLd
          data={createCollectionStructuredData({
            name: "موضوع‌های فرهنگی افغانستان",
            description: CATEGORIES_DESCRIPTION,
            canonicalPath: "/categories",
            breadcrumbs: [
              { name: "خانه", path: "/" },
              { name: "موضوع‌ها", path: "/categories" },
            ],
            items: categories.map((category) => ({
              name: category.name,
              path: createCanonicalPath("categories", createPersianPathSegment(category.name)),
            })),
            totalItems: categories.length,
          })}
        />
      ) : null}
      <PageTransition>
        <CategoriesIndexContent
          categories={countedCategories}
          isUnavailable={
            categoriesResponse.isUnavailable ||
            countedCategories.some((category) => category.isUnavailable)
          }
        />
      </PageTransition>
    </>
  );
}
