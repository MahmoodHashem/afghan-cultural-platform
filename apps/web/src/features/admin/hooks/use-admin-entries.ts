"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  archiveAdminEntry,
  getAdminEntry,
  getAdminEntryTaxonomy,
  listAdminEntries,
  restoreAdminEntry,
} from "@/features/admin/api/admin-entries-api";
import { adminEntriesQueryKeys } from "@/features/admin/constants/admin-entries-query-keys";
import { adminOverviewQueryKeys } from "@/features/admin/constants/admin-overview-query-keys";
import type {
  AdminEntriesQuery,
  AdminEntryLifecycleInput,
} from "@/features/admin/types/admin-entries";
import { getAdminEntryErrorMessage } from "@/features/admin/utils/admin-entry-errors";

function useAdminEntries(query: AdminEntriesQuery) {
  return useQuery({
    queryKey: adminEntriesQueryKeys.list(query),
    queryFn: ({ signal }) => listAdminEntries(query, signal),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

function useAdminEntry(entryId: string) {
  return useQuery({
    queryKey: adminEntriesQueryKeys.detail(entryId),
    queryFn: ({ signal }) => getAdminEntry(entryId, signal),
    enabled: Boolean(entryId),
    staleTime: 30_000,
  });
}

function useAdminEntryTaxonomy() {
  return useQuery({
    queryKey: adminEntriesQueryKeys.taxonomy(),
    queryFn: ({ signal }) => getAdminEntryTaxonomy(signal),
    staleTime: 5 * 60_000,
  });
}

function useAdminEntryLifecycle(entryId: string, action: "archive" | "restore") {
  const queryClient = useQueryClient();
  const mutate = action === "archive" ? archiveAdminEntry : restoreAdminEntry;

  return useMutation({
    mutationFn: (input: AdminEntryLifecycleInput) => mutate(entryId, input),
    onSuccess: async () => {
      toast.success(action === "archive" ? "مطلب بایگانی شد." : "مطلب دوباره منتشر شد.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminEntriesQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: adminEntriesQueryKeys.detail(entryId) }),
        queryClient.invalidateQueries({ queryKey: adminOverviewQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["public-entries"] }),
      ]);
    },
    onError: (error) => toast.error(getAdminEntryErrorMessage(error)),
  });
}

export { useAdminEntries, useAdminEntry, useAdminEntryLifecycle, useAdminEntryTaxonomy };
