"use client";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  deleteOwnDraft,
  listOwnEntries,
  type OwnEntriesQuery,
} from "@/features/entries/api/entry-drafts-api";
import type { ProfileQuery } from "@/features/profile/utils/profile-query";

const PROFILE_QUERY_ROOT = ["profile"] as const;
const PROFILE_ENTRIES_PAGE_SIZE = 8;

function useOwnerEntries(query: ProfileQuery) {
  const ownerEntriesQuery: OwnEntriesQuery = {
    page: query.page,
    limit: PROFILE_ENTRIES_PAGE_SIZE,
    status: query.status,
    sortBy: "updatedAt",
    sortDirection: "desc",
  };

  return useQuery({
    queryKey: [...PROFILE_QUERY_ROOT, "entries", ownerEntriesQuery],
    queryFn: ({ signal }) => listOwnEntries(ownerEntriesQuery, signal),
  });
}

function useOwnerEntryStats() {
  const [allEntries, publishedEntries, pendingReviewEntries, changesRequestedEntries] = useQueries({
    queries: [
      createCountQuery("all", {}),
      createCountQuery("published", { status: "PUBLISHED" }),
      createCountQuery("pending-review", { status: "PENDING_REVIEW" }),
      createCountQuery("changes-requested", { status: "CHANGES_REQUESTED" }),
    ],
  });

  return {
    all: allEntries.data?.meta.total ?? 0,
    published: publishedEntries.data?.meta.total ?? 0,
    needsAttention:
      (pendingReviewEntries.data?.meta.total ?? 0) +
      (changesRequestedEntries.data?.meta.total ?? 0),
    isLoading: [allEntries, publishedEntries, pendingReviewEntries, changesRequestedEntries].some(
      (query) => query.isLoading,
    ),
    isError: [allEntries, publishedEntries, pendingReviewEntries, changesRequestedEntries].some(
      (query) => query.isError,
    ),
  };
}

function useDeleteOwnDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: string) => deleteOwnDraft(entryId),
    onSuccess: async () => {
      toast.success("پیش‌نویس حذف شد.");
      await queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_ROOT });
    },
    onError: () => {
      toast.error("حذف پیش‌نویس انجام نشد. دوباره تلاش کنید.");
    },
  });
}

function createCountQuery(label: string, query: OwnEntriesQuery) {
  const countQuery: OwnEntriesQuery = {
    page: 1,
    limit: 1,
    ...query,
  };

  return {
    queryKey: [...PROFILE_QUERY_ROOT, "entry-stats", label, countQuery],
    queryFn: ({ signal }: { signal: AbortSignal }) => listOwnEntries(countQuery, signal),
  };
}

export {
  PROFILE_ENTRIES_PAGE_SIZE,
  PROFILE_QUERY_ROOT,
  useDeleteOwnDraftMutation,
  useOwnerEntries,
  useOwnerEntryStats,
};
