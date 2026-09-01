import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/page-transition";
import {
  getPublicCategories,
  getPublishedEntryCount,
} from "@/features/entries/api/public-entries-api";
import { CategoriesIndexContent } from "@/features/entries/components/taxonomy-discovery-pages";
import { sortTaxonomyItems } from "@/features/entries/utils/taxonomy";
import { publicOpenGraphDefaults } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "موضوع‌ها",
  description: "مطالب فرهنگی افغانستان را بر اساس موضوع ببینید.",
  alternates: { canonical: "/categories" },
  openGraph: {
    ...publicOpenGraphDefaults,
    type: "website",
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
