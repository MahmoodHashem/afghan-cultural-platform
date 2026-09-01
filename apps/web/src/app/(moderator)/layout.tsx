import type { Metadata } from "next";

import { PublicHeader } from "@/components/layout/public-header";
import { HomeFooter } from "@/features/home/components/home-footer";
import { ModeratorNavigation } from "@/features/moderation/components/moderator-navigation";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function ModeratorShellLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main id="main-content" className="pt-28 sm:pt-32">
        <ModeratorNavigation />
        {children}
      </main>
      <HomeFooter />
    </div>
  );
}

export default ModeratorShellLayout;
