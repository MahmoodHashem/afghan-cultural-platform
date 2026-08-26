"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { toast } from "sonner";

import {
  bookmarkEntry,
  getEntryBookmarkState,
  getEntryLikeState,
  likeEntry,
  unbookmarkEntry,
  unlikeEntry,
} from "@/features/engagement/api/entry-engagement-api";
import { engagementQueryKeys } from "@/features/engagement/constants/engagement-query-keys";
import type {
  EntryBookmarkState,
  EntryLikeState,
} from "@/features/engagement/types/entry-engagement";
import { getEngagementErrorMessage } from "@/features/engagement/utils/engagement-errors";
import { profileQueryKeys } from "@/features/profile/constants/profile-query-keys";

type InteractionOptions = {
  entryId: string;
  initialCount: number;
  isAuthenticated: boolean;
};

function useEntryLike({ entryId, initialCount, isAuthenticated }: InteractionOptions) {
  const queryClient = useQueryClient();
  const actionLock = useRef(false);
  const queryKey = engagementQueryKeys.like(entryId);
  const fallbackState: EntryLikeState = {
    entryId,
    likeCount: initialCount,
    isLikedByCurrentUser: false,
  };
  const stateQuery = useQuery({
    queryKey,
    queryFn: ({ signal }) => getEntryLikeState(entryId, signal),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
  const mutation = useMutation({
    mutationFn: (shouldLike: boolean) => (shouldLike ? likeEntry(entryId) : unlikeEntry(entryId)),
    onMutate: async (shouldLike) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<EntryLikeState>(queryKey);
      const current = previous ?? fallbackState;

      queryClient.setQueryData<EntryLikeState>(queryKey, {
        ...current,
        isLikedByCurrentUser: shouldLike,
        likeCount: Math.max(0, current.likeCount + (shouldLike ? 1 : -1)),
      });

      return { previous };
    },
    onError: (error, _shouldLike, context) => {
      queryClient.setQueryData(queryKey, context?.previous ?? fallbackState);
      toast.error(getEngagementErrorMessage(error));
    },
    onSuccess: (serverState) => {
      queryClient.setQueryData(queryKey, serverState);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey, exact: true });
    },
  });
  const state = stateQuery.data ?? fallbackState;

  async function setLiked(shouldLike: boolean) {
    if (mutation.isPending || actionLock.current) return undefined;

    actionLock.current = true;
    try {
      return await mutation.mutateAsync(shouldLike);
    } finally {
      actionLock.current = false;
    }
  }

  return {
    ...state,
    isLoading: isAuthenticated && stateQuery.isLoading,
    isPending: mutation.isPending,
    setLiked,
    toggle: () => void setLiked(!state.isLikedByCurrentUser),
  };
}

function useEntryBookmark({ entryId, initialCount, isAuthenticated }: InteractionOptions) {
  const queryClient = useQueryClient();
  const actionLock = useRef(false);
  const queryKey = engagementQueryKeys.bookmark(entryId);
  const fallbackState: EntryBookmarkState = {
    entryId,
    bookmarked: false,
    bookmarkId: null,
    bookmarkCount: initialCount,
  };
  const stateQuery = useQuery({
    queryKey,
    queryFn: ({ signal }) => getEntryBookmarkState(entryId, signal),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
  const mutation = useMutation({
    mutationFn: (shouldBookmark: boolean) =>
      shouldBookmark ? bookmarkEntry(entryId) : unbookmarkEntry(entryId),
    onMutate: async (shouldBookmark) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<EntryBookmarkState>(queryKey);
      const current = previous ?? fallbackState;

      queryClient.setQueryData<EntryBookmarkState>(queryKey, {
        ...current,
        bookmarked: shouldBookmark,
        bookmarkId: shouldBookmark ? current.bookmarkId : null,
        bookmarkCount: Math.max(0, current.bookmarkCount + (shouldBookmark ? 1 : -1)),
      });

      return { previous };
    },
    onError: (error, _shouldBookmark, context) => {
      queryClient.setQueryData(queryKey, context?.previous ?? fallbackState);
      toast.error(getEngagementErrorMessage(error));
    },
    onSuccess: async (serverState) => {
      queryClient.setQueryData(queryKey, serverState);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: profileQueryKeys.bookmarkLists() }),
        queryClient.invalidateQueries({ queryKey: profileQueryKeys.stats() }),
      ]);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey, exact: true });
    },
  });
  const state = stateQuery.data ?? fallbackState;

  async function setBookmarked(shouldBookmark: boolean) {
    if (mutation.isPending || actionLock.current) return undefined;

    actionLock.current = true;
    try {
      return await mutation.mutateAsync(shouldBookmark);
    } finally {
      actionLock.current = false;
    }
  }

  return {
    ...state,
    isLoading: isAuthenticated && stateQuery.isLoading,
    isPending: mutation.isPending,
    setBookmarked,
    toggle: () => void setBookmarked(!state.bookmarked),
  };
}

export { useEntryBookmark, useEntryLike };
