import { AdminProvincesPage as AdminProvincesView } from "@/features/admin/components/admin-provinces-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

export const metadata = createAdminMetadata("ولایت‌ها");

export default function AdminProvincesPage() {
  return <AdminProvincesView />;
}
