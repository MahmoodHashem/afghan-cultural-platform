import type { AdminAuditQuery, AdminAuditResponse } from "@/features/admin/types/admin-audit";
import { apiRequest } from "@/lib/api/api-client";
import { setOptionalSearchParam } from "@/lib/utils/url-search-params";

function listAdminAudit(query: AdminAuditQuery, signal?: AbortSignal) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    setOptionalSearchParam(params, key, value);
  }
  return apiRequest<AdminAuditResponse>(`/admin/audit?${params}`, { signal });
}

export { listAdminAudit };
