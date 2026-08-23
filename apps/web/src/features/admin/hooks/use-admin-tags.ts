"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createAdminTag,
  listAdminTags,
  setAdminTagActive,
  updateAdminTag,
} from "@/features/admin/api/admin-tags-api";
import { adminEntriesQueryKeys } from "@/features/admin/constants/admin-entries-query-keys";
import { adminTagsQueryKeys } from "@/features/admin/constants/admin-tags-query-keys";
import type { AdminTagInput, AdminTagsQuery } from "@/features/admin/types/admin-tags";
import { getAdminTagErrorMessage } from "@/features/admin/utils/admin-tag-errors";

function useAdminTags(query: AdminTagsQuery) {
  return useQuery({
    queryKey: adminTagsQueryKeys.list(query),
    queryFn: ({ signal }) => listAdminTags(query, signal),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

function useCreateAdminTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminTagInput) => createAdminTag(input),
    onSuccess: async () => {
      toast.success("برچسب جدید ساخته شد.");
      await invalidateTagQueries(queryClient);
    },
    onError: (error) => toast.error(getAdminTagErrorMessage(error)),
  });
}

function useUpdateAdminTag(tagId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminTagInput) => updateAdminTag(tagId, input),
    onSuccess: async () => {
      toast.success("تغییرات برچسب ذخیره شد.");
      await invalidateTagQueries(queryClient);
    },
    onError: (error) => toast.error(getAdminTagErrorMessage(error)),
  });
}

function useSetAdminTagActive(tagId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isActive: boolean) => setAdminTagActive(tagId, isActive),
    onSuccess: async (_, active) => {
      toast.success(active ? "برچسب فعال شد." : "برچسب غیرفعال شد.");
      await invalidateTagQueries(queryClient);
    },
    onError: (error) => toast.error(getAdminTagErrorMessage(error)),
  });
}

async function invalidateTagQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: adminTagsQueryKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: adminEntriesQueryKeys.taxonomy() }),
  ]);
}

export { useAdminTags, useCreateAdminTag, useSetAdminTagActive, useUpdateAdminTag };
