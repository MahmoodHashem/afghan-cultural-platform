import type { Metadata } from "next";

import { getHomeData } from "@/features/home/api/home-api";
import { HomeContent } from "@/features/home/components/home-content";
import { HomeFooter } from "@/features/home/components/home-footer";
import { HomeHero } from "@/features/home/components/home-hero";

export const metadata: Metadata = {
  title: "میراث افغانستان | فرهنگ و تاریخ افغانستان",
  description:
    "جایی برای خواندن و ثبت مطالبی درباره فرهنگ، تاریخ، ولایت‌ها، شخصیت‌ها و دانش محلی افغانستان.",
  openGraph: {
    title: "میراث افغانستان",
    description: "جایی برای گردآوری و شناخت فرهنگ افغانستان.",
    images: ["/images/HERAT02.jpg"],
  },
};

export default async function Home() {
  const homeData = await getHomeData();

  return (
    <main className="min-h-screen bg-background">
      <HomeHero />
      <HomeContent data={homeData} />
      <HomeFooter />
    </main>
  );
}
