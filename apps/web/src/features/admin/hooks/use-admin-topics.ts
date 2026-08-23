"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createAdminTopic,
  listAdminTopics,
  reorderAdminTopics,
  setAdminTopicActive,
  updateAdminTopic,
} from "@/features/admin/api/admin-topics-api";
import {
  type AdminDescribedTaxonomyKind,
  describedTaxonomyConfigs,
} from "@/features/admin/constants/admin-described-taxonomy";
import { adminEntriesQueryKeys } from "@/features/admin/constants/admin-entries-query-keys";
import { adminTopicsQueryKeys } from "@/features/admin/constants/admin-topics-query-keys";
import type {
  AdminTopicInput,
  AdminTopicReorderInput,
  AdminTopicsQuery,
} from "@/features/admin/types/admin-topics";
import { getAdminTopicErrorMessage } from "@/features/admin/utils/admin-topic-errors";

function useAdminTopics(kind: AdminDescribedTaxonomyKind, query: AdminTopicsQuery) {
  const config = describedTaxonomyConfigs[kind];
  return useQuery({
    queryKey: adminTopicsQueryKeys.list(kind, query),
    queryFn: ({ signal }) => listAdminTopics(config.endpoint, query, signal),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

function useCreateAdminTopic(kind: AdminDescribedTaxonomyKind) {
  const config = describedTaxonomyConfigs[kind];
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminTopicInput) => createAdminTopic(config.endpoint, input),
    onSuccess: async () => {
      toast.success(`${config.singular} جدید ساخته شد.`);
      await invalidateTopicQueries(queryClient, kind);
    },
    onError: (error) => toast.error(getAdminTopicErrorMessage(error, config.singular)),
  });
}

function useUpdateAdminTopic(kind: AdminDescribedTaxonomyKind, topicId: string) {
  const config = describedTaxonomyConfigs[kind];
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminTopicInput) => updateAdminTopic(config.endpoint, topicId, input),
    onSuccess: async () => {
      toast.success(`تغییرات ${config.singular} ذخیره شد.`);
      await invalidateTopicQueries(queryClient, kind);
    },
    onError: (error) => toast.error(getAdminTopicErrorMessage(error, config.singular)),
  });
}

function useSetAdminTopicActive(kind: AdminDescribedTaxonomyKind, topicId: string) {
  const config = describedTaxonomyConfigs[kind];
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isActive: boolean) => setAdminTopicActive(config.endpoint, topicId, isActive),
    onSuccess: async (_, isActive) => {
      toast.success(isActive ? `${config.singular} فعال شد.` : `${config.singular} غیرفعال شد.`);
      await invalidateTopicQueries(queryClient, kind);
    },
    onError: (error) => toast.error(getAdminTopicErrorMessage(error, config.singular)),
  });
}

function useReorderAdminTopics(kind: AdminDescribedTaxonomyKind) {
  const config = describedTaxonomyConfigs[kind];
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminTopicReorderInput) => reorderAdminTopics(config.endpoint, input),
    onSuccess: async () => {
      toast.success(`ترتیب ${config.plural} ذخیره شد.`);
      await invalidateTopicQueries(queryClient, kind);
    },
    onError: (error) => toast.error(getAdminTopicErrorMessage(error, config.singular)),
  });
}

async function invalidateTopicQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  kind: AdminDescribedTaxonomyKind,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: adminTopicsQueryKeys.lists(kind) }),
    queryClient.invalidateQueries({ queryKey: adminEntriesQueryKeys.taxonomy() }),
  ]);
}

export {
  useAdminTopics,
  useCreateAdminTopic,
  useReorderAdminTopics,
  useSetAdminTopicActive,
  useUpdateAdminTopic,
};
