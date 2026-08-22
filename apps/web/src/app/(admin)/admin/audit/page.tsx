import { AdminPlaceholderPage } from "@/features/admin/components/admin-placeholder-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

export const metadata = createAdminMetadata("تاریخچه فعالیت‌ها");

export default function AdminAuditPage() {
  return <AdminPlaceholderPage title="تاریخچه فعالیت‌ها" />;
}
