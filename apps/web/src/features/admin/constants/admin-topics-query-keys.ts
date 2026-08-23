import type { AdminDescribedTaxonomyKind } from "@/features/admin/constants/admin-described-taxonomy";
import type { AdminTopicsQuery } from "@/features/admin/types/admin-topics";

const adminTopicsQueryKeys = {
  all: (kind: AdminDescribedTaxonomyKind) => ["admin", "taxonomy", kind] as const,
  lists: (kind: AdminDescribedTaxonomyKind) => [...adminTopicsQueryKeys.all(kind), "list"] as const,
  list: (kind: AdminDescribedTaxonomyKind, query: AdminTopicsQuery) =>
    [...adminTopicsQueryKeys.lists(kind), query] as const,
};

export { adminTopicsQueryKeys };
