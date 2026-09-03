import type { EntryStatus } from "@/features/entries/api/entry-drafts-api";
import type { TaxonomyItem } from "@/features/entries/types/public-entry";

type ModerationSortDirection = "asc" | "desc";
type ModerationDecision = "APPROVE" | "REQUEST_CHANGES" | "REJECT";

type ModerationQueueQuery = {
  page: number;
  limit: number;
  authorId?: string;
  provinceId?: string;
  categoryId?: string;
  contentTypeId?: string;
  sortDirection: ModerationSortDirection;
};

type ModerationAuthor = {
  id: string;
  displayName: string;
};

type ModerationContentVersion = {
  id: string;
  entryId: string;
  versionNumber: number;
  snapshot: unknown;
  plainTextContent: string;
  versionReason:
    | "INITIAL_SUBMISSION"
    | "RESUBMISSION"
    | "ACCEPTED_CORRECTION"
    | "PUBLISHED_REVISION"
    | "ADMIN_UPDATE";
  createdById: string | null;
  correctionSuggestionId: string | null;
  moderationReviewId: string | null;
  createdAt: string;
};

type ModerationSubmissionDto = {
  id: string;
  slug: string | null;
  status: EntryStatus;
  authorId: string;
  author: ModerationAuthor;
  province: TaxonomyItem | null;
  category: TaxonomyItem;
  contentType: TaxonomyItem;
  submittedAt: string | null;
  updatedAt: string;
  submittedVersion: ModerationContentVersion | null;
};

type ModerationListResponse = {
  data: ModerationSubmissionDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type ModerationSubmissionResponse = {
  data: ModerationSubmissionDto;
};

type ModerationSnapshotImage = {
  id: string;
  secureUrl: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  caption: string | null;
  altText: string;
  photographerOrSource: string | null;
  permissionConfirmed: boolean;
  displayOrder: number;
};

type ModerationSnapshotSource = {
  id: string;
  type: string;
  title: string | null;
  authorOrProvider: string | null;
  publicationDate: string | null;
  websiteUrl: string | null;
  bookOrArticleDetails: string | null;
  interviewDate: string | null;
  explanation: string | null;
  displayOrder: number;
};

type ModerationSnapshotVideo = {
  id: string;
  videoId: string;
  url: string;
  title: string | null;
  description: string | null;
};

type ModerationSnapshotReference = {
  targetEntryId: string;
  targetSlug: string | null;
  targetTitle: string;
  anchorText: string;
};

type ModerationSnapshot = {
  title: string;
  summary: string;
  contentJson: unknown;
  plainTextContent: string;
  geographicScope: "PROVINCE" | "NATIONAL" | "NONE";
  province: TaxonomyItem | null;
  district: TaxonomyItem | null;
  category: TaxonomyItem;
  contentType: TaxonomyItem;
  villageOrLocation: string | null;
  tags: TaxonomyItem[];
  sources: ModerationSnapshotSource[];
  images: ModerationSnapshotImage[];
  youtubeVideo: ModerationSnapshotVideo | null;
  internalReferences: ModerationSnapshotReference[];
};

type ModerationSubmission = Omit<ModerationSubmissionDto, "submittedVersion"> & {
  title: string;
  summary: string;
  submittedVersion: ModerationContentVersion | null;
  snapshot: ModerationSnapshot | null;
};

type ModerationDecisionResponse = {
  data: {
    entry: {
      id: string;
      slug: string | null;
      status: EntryStatus;
      publishedAt: string | null;
    };
    review: {
      id: string;
      entryId: string;
      moderatorId: string;
      decision: ModerationDecision;
      comments: string | null;
      previousStatus: EntryStatus;
      nextStatus: EntryStatus;
      createdAt: string;
    };
    contentVersion: ModerationContentVersion;
  };
};

type ModerationDecisionInput = {
  entryId: string;
  decision: ModerationDecision;
  reason?: string;
};

export type {
  ModerationContentVersion,
  ModerationDecision,
  ModerationDecisionInput,
  ModerationDecisionResponse,
  ModerationListResponse,
  ModerationQueueQuery,
  ModerationSnapshot,
  ModerationSnapshotImage,
  ModerationSnapshotReference,
  ModerationSnapshotSource,
  ModerationSnapshotVideo,
  ModerationSortDirection,
  ModerationSubmission,
  ModerationSubmissionDto,
  ModerationSubmissionResponse,
};
