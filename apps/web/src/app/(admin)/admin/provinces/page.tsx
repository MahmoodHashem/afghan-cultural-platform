import { AdminPlaceholderPage } from "@/features/admin/components/admin-placeholder-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

export const metadata = createAdminMetadata("ولایت‌ها");

export default function AdminProvincesPage() {
  return <AdminPlaceholderPage title="ولایت‌ها" />;
}
