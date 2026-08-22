import { PageTransition } from "@/components/layout/page-transition";
import { AdminEntryDetailPage } from "@/features/admin/components/admin-entry-detail-page";
import { createAdminMetadata } from "@/features/admin/utils/admin-metadata";

type Props = { params: Promise<{ id: string }> };
export const metadata = createAdminMetadata("جزئیات مطلب");

export default async function AdminEntryDetailRoute({ params }: Props) {
  const { id } = await params;
  return (
    <PageTransition>
      <AdminEntryDetailPage entryId={id} />
    </PageTransition>
  );
}
