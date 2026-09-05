type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type TaxonomyItem = {
  id: string;
  name: string;
  slug: string;
  sortOrder?: number;
  isActive?: boolean;
  description?: string | null;
  image?: {
    secureUrl: string;
    thumbnailUrl: string;
    altText: string;
    width: number | null;
    height: number | null;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

type DistrictTaxonomyItem = TaxonomyItem & {
  provinceId: string;
  province?: TaxonomyItem;
};

type PublicEntryImage = {
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

type PublicEntryAuthor = {
  id: string;
  displayName: string;
  profileImageUrl: string | null;
};

type PublicEntryCard = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverImage: PublicEntryImage | null;
  geographicScope: "PROVINCE" | "NATIONAL" | "NONE";
  province: Pick<TaxonomyItem, "id" | "name" | "slug"> | null;
  category: Pick<TaxonomyItem, "id" | "name" | "slug">;
  contentType: Pick<TaxonomyItem, "id" | "name" | "slug">;
  tags: Array<Pick<TaxonomyItem, "id" | "name" | "slug">>;
  author: PublicEntryAuthor;
  publishedAt: string;
  updatedAt: string;
  likeCount: number;
  bookmarkCount: number;
  commentCount: number;
  likedByCurrentUser?: boolean;
  savedByCurrentUser?: boolean;
};

type PublicEntrySource = {
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

type PublicEntryYouTubeVideo = {
  id: string;
  videoId: string;
  url: string;
  title: string | null;
  description: string | null;
};

type PublicEntryOutgoingReference = {
  id: string;
  targetEntryId: string;
  anchorText: string;
  targetEntry: {
    id: string;
    slug: string;
    title: string;
  };
};

type PublicEntryIncomingReference = {
  id: string;
  sourceEntryId: string;
  anchorText: string;
  sourceEntry: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    publishedAt: string;
  };
};

type PublicEntrySeo = {
  title: string;
  summary: string;
  canonicalSlug: string;
  image: string | null;
  author: string;
  publishedAt: string;
  modifiedAt: string;
  taxonomy: TaxonomyItem[];
  plainTextExcerpt: string;
};

type PublicEntryDetail = PublicEntryCard & {
  contentJson: unknown;
  plainTextContent: string;
  district: Pick<TaxonomyItem, "id" | "name" | "slug"> | null;
  villageOrLocation: string | null;
  images: PublicEntryImage[];
  sources: PublicEntrySource[];
  youtubeVideo: PublicEntryYouTubeVideo | null;
  outgoingReferences: PublicEntryOutgoingReference[];
  incomingReferences: PublicEntryIncomingReference[];
  seo: PublicEntrySeo;
};

type EntryListResponse = {
  data: PublicEntryCard[];
  meta: PaginationMeta;
};

type EntryDetailResponse = {
  data: PublicEntryDetail;
};

type TaxonomyListResponse<TItem> = {
  data: TItem[];
  meta: PaginationMeta;
};

export type {
  DistrictTaxonomyItem,
  EntryDetailResponse,
  EntryListResponse,
  PaginationMeta,
  PublicEntryCard,
  PublicEntryDetail,
  TaxonomyItem,
  TaxonomyListResponse,
};
