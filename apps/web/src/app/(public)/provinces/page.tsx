import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/page-transition";
import {
  getPublicProvinces,
  getPublishedEntryCount,
} from "@/features/entries/api/public-entries-api";
import { ProvinceIndexContent } from "@/features/entries/components/taxonomy-discovery-pages";
import { sortTaxonomyItems } from "@/features/entries/utils/taxonomy";
import { publicOpenGraphDefaults } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "ولایت‌ها",
  description: "با فرهنگ و میراث ولایت‌های افغانستان آشنا شوید.",
  alternates: { canonical: "/provinces" },
  openGraph: {
    ...publicOpenGraphDefaults,
    type: "website",
    title: "ولایت‌ها | میراث افغانستان",
    description: "با فرهنگ و میراث ولایت‌های افغانستان آشنا شوید.",
    images: ["/images/HERAT02.jpg"],
  },
};

export default async function ProvincesPage() {
  const provincesResponse = await getPublicProvinces();
  const provinces = sortTaxonomyItems(provincesResponse.data);
  const countedProvinces = await Promise.all(
    provinces.map(async (province) => {
      const { count, isUnavailable } = await getPublishedEntryCount({
        provinceSlug: province.slug,
        geographicScope: "PROVINCE",
      });

      return {
        ...province,
        entryCount: count,
        isUnavailable,
      };
    }),
  );

  return (
    <PageTransition>
      <ProvinceIndexContent
        provinces={countedProvinces}
        isUnavailable={
          provincesResponse.isUnavailable ||
          countedProvinces.some((province) => province.isUnavailable)
        }
      />
    </PageTransition>
  );
}
