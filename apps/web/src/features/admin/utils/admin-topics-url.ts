import type { AdminTopicsQuery } from "@/features/admin/types/admin-topics";

type SearchParamsReader = { get(name: string): string | null; toString(): string };
const sortFields: NonNullable<AdminTopicsQuery["sortBy"]>[] = [
  "name",
  "slug",
  "sortOrder",
  "createdAt",
  "updatedAt",
];

function parseAdminTopicsQuery(searchParams: SearchParamsReader): AdminTopicsQuery {
  const active = searchParams.get("isActive");
  const sortBy = searchParams.get("sortBy");
  return {
    page: positiveInteger(searchParams.get("page"), 1),
    limit: 20,
    search: optional(searchParams.get("search")),
    isActive: active === "true" ? true : active === "false" ? false : undefined,
    sortBy: sortFields.includes(sortBy as NonNullable<AdminTopicsQuery["sortBy"]>)
      ? (sortBy as NonNullable<AdminTopicsQuery["sortBy"]>)
      : "sortOrder",
    sortDirection: searchParams.get("sortDirection") === "desc" ? "desc" : "asc",
  };
}

function createAdminTopicsHref(
  current: SearchParamsReader,
  updates: Record<string, boolean | number | string | undefined>,
) {
  const next = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === "") next.delete(key);
    else next.set(key, String(value));
  }
  const query = next.toString();
  return query ? `/admin/topics?${query}` : "/admin/topics";
}

function optional(value: string | null) {
  const normalized = value?.trim();
  return normalized || undefined;
}

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export { createAdminTopicsHref, parseAdminTopicsQuery };
