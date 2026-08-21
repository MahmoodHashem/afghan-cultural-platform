import type { PublicReview } from "@/features/entries/types/public-entry";

type EntryLikeState = {
  entryId: string;
  likeCount: number;
  isLikedByCurrentUser: boolean;
};

type EntryBookmarkState = {
  entryId: string;
  bookmarked: boolean;
  bookmarkId: string | null;
  bookmarkCount: number;
};

type EntryLikeStateResponse = {
  data: EntryLikeState;
};

type EntryBookmarkStateResponse = {
  data: EntryBookmarkState;
};

type EntryReviewResponse = {
  data: PublicReview;
};

type EntryReviewListResponse = {
  data: PublicReview[];
};

type EntryReviewDeleteResponse = {
  data: {
    message: string;
  };
};

export type {
  EntryBookmarkState,
  EntryBookmarkStateResponse,
  EntryLikeState,
  EntryLikeStateResponse,
  EntryReviewDeleteResponse,
  EntryReviewListResponse,
  EntryReviewResponse,
};
