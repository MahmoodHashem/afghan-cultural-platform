import { AdminPlaceholderPage } from "@/features/admin/components/admin-placeholder-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

export const metadata = createAdminMetadata("ناظران");

export default function AdminModeratorsPage() {
  return <AdminPlaceholderPage title="ناظران" />;
}
