import { PageTransition } from "@/components/layout/page-transition";
import { AdminOverviewPage } from "@/features/admin/components/admin-overview-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

export const metadata = createAdminMetadata("نمای کلی");

export default function AdminOverviewRoute() {
  return (
    <PageTransition>
      <AdminOverviewPage />
    </PageTransition>
  );
}
