import type { InfiniteData, Query, QueryClient } from "@tanstack/react-query";

import type {
  EntryComment,
  EntryCommentListResponse,
} from "@/features/engagement/types/entry-engagement";

type CommentInfiniteData = InfiniteData<EntryCommentListResponse, number>;

function isCommentListQuery(query: Query, entryId: string) {
  const key = query.queryKey;
  return (
    key[0] === "entry-engagement" &&
    key[1] === entryId &&
    key[2] === "comments" &&
    (key[3] === "roots" || key[3] === "replies")
  );
}

function updateCommentInLists(
  queryClient: QueryClient,
  entryId: string,
  commentId: string,
  update: (comment: EntryComment) => EntryComment,
) {
  queryClient.setQueriesData<CommentInfiniteData>(
    { predicate: (query) => isCommentListQuery(query, entryId) },
    (current) => {
      if (!current) return current;
      return {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          data: page.data.map((comment) => (comment.id === commentId ? update(comment) : comment)),
        })),
      };
    },
  );
}

function updateCommentCount(queryClient: QueryClient, entryId: string, change: number) {
  queryClient.setQueriesData<CommentInfiniteData>(
    { predicate: (query) => isCommentListQuery(query, entryId) },
    (current) => {
      if (!current) return current;
      return {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          commentCount: Math.max(0, page.commentCount + change),
        })),
      };
    },
  );
}

function invalidateCommentLists(queryClient: QueryClient, entryId: string) {
  return queryClient.invalidateQueries({
    predicate: (query) => isCommentListQuery(query, entryId),
  });
}

function invalidateRootComments(queryClient: QueryClient, entryId: string) {
  return queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey;
      return (
        key[0] === "entry-engagement" &&
        key[1] === entryId &&
        key[2] === "comments" &&
        key[3] === "roots"
      );
    },
  });
}

function getCommentListSnapshots(queryClient: QueryClient, entryId: string) {
  return queryClient.getQueriesData<CommentInfiniteData>({
    predicate: (query) => isCommentListQuery(query, entryId),
  });
}

function restoreCommentListSnapshots(
  queryClient: QueryClient,
  snapshots: Array<[readonly unknown[], CommentInfiniteData | undefined]>,
) {
  for (const [key, value] of snapshots) queryClient.setQueryData(key, value);
}

export type { CommentInfiniteData };
export {
  getCommentListSnapshots,
  invalidateCommentLists,
  invalidateRootComments,
  restoreCommentListSnapshots,
  updateCommentCount,
  updateCommentInLists,
};
