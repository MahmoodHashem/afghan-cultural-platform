import { apiRequest } from "@/lib/api/api-client";
import { setOptionalSearchParam } from "@/lib/utils/url-search-params";
import type { TaxonomyItem } from "../types/public-entry";

type GeographicScope = "PROVINCE" | "NATIONAL" | "NONE";

type EntryStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "CHANGES_REQUESTED"
  | "PUBLISHED"
  | "REJECTED"
  | "HIDDEN"
  | "ARCHIVED";

type SourceType =
  | "BOOK"
  | "ACADEMIC_ARTICLE"
  | "WEBSITE"
  | "ARCHIVE"
  | "INTERVIEW"
  | "ORAL_SOURCE"
  | "PERSONAL_EXPERIENCE"
  | "MUSEUM_OR_INSTITUTION"
  | "OTHER";

type EntrySourceInput = {
  type: SourceType;
  title?: string | null;
  authorOrProvider?: string | null;
  publicationDate?: string | null;
  websiteUrl?: string | null;
  bookOrArticleDetails?: string | null;
  interviewDate?: string | null;
  explanation?: string | null;
  displayOrder?: number;
};

type EntryYouTubeVideoInput = {
  url: string;
  title?: string | null;
  description?: string | null;
};

type EntryImageInput = {
  file: File;
  altText: string;
  caption?: string | null;
  photographerOrSource?: string | null;
  permissionConfirmed: boolean;
  displayOrder?: number;
};

type EntryDraftPayload = {
  title: string;
  summary: string;
  contentJson: unknown;
  geographicScope: GeographicScope;
  provinceId?: string | null;
  districtId?: string | null;
  categoryId: string;
  contentTypeId: string;
  villageOrLocation?: string | null;
};

type EntryTag = TaxonomyItem;

type OwnEntriesSortBy = "createdAt" | "updatedAt";
type SortDirection = "asc" | "desc";

type OwnEntriesQuery = {
  page?: number;
  limit?: number;
  status?: EntryStatus;
  categoryId?: string;
  contentTypeId?: string;
  sortBy?: OwnEntriesSortBy;
  sortDirection?: SortDirection;
};

