import type { RichTextContent } from "@/components/common/rich-text-editor";
import type { AdminEntryStatus, AdminPaginationMeta } from "@/features/admin/types/admin-users";

type AdminGeographicScope = "PROVINCE" | "NATIONAL" | "NONE";
type AdminEntrySortField =
  | "createdAt"
  | "updatedAt"
  | "submittedAt"
  | "publishedAt"
  | "title"
  | "viewCount";
type AdminEntrySortDirection = "asc" | "desc";

type AdminEntryTaxonomy = { id: string; name: string; slug: string; isActive: boolean };
type AdminEntryAuthor = {
  id: string;
  displayName: string;
  email: string;
  profileImageUrl: string | null;
};
type AdminEntryCounts = {
  likes: number;
  bookmarks: number;
  reviews: number;
  openReports: number;
};

type AdminEntryListItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: AdminEntryStatus;
  geographicScope: AdminGeographicScope;
  thumbnailUrl: string | null;
  author: AdminEntryAuthor;
  province: AdminEntryTaxonomy | null;
  category: AdminEntryTaxonomy;
  contentType: AdminEntryTaxonomy;
  viewCount: number;
  counts: AdminEntryCounts;
  submittedAt: string | null;
  publishedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type AdminEntryImage = {
  id: string;
  secureUrl: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  caption: string | null;
  altText: string;
  photographerOrSource: string | null;
  displayOrder: number;
};

type AdminEntrySource = {
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

type AdminEntryModerationHistory = {
  id: string;
  decision: string;
  comments: string | null;
  previousStatus: AdminEntryStatus;
  nextStatus: AdminEntryStatus;
  moderator: { id: string; displayName: string };
  createdAt: string;
};

type AdminEntryVersion = {
  id: string;
  versionNumber: number;
  versionReason: string;
  creator: { id: string; displayName: string } | null;
  createdAt: string;
};

type AdminEntryReference = {
  id: string;
  anchorText: string;
  targetEntryId?: string;
  sourceEntryId?: string;
  targetEntry?: { id: string; slug: string; title: string; status: AdminEntryStatus };
  sourceEntry?: { id: string; slug: string; title: string; status: AdminEntryStatus };
};

type AdminEntryDetail = Omit<AdminEntryListItem, "thumbnailUrl"> & {
  key: string;
  contentJson: RichTextContent;
  plainTextContent: string;
  district: (AdminEntryTaxonomy & { provinceId: string }) | null;
  villageOrLocation: string | null;
  historicalPeriod: string | null;
  culturalCommunity: string | null;
  alternativeLocalName: string | null;
  regionalDifferences: string | null;
  tags: AdminEntryTaxonomy[];
  images: AdminEntryImage[];
  sources: AdminEntrySource[];
  youtubeVideo: {
    id: string;
    videoId: string;
    url: string;
    title: string | null;
    description: string | null;
  } | null;
  contentVersions: AdminEntryVersion[];
  moderationHistory: AdminEntryModerationHistory[];
  outgoingReferences: AdminEntryReference[];
  incomingReferences: AdminEntryReference[];
  hiddenAt: string | null;
  counts: AdminEntryCounts & { corrections: number };
};

type AdminEntryStatusCount = { status: AdminEntryStatus; count: number };
type AdminEntriesResponse = {
  data: AdminEntryListItem[];
  meta: AdminPaginationMeta;
  statusCounts: AdminEntryStatusCount[];
};
type AdminEntriesQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdminEntryStatus;
  categoryId?: string;
  contentTypeId?: string;
  provinceId?: string;
  geographicScope?: AdminGeographicScope;
  authorId?: string;
  sortBy?: AdminEntrySortField;
  sortDirection?: AdminEntrySortDirection;
};
type AdminEntryLifecycleInput = { reason: string };
type AdminEntryLifecycleResult = {
  entry: Pick<
    AdminEntryDetail,
    "id" | "slug" | "status" | "publishedAt" | "archivedAt" | "updatedAt"
  >;
  review: AdminEntryModerationHistory;
};
type AdminTaxonomyOption = AdminEntryTaxonomy;
type AdminEntryTaxonomyData = {
  provinces: AdminTaxonomyOption[];
  categories: AdminTaxonomyOption[];
  contentTypes: AdminTaxonomyOption[];
};

export type {
  AdminEntriesQuery,
  AdminEntriesResponse,
  AdminEntryDetail,
  AdminEntryLifecycleInput,
  AdminEntryLifecycleResult,
  AdminEntryListItem,
  AdminEntrySortDirection,
  AdminEntrySortField,
  AdminEntryStatusCount,
  AdminEntryTaxonomyData,
  AdminGeographicScope,
  AdminTaxonomyOption,
};
