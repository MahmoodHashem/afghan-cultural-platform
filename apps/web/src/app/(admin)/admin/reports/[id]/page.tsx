import { PageTransition } from "@/components/layout/page-transition";
import { AdminReportDetailPage } from "@/features/admin/components/admin-report-detail-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

type Props = { params: Promise<{ id: string }> };

export const metadata = createAdminMetadata("بررسی گزارش");

export default async function AdminReportDetailRoute({ params }: Props) {
  const { id } = await params;
  return (
    <PageTransition>
      <AdminReportDetailPage reportId={id} />
    </PageTransition>
  );
}