type EntrySource = EntrySourceInput & {
  id: string;
  entryId: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

type EntryImage = {
  id: string;
  entryId: string;
  secureUrl: string;
  thumbnailUrl: string | null;
  altText: string;
  caption: string | null;
  photographerOrSource: string | null;
  permissionConfirmed: boolean;
  displayOrder: number;
  width: number | null;
  height: number | null;
  createdAt: string;
};

type EntryYouTubeVideo = {
  id: string;
  entryId: string;
  videoId: string;
  url: string;
  title: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

type OwnEntry = EntryDraftPayload & {
  id: string;
  key: string;
  slug: string;
  plainTextContent: string;
  status: EntryStatus;
  authorId: string;
  author?: {
    id: string;
    displayName: string;
  };
  province?: TaxonomyItem | null;
  district?: TaxonomyItem | null;
  category?: TaxonomyItem | null;
  contentType?: TaxonomyItem | null;
  tags?: TaxonomyItem[];
  sources?: EntrySource[];
  images?: EntryImage[];
  youtubeVideo?: EntryYouTubeVideo | null;
  createdAt: string;
  updatedAt: string;
};

type EntryResponse = {
  data: OwnEntry;
};

type OwnEntryListResponse = {
  data: OwnEntry[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type EntryTagsResponse = {
  data: EntryTag[];
};

type EntrySourceResponse = {
  data: EntrySource;
};

type EntryImageResponse = {
  data: EntryImage;
};

type EntryYouTubeVideoResponse = {
  data: EntryYouTubeVideo | null;
};

type EntrySubmissionResponse = {
  data: {
    entry: OwnEntry;
    contentVersion: {
      id: string;
      versionNumber: number;
    };
  };
};

async function createEntryDraft(input: EntryDraftPayload) {
  const response = await apiRequest<EntryResponse>("/entries", {
    method: "POST",
    body: input,
  });

  return response.data;
}

async function listOwnEntries(query: OwnEntriesQuery = {}, signal?: AbortSignal) {
  const searchParams = new URLSearchParams();

  setOptionalSearchParam(searchParams, "page", query.page);
  setOptionalSearchParam(searchParams, "limit", query.limit);
  setOptionalSearchParam(searchParams, "status", query.status);
  setOptionalSearchParam(searchParams, "categoryId", query.categoryId);
  setOptionalSearchParam(searchParams, "contentTypeId", query.contentTypeId);
  setOptionalSearchParam(searchParams, "sortBy", query.sortBy);
  setOptionalSearchParam(searchParams, "sortDirection", query.sortDirection);

  const queryString = searchParams.toString();
  const response = await apiRequest<OwnEntryListResponse>(
    `/me/entries${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      signal,
    },
  );

  return response;
}

async function getOwnEntry(entryId: string, signal?: AbortSignal) {
  const response = await apiRequest<EntryResponse>(`/me/entries/${entryId}`, {
    method: "GET",
    signal,
  });

  return response.data;
}

async function deleteOwnDraft(entryId: string) {
  await apiRequest(`/me/entries/${entryId}`, {
    method: "DELETE",
  });
}

async function updateEntryDraft(entryId: string, input: EntryDraftPayload) {
  const response = await apiRequest<EntryResponse>(`/me/entries/${entryId}`, {
    method: "PATCH",
    body: input,
  });

  return response.data;
}

async function submitEntryForReview(entryId: string) {
  const response = await apiRequest<EntrySubmissionResponse>(`/me/entries/${entryId}/submit`, {
    method: "POST",
  });

  return response.data;
}

async function replaceEntryTags(entryId: string, tagIds: string[]) {
  const response = await apiRequest<EntryTagsResponse>(`/me/entries/${entryId}/tags`, {
    method: "PATCH",
    body: { tagIds },
  });

  return response.data;
}

async function createEntrySource(entryId: string, input: EntrySourceInput) {
  const response = await apiRequest<EntrySourceResponse>(`/me/entries/${entryId}/sources`, {
    method: "POST",
    body: input,
  });

  return response.data;
}

async function updateEntrySource(entryId: string, sourceId: string, input: EntrySourceInput) {
  const response = await apiRequest<EntrySourceResponse>(
    `/me/entries/${entryId}/sources/${sourceId}`,
    {
      method: "PATCH",
      body: input,
    },
  );

  return response.data;
}

async function deleteEntrySource(entryId: string, sourceId: string) {
  await apiRequest(`/me/entries/${entryId}/sources/${sourceId}`, {
    method: "DELETE",
  });
}

async function upsertEntryYouTubeVideo(entryId: string, input: EntryYouTubeVideoInput) {
  const response = await apiRequest<EntryYouTubeVideoResponse>(
    `/me/entries/${entryId}/youtube-video`,
    {
      method: "POST",
      body: input,
    },
  );

  return response.data;
}

async function uploadEntryImage(entryId: string, input: EntryImageInput) {
  const formData = new FormData();
  formData.set("image", input.file);
  formData.set("altText", input.altText);
  formData.set("permissionConfirmed", String(input.permissionConfirmed));

  if (input.caption) {
    formData.set("caption", input.caption);
  }

  if (input.photographerOrSource) {
    formData.set("photographerOrSource", input.photographerOrSource);
  }

  if (input.displayOrder !== undefined) {
    formData.set("displayOrder", String(input.displayOrder));
  }

  const response = await apiRequest<EntryImageResponse>(`/me/entries/${entryId}/images`, {
    method: "POST",
    body: formData,
  });

  return response.data;
}

async function deleteEntryImage(entryId: string, imageId: string) {
  await apiRequest(`/me/entries/${entryId}/images/${imageId}`, {
    method: "DELETE",
  });
}

export type {
  EntryDraftPayload,
  EntryImage,
  EntryImageInput,
  EntrySource,
  EntrySourceInput,
  EntryStatus,
  EntryTag,
  EntryYouTubeVideo,
  EntryYouTubeVideoInput,
  GeographicScope,
  OwnEntriesQuery,
  OwnEntriesSortBy,
  OwnEntry,
  OwnEntryListResponse,
  SortDirection,
  SourceType,
};
export {
  createEntryDraft,
  createEntrySource,
  deleteEntryImage,
  deleteEntrySource,
  deleteOwnDraft,
  getOwnEntry,
  listOwnEntries,
  replaceEntryTags,
  submitEntryForReview,
  updateEntryDraft,
  updateEntrySource,
  uploadEntryImage,
  upsertEntryYouTubeVideo,
};
