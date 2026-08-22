import type { AdminOverviewResponse } from "@/features/admin/types/admin-overview";
import { apiRequest } from "@/lib/api/api-client";

async function getAdminOverview(signal?: AbortSignal) {
  const response = await apiRequest<AdminOverviewResponse>("/admin/overview", {
    method: "GET",
    signal,
  });

  return response.data;
}

export { getAdminOverview };
