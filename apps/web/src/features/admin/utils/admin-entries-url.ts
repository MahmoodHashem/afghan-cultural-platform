import type {
  AdminEntriesQuery,
  AdminEntrySortField,
  AdminGeographicScope,
} from "@/features/admin/types/admin-entries";
import type { AdminEntryStatus } from "@/features/admin/types/admin-users";

type SearchParamsReader = { get(name: string): string | null; toString(): string };
const statuses: AdminEntryStatus[] = [
  "DRAFT",
  "PENDING_REVIEW",
  "CHANGES_REQUESTED",
  "PUBLISHED",
  "REJECTED",
  "HIDDEN",
  "ARCHIVED",
];
const scopes: AdminGeographicScope[] = ["PROVINCE", "NATIONAL", "NONE"];
const sortFields: AdminEntrySortField[] = [
  "createdAt",
  "updatedAt",
  "submittedAt",
  "publishedAt",
  "title",
  "viewCount",
];

function parseAdminEntriesQuery(searchParams: SearchParamsReader): AdminEntriesQuery {
  const status = searchParams.get("status");
  const scope = searchParams.get("geographicScope");
  const sortBy = searchParams.get("sortBy");
  return {
    page: parsePositiveInteger(searchParams.get("page"), 1),
    limit: 20,
    search: optional(searchParams.get("search")),
    status: statuses.includes(status as AdminEntryStatus)
      ? (status as AdminEntryStatus)
      : undefined,
    categoryId: optional(searchParams.get("categoryId")),
    contentTypeId: optional(searchParams.get("contentTypeId")),
    provinceId: optional(searchParams.get("provinceId")),
    geographicScope: scopes.includes(scope as AdminGeographicScope)
      ? (scope as AdminGeographicScope)
      : undefined,
    authorId: optional(searchParams.get("authorId")),
    sortBy: sortFields.includes(sortBy as AdminEntrySortField)
      ? (sortBy as AdminEntrySortField)
      : "updatedAt",
    sortDirection: searchParams.get("sortDirection") === "asc" ? "asc" : "desc",
  };
}

function createAdminEntriesHref(
  current: SearchParamsReader,
  updates: Record<string, number | string | undefined>,
) {
  const next = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === "") next.delete(key);
    else next.set(key, String(value));
  }
  const query = next.toString();
  return query ? `/admin/entries?${query}` : "/admin/entries";
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function optional(value: string | null) {
  const normalized = value?.trim();
  return normalized || undefined;
}

export { createAdminEntriesHref, parseAdminEntriesQuery };
