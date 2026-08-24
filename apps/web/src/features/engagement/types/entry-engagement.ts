import type { PaginationMeta } from "@/features/entries/types/public-entry";

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

type EntryCommentStatus = "ACTIVE" | "HIDDEN" | "DELETED";
type EntryCommentSort = "newest" | "oldest" | "mostLiked";

type EntryCommentAuthor = {
  id: string;
  displayName: string;
  profileImageUrl: string | null;
  isEntryAuthor: boolean;
};

type EntryComment = {
  id: string;
  entryId: string;
  parentId: string | null;
  body: string | null;
  status: EntryCommentStatus;
  author: EntryCommentAuthor | null;
  likeCount: number;
  directReplyCount: number;
  createdAt: string;
  updatedAt: string;
};

type EntryCommentResponse = {
  data: EntryComment;
};

type EntryCommentListResponse = {
  data: EntryComment[];
  meta: PaginationMeta;
  commentCount: number;
};

type EntryCommentDeleteResponse = {
  data: {
    message: string;
  };
};

type CommentInteractionState = {
  entryId: string;
  likedCommentIds: string[];
};

type CommentInteractionStateResponse = {
  data: CommentInteractionState;
};

type CommentLikeState = {
  commentId: string;
  likeCount: number;
  isLikedByCurrentUser: boolean;
};

type CommentLikeStateResponse = {
  data: CommentLikeState;
};

export type {
  CommentInteractionState,
  CommentInteractionStateResponse,
  CommentLikeState,
  CommentLikeStateResponse,
  EntryBookmarkState,
  EntryBookmarkStateResponse,
  EntryComment,
  EntryCommentAuthor,
  EntryCommentDeleteResponse,
  EntryCommentListResponse,
  EntryCommentResponse,
  EntryCommentSort,
  EntryCommentStatus,
  EntryLikeState,
  EntryLikeStateResponse,
};
