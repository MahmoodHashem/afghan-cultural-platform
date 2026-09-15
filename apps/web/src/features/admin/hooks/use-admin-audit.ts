"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { listAdminAudit } from "@/features/admin/api/admin-audit-api";
import { adminAuditQueryKeys } from "@/features/admin/constants/admin-audit-query-keys";
import type { AdminAuditQuery } from "@/features/admin/types/admin-audit";

function useAdminAudit(query: AdminAuditQuery) {
  return useQuery({
    queryKey: adminAuditQueryKeys.list(query),
    queryFn: ({ signal }) => listAdminAudit(query, signal),
    placeholderData: keepPreviousData,
  });
}

export { useAdminAudit };
