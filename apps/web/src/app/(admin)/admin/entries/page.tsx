import { AdminPlaceholderPage } from "@/features/admin/components/admin-placeholder-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

export const metadata = createAdminMetadata("مطالب");

export default function AdminEntriesPage() {
  return <AdminPlaceholderPage title="مطالب" />;
}
