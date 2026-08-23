import type { AdminTagsQuery } from "@/features/admin/types/admin-tags";

const adminTagsQueryKeys = {
  all: ["admin", "taxonomy", "tags"] as const,
  lists: () => [...adminTagsQueryKeys.all, "list"] as const,
  list: (query: AdminTagsQuery) => [...adminTagsQueryKeys.lists(), query] as const,
};

export { adminTagsQueryKeys };
