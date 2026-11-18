import type { Metadata } from "next";

import { PublicHeader } from "@/components/layout/public-header";
import { HomeFooter } from "@/features/home/components/home-footer";
import { ModeratorNavigation } from "@/features/moderation/components/moderator-navigation";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function ModeratorShellLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-paper">
      <PublicHeader />
      <main id="main-content">
        <div className="relative isolate overflow-hidden bg-linear-155 from-hero-navy to-hero-navy-deep pt-[calc(3.5rem+env(safe-area-inset-top)+1.5rem)] pb-14 text-white lg:pt-[calc(4.125rem+2.25rem)]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -end-[0.04em] -bottom-[0.3em] -z-10 font-calli text-[150px] leading-none whitespace-nowrap text-white opacity-[0.08] select-none max-lg:text-[100px]"
          >
            امانت
          </span>
          <div className="content-container space-y-1.5">
            <p className="font-hand text-[19px] text-gold">میز بررسی محتوا</p>
            <p className="max-w-[60ch] text-[14px] leading-[2] text-white/78">
              هر بررسی دقیق و محترمانه، اعتماد مردم به میراث را بیشتر می‌کند و نویسندگان را به
              نوشتن دوباره دلگرم.
            </p>
          </div>
        </div>
        <ModeratorNavigation />
        <div className="pt-8">{children}</div>
      </main>
      <HomeFooter />
    </div>
  );
}

export default ModeratorShellLayout;
