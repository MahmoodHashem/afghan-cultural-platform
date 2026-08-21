"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  decideModerationSubmission,
  getModerationSubmission,
  listModerationSubmissions,
} from "@/features/moderation/api/moderation-api";
import { mapModerationSubmission } from "@/features/moderation/mappers/moderation-mapper";
import type {
  ModerationDecisionInput,
  ModerationQueueQuery,
} from "@/features/moderation/types/moderation";
import { getModerationErrorMessage } from "@/features/moderation/utils/moderation-errors";
import { profileQueryKeys } from "@/features/profile/constants/profile-query-keys";

const moderationKeys = {
  all: ["moderation"] as const,
  lists: () => [...moderationKeys.all, "submissions"] as const,
  list: (query: ModerationQueueQuery) => [...moderationKeys.lists(), query] as const,
  details: () => [...moderationKeys.all, "submission"] as const,
  detail: (entryId: string) => [...moderationKeys.details(), entryId] as const,
};

function useModerationQueue(query: ModerationQueueQuery) {
  return useQuery({
    queryKey: moderationKeys.list(query),
    queryFn: ({ signal }) => listModerationSubmissions(query, signal),
    select: (response) => ({
      ...response,
      data: response.data.map(mapModerationSubmission),
    }),
  });
}

function useModerationSubmission(entryId: string) {
  return useQuery({
    queryKey: moderationKeys.detail(entryId),
    queryFn: ({ signal }) => getModerationSubmission(entryId, signal),
    select: (response) => mapModerationSubmission(response.data),
  });
}

function useModerationDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ModerationDecisionInput) => decideModerationSubmission(input),
    onSuccess: async (response, input) => {
      const successMessages = {
        APPROVE: "مطلب تأیید و منتشر شد.",
        REQUEST_CHANGES: "مطلب برای اصلاح به نویسنده برگشت.",
        REJECT: "مطلب رد شد.",
      } as const;

      toast.success(successMessages[input.decision]);
      queryClient.setQueryData(moderationKeys.detail(input.entryId), undefined);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: moderationKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: profileQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["entry-draft", input.entryId] }),
      ]);

      return response;
    },
    onError: (error) => {
      toast.error(getModerationErrorMessage(error));
    },
  });
}

export { moderationKeys, useModerationDecision, useModerationQueue, useModerationSubmission };
