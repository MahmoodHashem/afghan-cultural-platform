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
  averageRating: number;
  ratingCount: number;
};

type EntryListResponse = {
  data: PublicEntryCard[];
  meta: PaginationMeta;
};

type TaxonomyListResponse<TItem> = {
  data: TItem[];
  meta: PaginationMeta;
};

export type {
  EntryListResponse,
  PaginationMeta,
  PublicEntryCard,
  TaxonomyItem,
  TaxonomyListResponse,
};
