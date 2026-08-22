import { PageTransition } from "@/components/layout/page-transition";
import { AdminEntriesPage } from "@/features/admin/components/admin-entries-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

export const metadata = createAdminMetadata("مطالب");

export default function AdminEntriesRoute() {
  return (
    <PageTransition>
      <AdminEntriesPage />
    </PageTransition>
  );
}
