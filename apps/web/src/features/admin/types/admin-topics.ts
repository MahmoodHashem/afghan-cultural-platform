type AdminTopic = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  entryCount: number;
  createdAt: string;
  updatedAt: string;
};

type AdminTopicMutationResult = Omit<AdminTopic, "entryCount">;

type AdminTopicsQuery = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: "name" | "slug" | "sortOrder" | "createdAt" | "updatedAt";
  sortDirection?: "asc" | "desc";
};

type AdminTopicInput = {
  name: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
};

type AdminTopicsResponse = {
  data: AdminTopic[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

type AdminTopicReorderInput = {
  items: Array<{ id: string; sortOrder: number }>;
};

export type {
  AdminTopic,
  AdminTopicInput,
  AdminTopicMutationResult,
  AdminTopicReorderInput,
  AdminTopicsQuery,
  AdminTopicsResponse,
};
