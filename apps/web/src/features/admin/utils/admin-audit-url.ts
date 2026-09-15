import { adminAuditActions } from "@/features/admin/constants/admin-audit-meta";
import type { AdminAuditAction, AdminAuditQuery } from "@/features/admin/types/admin-audit";

const actions = new Set<AdminAuditAction>(adminAuditActions);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseAdminAuditQuery(searchParams: URLSearchParams): AdminAuditQuery {
  const page = Number(searchParams.get("page"));
  const action = searchParams.get("action") as AdminAuditAction | null;
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const search = searchParams.get("search")?.trim();
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: 20,
    search: search ? search.slice(0, 120) : undefined,
    action: action && actions.has(action) ? action : undefined,
    dateFrom: dateFrom && DATE_PATTERN.test(dateFrom) ? dateFrom : undefined,
    dateTo: dateTo && DATE_PATTERN.test(dateTo) ? dateTo : undefined,
  };
}

function createAdminAuditHref(current: URLSearchParams, updates: Partial<AdminAuditQuery>) {
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
  return query ? `/admin/audit?${query}` : "/admin/audit";
}

export { createAdminAuditHref, parseAdminAuditQuery };
