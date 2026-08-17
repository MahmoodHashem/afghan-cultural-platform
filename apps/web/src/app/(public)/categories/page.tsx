import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/page-transition";
import {
  getPublicCategories,
  getPublishedEntryCount,
} from "@/features/entries/api/public-entries-api";
import { CategoriesIndexContent } from "@/features/entries/components/taxonomy-discovery-pages";
import type { TaxonomyItem } from "@/features/entries/types/public-entry";

export const metadata: Metadata = {
  title: "موضوع‌ها | میراث افغانستان",
  description: "مطالب فرهنگی افغانستان را بر اساس موضوع ببینید.",
  openGraph: {
    title: "موضوع‌ها | میراث افغانستان",
    description: "مطالب فرهنگی افغانستان را بر اساس موضوع ببینید.",
    images: ["/images/herat-grand-mosque.webp"],
  },
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
    <PageTransition>
      <CategoriesIndexContent
        categories={countedCategories}
        isUnavailable={
          categoriesResponse.isUnavailable ||
          countedCategories.some((category) => category.isUnavailable)
        }
      />
    </PageTransition>
  );
}

function sortTaxonomyItems(items: TaxonomyItem[]) {
  return [...items].sort((first, second) => {
    const firstOrder = first.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const secondOrder = second.sortOrder ?? Number.MAX_SAFE_INTEGER;

    return firstOrder - secondOrder || first.name.localeCompare(second.name, "fa");
  });
}
