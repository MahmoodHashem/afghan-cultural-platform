import { AdminPlaceholderPage } from "@/features/admin/components/admin-placeholder-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

export const metadata = createAdminMetadata("نمای کلی");

export default function AdminOverviewPage() {
  return <AdminPlaceholderPage title="نمای کلی" />;
}
