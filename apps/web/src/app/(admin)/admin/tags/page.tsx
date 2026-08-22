import { AdminPlaceholderPage } from "@/features/admin/components/admin-placeholder-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

export const metadata = createAdminMetadata("برچسب‌ها");

export default function AdminTagsPage() {
  return <AdminPlaceholderPage title="برچسب‌ها" />;
}
