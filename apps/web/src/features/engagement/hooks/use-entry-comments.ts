"use client";

import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createEntryComment,
  deleteEntryComment,
  getCommentInteractions,
  likeComment,
  listCommentReplies,
  listEntryComments,
  unlikeComment,
  updateEntryComment,
} from "@/features/engagement/api/entry-engagement-api";
import { engagementQueryKeys } from "@/features/engagement/constants/engagement-query-keys";
import type {
  CommentInteractionState,
  EntryComment,
  EntryCommentListResponse,
  EntryCommentSort,
} from "@/features/engagement/types/entry-engagement";
import {
  getCommentListSnapshots,
  invalidateCommentLists,
  invalidateRootComments,
  restoreCommentListSnapshots,
  updateCommentCount,
  updateCommentInLists,
} from "@/features/engagement/utils/comment-cache";
import { getEngagementErrorMessage } from "@/features/engagement/utils/engagement-errors";
import { profileQueryKeys } from "@/features/profile/constants/profile-query-keys";

const ROOT_COMMENT_LIMIT = 10;
const REPLY_LIMIT = 5;

function useEntryComments(
  entryId: string,
  sort: EntryCommentSort,
  initialComments?: EntryCommentListResponse,
) {
  const initialData: InfiniteData<EntryCommentListResponse, number> | undefined =
    sort === "newest" && initialComments && initialComments.meta.limit > 0
      ? { pages: [initialComments], pageParams: [1] }
      : undefined;

  return useInfiniteQuery({
    queryKey: engagementQueryKeys.commentRoots(entryId, sort),
    queryFn: ({ pageParam, signal }) =>
      listEntryComments(entryId, { page: pageParam, limit: ROOT_COMMENT_LIMIT, sort }, signal),
    initialPageParam: 1,
    initialData,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
    staleTime: initialData ? 30_000 : 0,
  });
}

function useCommentReplies(entryId: string, parentId: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: engagementQueryKeys.commentReplies(entryId, parentId),
    queryFn: ({ pageParam, signal }) =>
      listCommentReplies(entryId, parentId, { page: pageParam, limit: REPLY_LIMIT }, signal),
    initialPageParam: 1,
    enabled,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
  });
}

function useCommentInteractions(entryId: string, enabled: boolean) {
  return useQuery({
    queryKey: engagementQueryKeys.commentInteractions(entryId),
    queryFn: ({ signal }) => getCommentInteractions(entryId, signal),
    enabled,
    staleTime: 30_000,
  });
}

function useCreateComment(entryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { body: string; parentId?: string }) => createEntryComment(entryId, input),
    onSuccess: async (comment, input) => {
      updateCommentCount(queryClient, entryId, 1);
      if (input.parentId) {
        updateCommentInLists(queryClient, entryId, input.parentId, (parent) => ({
          ...parent,
          directReplyCount: parent.directReplyCount + 1,
        }));
        await queryClient.invalidateQueries({
          queryKey: engagementQueryKeys.commentReplies(entryId, input.parentId),
          exact: true,
        });
      } else {
        await invalidateRootComments(queryClient, entryId);
      }
      await syncProfileCommentQueries(queryClient);
      toast.success(input.parentId ? "پاسخ شما ثبت شد." : "دیدگاه شما ثبت شد.");
      return comment;
    },
    onError: (error) => toast.error(getEngagementErrorMessage(error)),
  });
}

function useUpdateComment(entryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { commentId: string; body: string }) =>
      updateEntryComment(entryId, input.commentId, input.body),
    onSuccess: async (comment) => {
      updateCommentInLists(queryClient, entryId, comment.id, () => comment);
      await syncProfileCommentQueries(queryClient);
      toast.success("دیدگاه شما ویرایش شد.");
    },
    onError: (error) => toast.error(getEngagementErrorMessage(error)),
  });
}

function useDeleteComment(entryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteEntryComment(entryId, commentId),
    onSuccess: async () => {
      updateCommentCount(queryClient, entryId, -1);
      await Promise.all([
        invalidateCommentLists(queryClient, entryId),
        syncProfileCommentQueries(queryClient),
      ]);
      toast.success("دیدگاه شما حذف شد.");
    },
    onError: (error) => toast.error(getEngagementErrorMessage(error)),
  });
}

function useCommentLike(entryId: string, comment: EntryComment, canContribute: boolean) {
  const queryClient = useQueryClient();
  const interactions = useCommentInteractions(entryId, canContribute);
  const isLiked = interactions.data?.likedCommentIds.includes(comment.id) ?? false;

  const mutation = useMutation({
    mutationFn: () =>
      isLiked ? unlikeComment(entryId, comment.id) : likeComment(entryId, comment.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: engagementQueryKeys.comments(entryId) });
      const listSnapshots = getCommentListSnapshots(queryClient, entryId);
      const interactionSnapshot = queryClient.getQueryData<CommentInteractionState>(
        engagementQueryKeys.commentInteractions(entryId),
      );
      const nextLiked = !isLiked;
      updateCommentInLists(queryClient, entryId, comment.id, (current) => ({
        ...current,
        likeCount: Math.max(0, current.likeCount + (nextLiked ? 1 : -1)),
      }));
      queryClient.setQueryData<CommentInteractionState>(
        engagementQueryKeys.commentInteractions(entryId),
        (current) => ({
          entryId,
          likedCommentIds: nextLiked
            ? Array.from(new Set([...(current?.likedCommentIds ?? []), comment.id]))
            : (current?.likedCommentIds ?? []).filter((id) => id !== comment.id),
        }),
      );
      return { listSnapshots, interactionSnapshot };
    },
    onError: (error, _variables, context) => {
      if (context) {
        restoreCommentListSnapshots(queryClient, context.listSnapshots);
        queryClient.setQueryData(
          engagementQueryKeys.commentInteractions(entryId),
          context.interactionSnapshot,
        );
      }
      toast.error(getEngagementErrorMessage(error));
    },
    onSuccess: (state) => {
      updateCommentInLists(queryClient, entryId, state.commentId, (current) => ({
        ...current,
        likeCount: state.likeCount,
      }));
      queryClient.setQueryData<CommentInteractionState>(
        engagementQueryKeys.commentInteractions(entryId),
        (current) => ({
          entryId,
          likedCommentIds: state.isLikedByCurrentUser
            ? Array.from(new Set([...(current?.likedCommentIds ?? []), state.commentId]))
            : (current?.likedCommentIds ?? []).filter((id) => id !== state.commentId),
        }),
      );
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: engagementQueryKeys.commentInteractions(entryId),
          exact: true,
        }),
        queryClient.invalidateQueries({
          queryKey: engagementQueryKeys.commentRoots(entryId, "mostLiked"),
          exact: true,
        }),
      ]);
    },
  });

  return {
    isLiked,
    toggle: mutation.mutate,
    isPending: mutation.isPending,
    isLoading: interactions.isLoading,
  };
}

async function syncProfileCommentQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: profileQueryKeys.commentLists() }),
    queryClient.invalidateQueries({ queryKey: profileQueryKeys.stats() }),
  ]);
}

export {
  useCommentInteractions,
  useCommentLike,
  useCommentReplies,
  useCreateComment,
  useDeleteComment,
  useEntryComments,
  useUpdateComment,
};
