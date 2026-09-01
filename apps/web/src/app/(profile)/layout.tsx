import type { Metadata } from "next";

import { PublicHeader } from "@/components/layout/public-header";
import { HomeFooter } from "@/features/home/components/home-footer";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function ProfileShellLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main id="main-content" className="pt-[calc(4.75rem+env(safe-area-inset-top))] lg:pt-32">
        {children}
      </main>
      <HomeFooter />
    </div>
  );
}

export default ProfileShellLayout;
