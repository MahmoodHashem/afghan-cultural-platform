import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/page-transition";
import {
  getPublicProvinces,
  getPublishedEntryCount,
} from "@/features/entries/api/public-entries-api";
import { ProvinceIndexContent } from "@/features/entries/components/taxonomy-discovery-pages";
import { sortTaxonomyItems } from "@/features/entries/utils/taxonomy";
import { JsonLd } from "@/lib/seo/json-ld";
import { createCanonicalPath, createSocialMetadata } from "@/lib/seo/metadata";
import { createCollectionStructuredData } from "@/lib/seo/structured-data";
import { createPersianPathSegment } from "@/lib/utils/persian";

const PROVINCES_DESCRIPTION = "با فرهنگ و میراث ولایت‌های افغانستان آشنا شوید.";

export const metadata: Metadata = {
  title: "ولایت‌ها",
  description: PROVINCES_DESCRIPTION,
  alternates: { canonical: "/provinces" },
  ...createSocialMetadata({
    title: "ولایت‌ها | میراث افغانستان",
    description: PROVINCES_DESCRIPTION,
    canonicalPath: "/provinces",
  }),
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
    <>
      {!provincesResponse.isUnavailable ? (
        <JsonLd
          data={createCollectionStructuredData({
            name: "ولایت‌های افغانستان",
            description: PROVINCES_DESCRIPTION,
            canonicalPath: "/provinces",
            breadcrumbs: [
              { name: "خانه", path: "/" },
              { name: "ولایت‌ها", path: "/provinces" },
            ],
            items: provinces.map((province) => ({
              name: province.name,
              path: createCanonicalPath("provinces", createPersianPathSegment(province.name)),
            })),
            totalItems: provinces.length,
          })}
        />
      ) : null}
      <PageTransition>
        <ProvinceIndexContent
          provinces={countedProvinces}
          isUnavailable={
            provincesResponse.isUnavailable ||
            countedProvinces.some((province) => province.isUnavailable)
          }
        />
      </PageTransition>
    </>
  );
}
