import { PageTransition } from "@/components/layout/page-transition";
import { AdminReportsPage as AdminReportsView } from "@/features/admin/components/admin-reports-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

export const metadata = createAdminMetadata("گزارش‌ها");

export default function AdminReportsPage() {
  return (
    <PageTransition>
      <AdminReportsView />
    </PageTransition>
  );
}
