import type { EntryStatus } from "@/features/entries/api/entry-drafts-api";
import type { PaginationMeta } from "@/features/entries/types/public-entry";
import { apiRequest } from "@/lib/api/api-client";
import { setOptionalSearchParam } from "@/lib/utils/url-search-params";

type UserRole = "USER" | "MODERATOR" | "ADMIN";
type UserStatus = "ACTIVE" | "SUSPENDED";
type EntryCommentStatus = "ACTIVE" | "HIDDEN" | "DELETED";

type ProfileProvince = {
  id: string;
  name: string;
  slug: string;
};

type ProfileOwner = {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  displayName: string;
  profileImageUrl: string | null;
  biography: string | null;
  province: ProfileProvince | null;
  culturalInterests: string[];
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProfileEntryStatusCounts = {
  all: number;
  draft: number;
  pendingReview: number;
  changesRequested: number;
  published: number;
  rejected: number;
  hidden: number;
  archived: number;
};

type ProfileStats = {
  entries: ProfileEntryStatusCounts;
  comments: number;
  bookmarks: number;
  needsAttention: number;
};

type ProfileEntrySummary = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: EntryStatus;
  publishedAt: string | null;
  updatedAt: string;
};

type ProfileComment = {
  id: string;
  entryId: string;
  parentId: string | null;
  body: string;
  status: EntryCommentStatus;
  entry: ProfileEntrySummary;
  createdAt: string;
  updatedAt: string;
};

type ProfileBookmark = {
  id: string;
  entryId: string;
  entry: ProfileEntrySummary;
  createdAt: string;
};

type ProfileListQuery = {
  page?: number;
  limit?: number;
};

type ProfileResponse = {
  data: ProfileOwner;
};

type UpdateProfileInput = {
  displayName: string;
};

type ProfileStatsResponse = {
  data: ProfileStats;
};

type ProfileCommentsResponse = {
  data: ProfileComment[];
  meta: PaginationMeta;
};

type ProfileBookmarksResponse = {
  data: ProfileBookmark[];
  meta: PaginationMeta;
};

async function getMyProfile(signal?: AbortSignal) {
  const response = await apiRequest<ProfileResponse>("/profile/me", {
    method: "GET",
    signal,
  });

  return response.data;
}

async function updateMyProfile(input: UpdateProfileInput) {
  const response = await apiRequest<ProfileResponse>("/profile/me", {
    method: "PATCH",
    body: input,
  });

  return response.data;
}

async function uploadMyProfileImage(file: File) {
  const formData = new FormData();
  formData.set("image", file);
  const response = await apiRequest<ProfileResponse>("/profile/me/image", {
    method: "POST",
    body: formData,
  });

  return response.data;
}

async function deleteMyProfileImage() {
  const response = await apiRequest<ProfileResponse>("/profile/me/image", {
    method: "DELETE",
  });

  return response.data;
}

async function getMyProfileStats(signal?: AbortSignal) {
  const response = await apiRequest<ProfileStatsResponse>("/profile/me/stats", {
    method: "GET",
    signal,
  });

  return response.data;
}

async function listMyProfileComments(query: ProfileListQuery = {}, signal?: AbortSignal) {
  const response = await apiRequest<ProfileCommentsResponse>(
    `/profile/me/comments${createProfileListQueryString(query)}`,
    {
      method: "GET",
      signal,
    },
  );

  return response;
}

async function listMyProfileBookmarks(query: ProfileListQuery = {}, signal?: AbortSignal) {
  const response = await apiRequest<ProfileBookmarksResponse>(
    `/profile/me/bookmarks${createProfileListQueryString(query)}`,
    {
      method: "GET",
      signal,
    },
  );

  return response;
}

function createProfileListQueryString(query: ProfileListQuery) {
  const searchParams = new URLSearchParams();

  setOptionalSearchParam(searchParams, "page", query.page);
  setOptionalSearchParam(searchParams, "limit", query.limit);

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export type {
  ProfileBookmark,
  ProfileBookmarksResponse,
  ProfileComment,
  ProfileCommentsResponse,
  ProfileEntrySummary,
  ProfileListQuery,
  ProfileOwner,
  ProfileStats,
  UpdateProfileInput,
};
export {
  deleteMyProfileImage,
  getMyProfile,
  getMyProfileStats,
  listMyProfileBookmarks,
  listMyProfileComments,
  updateMyProfile,
  uploadMyProfileImage,
};
