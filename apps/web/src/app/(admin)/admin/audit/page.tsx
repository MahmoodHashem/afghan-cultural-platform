import { PageTransition } from "@/components/layout/page-transition";
import { AdminAuditPage } from "@/features/admin/components/admin-audit-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

export const metadata = createAdminMetadata("تاریخچه فعالیت‌ها");

export default function AdminAuditRoute() {
  return (
    <PageTransition>
      <AdminAuditPage />
    </PageTransition>
  );
}
