import { Badge } from "@/components/ui/badge";
import {
  adminReportStatusClasses,
  adminReportStatusLabels,
} from "@/features/admin/constants/admin-report-meta";
import type { ReportStatus } from "@/features/moderation/types/content-moderation";

function AdminReportStatusBadge({ status }: { status: ReportStatus }) {
  return (
    <Badge variant="outline" className={adminReportStatusClasses[status]}>
      {adminReportStatusLabels[status]}
    </Badge>
  );
}

export { AdminReportStatusBadge };
