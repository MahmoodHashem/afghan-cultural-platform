import { PageTransition } from "@/components/layout/page-transition";
import { AdminTopicsPage as AdminTopicsView } from "@/features/admin/components/admin-topics-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

export const metadata = createAdminMetadata("موضوع‌ها");

export default function AdminTopicsRoute() {
  return (
    <PageTransition>
      <AdminTopicsView />
    </PageTransition>
  );
}
