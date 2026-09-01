import type { Metadata } from "next";

import { getHomeData } from "@/features/home/api/home-api";
import { HomeContent } from "@/features/home/components/home-content";
import { HomeFooter } from "@/features/home/components/home-footer";
import { HomeHero } from "@/features/home/components/home-hero";
import { MobileHomeDiscovery } from "@/features/home/components/mobile-home-discovery";
import { JsonLd } from "@/lib/seo/json-ld";
import { createSocialMetadata } from "@/lib/seo/metadata";
import { createHomeStructuredData } from "@/lib/seo/structured-data";

const HOME_DESCRIPTION =
  "جایی برای خواندن و ثبت مطالبی درباره فرهنگ، تاریخ، ولایت‌ها، مشاهیر و دانش محلی افغانستان.";

export const metadata: Metadata = {
  title: { absolute: "میراث افغانستان | فرهنگ و تاریخ افغانستان" },
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  ...createSocialMetadata({
    title: "میراث افغانستان | فرهنگ و تاریخ افغانستان",
    description: HOME_DESCRIPTION,
    canonicalPath: "/",
  }),
};

export default async function Home() {
  const homeData = await getHomeData();

  return (
    <main className="min-h-screen bg-background">
      <JsonLd data={createHomeStructuredData()} />
      <HomeHero />
      <MobileHomeDiscovery />
      <div data-mobile-home-feed>
        <HomeContent data={homeData} />
      </div>
      <HomeFooter />
    </main>
  );
}
