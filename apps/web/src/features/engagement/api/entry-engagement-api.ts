import type {
  EntryBookmarkState,
  EntryBookmarkStateResponse,
  EntryLikeState,
  EntryLikeStateResponse,
  EntryReviewDeleteResponse,
  EntryReviewListResponse,
  EntryReviewResponse,
} from "@/features/engagement/types/entry-engagement";
import type { PublicReview } from "@/features/entries/types/public-entry";
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
    {
      method: "GET",
      signal,
    },
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

async function listEntryReviews(entryId: string, signal?: AbortSignal): Promise<PublicReview[]> {
  const response = await apiRequest<EntryReviewListResponse>(`/entries/${entryId}/reviews`, {
    method: "GET",
    signal,
    accessToken: null,
    skipAuthRefresh: true,
  });

  return response.data;
}

async function createEntryReview(entryId: string, body: string): Promise<PublicReview> {
  const response = await apiRequest<EntryReviewResponse>(`/entries/${entryId}/reviews`, {
    method: "PUT",
    body: { body },
  });

  return response.data;
}

async function updateOwnEntryReview(entryId: string, body: string): Promise<PublicReview> {
  const response = await apiRequest<EntryReviewResponse>(`/entries/${entryId}/reviews/me`, {
    method: "PATCH",
    body: { body },
  });

  return response.data;
}

async function deleteOwnEntryReview(entryId: string): Promise<void> {
  await apiRequest<EntryReviewDeleteResponse>(`/entries/${entryId}/reviews/me`, {
    method: "DELETE",
  });
}

export {
  bookmarkEntry,
  createEntryReview,
  deleteOwnEntryReview,
  getEntryBookmarkState,
  getEntryLikeState,
  likeEntry,
  listEntryReviews,
  unbookmarkEntry,
  unlikeEntry,
  updateOwnEntryReview,
};
