import type { AdminTopicsQuery } from "@/features/admin/types/admin-topics";

const adminTopicsQueryKeys = {
  all: ["admin", "topics"] as const,
  lists: () => [...adminTopicsQueryKeys.all, "list"] as const,
  list: (query: AdminTopicsQuery) => [...adminTopicsQueryKeys.lists(), query] as const,
};

export { adminTopicsQueryKeys };
