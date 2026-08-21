import type { EntryStatus } from "@/features/entries/api/entry-drafts-api";
import type { PaginationMeta } from "@/features/entries/types/public-entry";
import { apiRequest } from "@/lib/api/api-client";
import { setOptionalSearchParam } from "@/lib/utils/url-search-params";

type UserRole = "USER" | "MODERATOR" | "ADMIN";
type UserStatus = "ACTIVE" | "SUSPENDED";
type PublicReviewStatus = "ACTIVE" | "HIDDEN" | "DELETED";

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
  reviews: number;
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

type ProfileReview = {
  id: string;
  entryId: string;
  body: string;
  status: PublicReviewStatus;
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

type ProfileStatsResponse = {
  data: ProfileStats;
};

type ProfileReviewsResponse = {
  data: ProfileReview[];
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

async function getMyProfileStats(signal?: AbortSignal) {
  const response = await apiRequest<ProfileStatsResponse>("/profile/me/stats", {
    method: "GET",
    signal,
  });

  return response.data;
}

async function listMyProfileReviews(query: ProfileListQuery = {}, signal?: AbortSignal) {
  const response = await apiRequest<ProfileReviewsResponse>(
    `/profile/me/reviews${createProfileListQueryString(query)}`,
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
  ProfileEntrySummary,
  ProfileListQuery,
  ProfileOwner,
  ProfileReview,
  ProfileReviewsResponse,
  ProfileStats,
};
export { getMyProfile, getMyProfileStats, listMyProfileBookmarks, listMyProfileReviews };
