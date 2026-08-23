import { AdminProvinceDetailPage } from "@/features/admin/components/admin-province-detail-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

export const metadata = createAdminMetadata("جزئیات ولایت");

export default async function ProvinceDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminProvinceDetailPage provinceId={id} />;
}
