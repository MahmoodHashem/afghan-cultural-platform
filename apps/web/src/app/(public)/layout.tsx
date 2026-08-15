import { PublicHeader } from "@/components/layout/public-header";

function PublicShellLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      {children}
    </div>
  );
}

export default PublicShellLayout;
