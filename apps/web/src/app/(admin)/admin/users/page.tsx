import { PageTransition } from "@/components/layout/page-transition";
import { AdminUsersPage } from "@/features/admin/components/admin-users-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

export const metadata = createAdminMetadata("کاربران");

export default function AdminUsersRoute() {
  return <PageTransition><AdminUsersPage /></PageTransition>;
}
