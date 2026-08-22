import { AdminPlaceholderPage } from "@/features/admin/components/admin-placeholder-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

export const metadata = createAdminMetadata("کاربران");

export default function AdminUsersPage() {
  return <AdminPlaceholderPage title="کاربران" />;
}
