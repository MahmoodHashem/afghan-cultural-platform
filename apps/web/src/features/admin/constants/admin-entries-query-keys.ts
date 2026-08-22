import type { AdminEntriesQuery } from "@/features/admin/types/admin-entries";

const adminEntriesQueryKeys = {
  all: ["admin", "entries"] as const,
  lists: () => [...adminEntriesQueryKeys.all, "list"] as const,
  list: (query: AdminEntriesQuery) => [...adminEntriesQueryKeys.lists(), query] as const,
  details: () => [...adminEntriesQueryKeys.all, "detail"] as const,
  detail: (entryId: string) => [...adminEntriesQueryKeys.details(), entryId] as const,
  taxonomy: () => [...adminEntriesQueryKeys.all, "taxonomy"] as const,
};

export { adminEntriesQueryKeys };
