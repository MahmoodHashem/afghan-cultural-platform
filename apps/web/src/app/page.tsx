import type { Metadata } from "next";

import { getHomeData } from "@/features/home/api/home-api";
import { HomeContent } from "@/features/home/components/home-content";
import { HomeFooter } from "@/features/home/components/home-footer";
import { HomeHero } from "@/features/home/components/home-hero";

export const metadata: Metadata = {
  title: "میراث افغانستان | کتابخانه فرهنگ و تاریخ افغانستان",
  description:
    "کاوش و ثبت میراث فرهنگی افغانستان؛ روایت‌ها، ولایت‌ها، شخصیت‌ها، بناها و دانش محلی در یک کتابخانه عمومی و تأییدشده.",
  openGraph: {
    title: "میراث افغانستان",
    description:
      "کتابخانه عمومی برای حفظ و کاوش میراث فرهنگی افغانستان با محتوای منتشرشده و تأییدشده.",
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
