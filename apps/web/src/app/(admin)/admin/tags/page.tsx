import { PageTransition } from "@/components/layout/page-transition";
import { AdminTagsPage as AdminTagsView } from "@/features/admin/components/admin-tags-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

export const metadata = createAdminMetadata("برچسب‌ها");

export default function AdminTagsRoute() {
  return (
    <PageTransition>
      <AdminTagsView />
    </PageTransition>
  );
}
