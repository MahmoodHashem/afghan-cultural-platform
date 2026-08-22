import { AdminPlaceholderPage } from "@/features/admin/components/admin-placeholder-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

export const metadata = createAdminMetadata("تنظیمات");

export default function AdminSettingsPage() {
  return <AdminPlaceholderPage title="تنظیمات" />;
}
