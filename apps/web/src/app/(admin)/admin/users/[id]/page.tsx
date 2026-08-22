import { AdminUserDetailPage } from "@/features/admin/components/admin-user-detail-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

type AdminUserDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export const metadata = createAdminMetadata("جزئیات کاربر");

export default async function AdminUserDetailRoute({ params }: AdminUserDetailRouteProps) {
  const { id } = await params;
  return <AdminUserDetailPage userId={id} />;
}
