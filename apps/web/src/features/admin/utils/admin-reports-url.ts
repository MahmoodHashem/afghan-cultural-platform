import { adminReportReasons } from "@/features/admin/constants/admin-report-meta";
import type {
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from "@/features/moderation/types/content-moderation";

type AdminReportsQuery = {
  page: number;
  limit: number;
  status?: ReportStatus;
  targetType?: ReportTargetType;
  reason?: ReportReason;
};

const statuses = new Set<ReportStatus>(["OPEN", "UNDER_REVIEW", "RESOLVED"]);
const targetTypes = new Set<ReportTargetType>(["ENTRY", "COMMENT"]);
const reasons = new Set<ReportReason>(adminReportReasons);

function parseAdminReportsQuery(searchParams: URLSearchParams): AdminReportsQuery {
  const page = Number(searchParams.get("page"));
  const status = searchParams.get("status") as ReportStatus | null;
  const targetType = searchParams.get("targetType") as ReportTargetType | null;
  const reason = searchParams.get("reason") as ReportReason | null;

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: 20,
    status: status && statuses.has(status) ? status : undefined,
    targetType: targetType && targetTypes.has(targetType) ? targetType : undefined,
    reason: reason && reasons.has(reason) ? reason : undefined,
  };
}

function createAdminReportsHref(current: URLSearchParams, updates: Partial<AdminReportsQuery>) {
  const params = new URLSearchParams(current);
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === null || (key === "page" && value === 1)) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  }
  params.delete("limit");
  const query = params.toString();
  return query ? `/admin/reports?${query}` : "/admin/reports";
}

export type { AdminReportsQuery };
export { createAdminReportsHref, parseAdminReportsQuery };
