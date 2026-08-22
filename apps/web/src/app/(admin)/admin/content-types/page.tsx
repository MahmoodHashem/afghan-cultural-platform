import { AdminPlaceholderPage } from "@/features/admin/components/admin-placeholder-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

export const metadata = createAdminMetadata("نوع مطلب");

export default function AdminContentTypesPage() {
  return <AdminPlaceholderPage title="نوع مطلب" />;
}
