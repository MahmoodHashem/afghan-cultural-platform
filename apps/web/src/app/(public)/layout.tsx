import { PublicHeader } from "@/components/layout/public-header";
import { EntryBreadcrumbTracker } from "@/features/entries/components/entry-breadcrumb-tracker";
import { HomeFooter } from "@/features/home/components/home-footer";

function PublicShellLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background">
      <EntryBreadcrumbTracker />
      <PublicHeader />
      {children}
      <HomeFooter />
    </div>
  );
}

export default PublicShellLayout;
