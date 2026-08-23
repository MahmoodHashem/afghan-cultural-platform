type AdminTag = {
  id: string;
  name: string;
  slug: string;
  normalizedName: string;
  isActive: boolean;
  entryCount: number;
  createdAt: string;
  updatedAt: string;
};

type AdminTagsQuery = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: "name" | "slug" | "createdAt" | "updatedAt";
  sortDirection?: "asc" | "desc";
};

type AdminTagInput = {
  name: string;
  slug?: string;
  isActive?: boolean;
};

type AdminTagMutationResult = Omit<AdminTag, "entryCount">;

type AdminTagsResponse = {
  data: AdminTag[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type { AdminTag, AdminTagInput, AdminTagMutationResult, AdminTagsQuery, AdminTagsResponse };
