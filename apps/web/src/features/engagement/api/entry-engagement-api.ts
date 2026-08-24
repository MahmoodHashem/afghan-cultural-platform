import type {
  CommentInteractionState,
  CommentInteractionStateResponse,
  CommentLikeState,
  CommentLikeStateResponse,
  EntryBookmarkState,
  EntryBookmarkStateResponse,
  EntryComment,
  EntryCommentDeleteResponse,
  EntryCommentListResponse,
  EntryCommentResponse,
  EntryCommentSort,
  EntryLikeState,
  EntryLikeStateResponse,
} from "@/features/engagement/types/entry-engagement";
import { apiRequest } from "@/lib/api/api-client";

async function getEntryLikeState(entryId: string, signal?: AbortSignal): Promise<EntryLikeState> {
  const response = await apiRequest<EntryLikeStateResponse>(`/entries/${entryId}/like`, {
    method: "GET",
    signal,
  });
  return response.data;
}

async function likeEntry(entryId: string): Promise<EntryLikeState> {
  const response = await apiRequest<EntryLikeStateResponse>(`/entries/${entryId}/like`, {
    method: "PUT",
  });
  return response.data;
}

async function unlikeEntry(entryId: string): Promise<EntryLikeState> {
  const response = await apiRequest<EntryLikeStateResponse>(`/entries/${entryId}/like`, {
    method: "DELETE",
  });
  return response.data;
}

async function getEntryBookmarkState(
  entryId: string,
  signal?: AbortSignal,
): Promise<EntryBookmarkState> {
  const response = await apiRequest<EntryBookmarkStateResponse>(
    `/profile/me/bookmarks/${entryId}`,
    { method: "GET", signal },
  );
  return response.data;
}

async function bookmarkEntry(entryId: string): Promise<EntryBookmarkState> {
  const response = await apiRequest<EntryBookmarkStateResponse>(
    `/profile/me/bookmarks/${entryId}`,
    { method: "PUT" },
  );
  return response.data;
}

async function unbookmarkEntry(entryId: string): Promise<EntryBookmarkState> {
  const response = await apiRequest<EntryBookmarkStateResponse>(
    `/profile/me/bookmarks/${entryId}`,
    { method: "DELETE" },
  );
  return response.data;
}

async function listEntryComments(
  entryId: string,
  query: { page: number; limit: number; sort: EntryCommentSort },
  signal?: AbortSignal,
): Promise<EntryCommentListResponse> {
  const searchParams = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
    sort: query.sort,
  });
  return apiRequest<EntryCommentListResponse>(
    `/entries/${entryId}/comments?${searchParams.toString()}`,
    { method: "GET", signal, accessToken: null, skipAuthRefresh: true },
  );
}

async function listCommentReplies(
  entryId: string,
  commentId: string,
  query: { page: number; limit: number },
  signal?: AbortSignal,
): Promise<EntryCommentListResponse> {
  const searchParams = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  });
  return apiRequest<EntryCommentListResponse>(
    `/entries/${entryId}/comments/${commentId}/replies?${searchParams.toString()}`,
    { method: "GET", signal, accessToken: null, skipAuthRefresh: true },
  );
}

async function createEntryComment(
  entryId: string,
  input: { body: string; parentId?: string },
): Promise<EntryComment> {
  const response = await apiRequest<EntryCommentResponse>(`/entries/${entryId}/comments`, {
    method: "POST",
    body: input,
  });
  return response.data;
}

async function updateEntryComment(
  entryId: string,
  commentId: string,
  body: string,
): Promise<EntryComment> {
  const response = await apiRequest<EntryCommentResponse>(
    `/entries/${entryId}/comments/${commentId}`,
    { method: "PATCH", body: { body } },
  );
  return response.data;
}

async function deleteEntryComment(entryId: string, commentId: string): Promise<void> {
  await apiRequest<EntryCommentDeleteResponse>(`/entries/${entryId}/comments/${commentId}`, {
    method: "DELETE",
  });
}

async function getCommentInteractions(
  entryId: string,
  signal?: AbortSignal,
): Promise<CommentInteractionState> {
  const response = await apiRequest<CommentInteractionStateResponse>(
    `/entries/${entryId}/comment-interactions`,
    { method: "GET", signal },
  );
  return response.data;
}

async function likeComment(entryId: string, commentId: string): Promise<CommentLikeState> {
  const response = await apiRequest<CommentLikeStateResponse>(
    `/entries/${entryId}/comments/${commentId}/like`,
    { method: "PUT" },
  );
  return response.data;
}

async function unlikeComment(entryId: string, commentId: string): Promise<CommentLikeState> {
  const response = await apiRequest<CommentLikeStateResponse>(
    `/entries/${entryId}/comments/${commentId}/like`,
    { method: "DELETE" },
  );
  return response.data;
}

export {
  bookmarkEntry,
  createEntryComment,
  deleteEntryComment,
  getCommentInteractions,
  getEntryBookmarkState,
  getEntryLikeState,
  likeComment,
  likeEntry,
  listCommentReplies,
  listEntryComments,
  unbookmarkEntry,
  unlikeComment,
  unlikeEntry,
  updateEntryComment,
};
