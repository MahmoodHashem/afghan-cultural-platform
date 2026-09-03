"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  decideModerationRevision,
  getModerationRevision,
  listModerationRevisions,
  requestPublishedEntryRevision,
} from "@/features/moderation/api/moderation-api";
import { getModerationErrorMessage } from "@/features/moderation/utils/moderation-errors";
import { profileQueryKeys } from "@/features/profile/constants/profile-query-keys";

const revisionModerationKeys = {
  all: ["moderation", "revisions"] as const,
  list: (page: number) => [...revisionModerationKeys.all, "list", page] as const,
  detail: (id: string) => [...revisionModerationKeys.all, "detail", id] as const,
};

function useRevisionModerationQueue(page: number) {
  return useQuery({
    queryKey: revisionModerationKeys.list(page),
    queryFn: ({ signal }) => listModerationRevisions(page, 20, signal),
  });
}

function useRevisionModerationDetail(revisionId: string) {
  return useQuery({
    queryKey: revisionModerationKeys.detail(revisionId),
    queryFn: ({ signal }) => getModerationRevision(revisionId, signal),
  });
}

function useRevisionModerationDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: decideModerationRevision,
    onSuccess: async (_, input) => {
      toast.success(
        input.decision === "APPROVE"
          ? "ویرایش تأیید و منتشر شد."
          : input.decision === "REQUEST_CHANGES"
            ? "ویرایش برای اصلاح برگشت داده شد."
            : "ویرایش رد شد.",
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: revisionModerationKeys.all }),
        queryClient.invalidateQueries({ queryKey: profileQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["entry-revision"] }),
      ]);
    },
    onError: (error) => toast.error(getModerationErrorMessage(error)),
  });
}

function useRequestPublishedEntryRevision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, reason }: { entryId: string; reason: string }) =>
      requestPublishedEntryRevision(entryId, reason),
    onSuccess: async () => {
      toast.success("پیشنهاد اصلاح برای نویسنده ثبت شد.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: revisionModerationKeys.all }),
        queryClient.invalidateQueries({ queryKey: profileQueryKeys.all }),
      ]);
    },
    onError: (error) => toast.error(getModerationErrorMessage(error)),
  });
}

export {
  revisionModerationKeys,
  useRequestPublishedEntryRevision,
  useRevisionModerationDecision,
  useRevisionModerationDetail,
  useRevisionModerationQueue,
};
