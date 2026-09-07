import { PageTransition } from "@/components/layout/page-transition";
import { AdminModeratorsPage } from "@/features/admin/components/admin-moderators-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

export const metadata = createAdminMetadata("ناظران");

export default function AdminModeratorsRoute() {
  return (
    <PageTransition>
      <AdminModeratorsPage />
    </PageTransition>
  );
}
