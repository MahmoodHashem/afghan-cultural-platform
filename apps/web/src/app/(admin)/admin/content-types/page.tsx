import { PageTransition } from "@/components/layout/page-transition";
import { AdminTopicsPage } from "@/features/admin/components/admin-topics-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

export const metadata = createAdminMetadata("نوع مطلب");

export default function AdminContentTypesPage() {
  return (
    <PageTransition>
      <AdminTopicsPage kind="contentTypes" />
    </PageTransition>
  );
}
