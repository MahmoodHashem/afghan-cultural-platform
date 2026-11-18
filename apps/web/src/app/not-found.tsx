import { ArrowLeftIcon, HomeIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import type { Metadata } from "next";
import Link from "next/link";

import { StatusPage } from "@/components/common/status-page";
import { PublicHeader } from "@/components/layout/public-header";
import { buttonVariants } from "@/components/ui/button";
import { HomeFooter } from "@/features/home/components/home-footer";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />
      <main id="main-content">
        <StatusPage
          code="۴۰۴"
          eyebrow="راه را گم کرده‌ایم"
          title="این صفحه پیدا نشد"
          word="جست‌وجو"
          description={
            <>
              شاید نشانی تغییر کرده یا مطلب هنوز نوشته نشده باشد. اگر چیزی درباره‌ی موضوعی که دنبالش
              بودید می‌دانید، شاید شما نخستین کسی باشید که آن را ثبت می‌کند.
            </>
          }
          actions={
            <>
              <Link href="/" className={cn(buttonVariants({ variant: "pill" }), "h-11.5 px-5")}>
                <HomeIcon className="size-4.5" aria-hidden="true" />
                بازگشت به خانه
              </Link>
              <Link href="/explore" className={cn(buttonVariants({ variant: "glass" }), "h-11.5")}>
                گشتی در بایگانی
                <ArrowLeftIcon className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/entries/new"
                className="inline-flex items-center gap-1.5 px-2 text-[13.5px] font-bold text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold"
              >
                <PencilSquareIcon className="size-4" aria-hidden="true" />
                نوشتن یک مطلب تازه
              </Link>
            </>
          }
        >
          <form action="/explore" role="search" className="max-w-md pt-3">
            <label htmlFor="not-found-search" className="sr-only">
              جست‌وجو در مطالب
            </label>
            <input
              id="not-found-search"
              name="search"
              type="search"
              placeholder="جست‌وجو در فرهنگ افغانستان..."
              className="h-11.5 w-full rounded-full border border-white/20 bg-white/10 px-5 text-[14px] text-white outline-none placeholder:text-white/50 focus-visible:border-white/50 focus-visible:bg-white/14"
            />
          </form>
        </StatusPage>
      </main>
      <HomeFooter />
    </div>
  );
}
