"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminOverview } from "@/features/admin/api/admin-overview-api";
import { adminOverviewQueryKeys } from "@/features/admin/constants/admin-overview-query-keys";
import { mapAdminOverview } from "@/features/admin/mappers/admin-overview-mapper";

function useAdminOverview() {
  return useQuery({
    queryKey: adminOverviewQueryKeys.detail(),
    queryFn: ({ signal }) => getAdminOverview(signal),
    select: mapAdminOverview,
    staleTime: 60_000,
  });
}

export { useAdminOverview };
