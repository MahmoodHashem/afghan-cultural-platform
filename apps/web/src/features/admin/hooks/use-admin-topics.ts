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
import { adminEntriesQueryKeys } from "@/features/admin/constants/admin-entries-query-keys";
import { adminTopicsQueryKeys } from "@/features/admin/constants/admin-topics-query-keys";
import type {
  AdminTopicInput,
  AdminTopicReorderInput,
  AdminTopicsQuery,
} from "@/features/admin/types/admin-topics";
import { getAdminTopicErrorMessage } from "@/features/admin/utils/admin-topic-errors";

function useAdminTopics(query: AdminTopicsQuery) {
  return useQuery({
    queryKey: adminTopicsQueryKeys.list(query),
    queryFn: ({ signal }) => listAdminTopics(query, signal),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

function useCreateAdminTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminTopicInput) => createAdminTopic(input),
    onSuccess: async () => {
      toast.success("موضوع جدید ساخته شد.");
      await invalidateTopicQueries(queryClient);
    },
    onError: (error) => toast.error(getAdminTopicErrorMessage(error)),
  });
}

function useUpdateAdminTopic(topicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminTopicInput) => updateAdminTopic(topicId, input),
    onSuccess: async () => {
      toast.success("تغییرات موضوع ذخیره شد.");
      await invalidateTopicQueries(queryClient);
    },
    onError: (error) => toast.error(getAdminTopicErrorMessage(error)),
  });
}

function useSetAdminTopicActive(topicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isActive: boolean) => setAdminTopicActive(topicId, isActive),
    onSuccess: async (_, isActive) => {
      toast.success(isActive ? "موضوع فعال شد." : "موضوع غیرفعال شد.");
      await invalidateTopicQueries(queryClient);
    },
    onError: (error) => toast.error(getAdminTopicErrorMessage(error)),
  });
}

function useReorderAdminTopics() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminTopicReorderInput) => reorderAdminTopics(input),
    onSuccess: async () => {
      toast.success("ترتیب موضوع‌ها ذخیره شد.");
      await invalidateTopicQueries(queryClient);
    },
    onError: (error) => toast.error(getAdminTopicErrorMessage(error)),
  });
}

async function invalidateTopicQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: adminTopicsQueryKeys.lists() }),
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
