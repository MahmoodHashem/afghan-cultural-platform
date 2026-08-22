import { AdminPlaceholderPage } from "@/features/admin/components/admin-placeholder-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

export const metadata = createAdminMetadata("موضوع‌ها");

export default function AdminTopicsPage() {
  return <AdminPlaceholderPage title="موضوع‌ها" />;
}
