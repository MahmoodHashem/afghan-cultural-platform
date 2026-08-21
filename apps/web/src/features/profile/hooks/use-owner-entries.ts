"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  deleteOwnDraft,
  listOwnEntries,
  type OwnEntriesQuery,
} from "@/features/entries/api/entry-drafts-api";
import {
  getMyProfile,
  getMyProfileStats,
  listMyProfileBookmarks,
  listMyProfileReviews,
  type ProfileListQuery,
} from "@/features/profile/api/profile-api";
import { profileQueryKeys } from "@/features/profile/constants/profile-query-keys";
import type { ProfileQuery } from "@/features/profile/utils/profile-query";

const PROFILE_ENTRIES_PAGE_SIZE = 8;
const PROFILE_REVIEWS_PAGE_SIZE = 8;
const PROFILE_BOOKMARKS_PAGE_SIZE = 8;

function useOwnerProfile() {
  return useQuery({
    queryKey: profileQueryKeys.owner(),
    queryFn: ({ signal }) => getMyProfile(signal),
  });
}

function useOwnerEntries(query: ProfileQuery) {
  const ownerEntriesQuery: OwnEntriesQuery = {
    page: query.page,
    limit: PROFILE_ENTRIES_PAGE_SIZE,
    status: query.status,
    sortBy: "updatedAt",
    sortDirection: "desc",
  };

  return useQuery({
    queryKey: profileQueryKeys.entries(ownerEntriesQuery),
    queryFn: ({ signal }) => listOwnEntries(ownerEntriesQuery, signal),
  });
}

function useOwnerEntryStats() {
  const stats = useQuery({
    queryKey: profileQueryKeys.stats(),
    queryFn: ({ signal }) => getMyProfileStats(signal),
  });

  return {
    entries: stats.data?.entries.all ?? 0,
    reviews: stats.data?.reviews ?? 0,
    bookmarks: stats.data?.bookmarks ?? 0,
    needsAttention: stats.data?.needsAttention ?? 0,
    isLoading: stats.isLoading,
    isError: stats.isError,
  };
}

function useOwnerReviews(query: ProfileQuery) {
  const reviewsQuery: ProfileListQuery = {
    page: query.page,
    limit: PROFILE_REVIEWS_PAGE_SIZE,
  };

  return useQuery({
    queryKey: profileQueryKeys.reviews(reviewsQuery),
    queryFn: ({ signal }) => listMyProfileReviews(reviewsQuery, signal),
  });
}

function useOwnerBookmarks(query: ProfileQuery) {
  const bookmarksQuery: ProfileListQuery = {
    page: query.page,
    limit: PROFILE_BOOKMARKS_PAGE_SIZE,
  };

  return useQuery({
    queryKey: profileQueryKeys.bookmarks(bookmarksQuery),
    queryFn: ({ signal }) => listMyProfileBookmarks(bookmarksQuery, signal),
  });
}

function useDeleteOwnDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: string) => deleteOwnDraft(entryId),
    onSuccess: async () => {
      toast.success("پیش‌نویس حذف شد.");
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.all });
    },
    onError: () => {
      toast.error("حذف پیش‌نویس انجام نشد. دوباره تلاش کنید.");
    },
  });
}

export {
  PROFILE_BOOKMARKS_PAGE_SIZE,
  PROFILE_ENTRIES_PAGE_SIZE,
  PROFILE_REVIEWS_PAGE_SIZE,
  useDeleteOwnDraftMutation,
  useOwnerBookmarks,
  useOwnerEntries,
  useOwnerEntryStats,
  useOwnerProfile,
  useOwnerReviews,
};
