import { AdminPlaceholderPage } from "@/features/admin/components/admin-placeholder-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

export const metadata = createAdminMetadata("گزارش‌ها");

export default function AdminReportsPage() {
  return <AdminPlaceholderPage title="گزارش‌ها" />;
}
