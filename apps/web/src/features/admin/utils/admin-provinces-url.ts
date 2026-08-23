import type { AdminGeographyQuery } from "@/features/admin/types/admin-provinces";

type SearchParamsReader = { get(name: string): string | null; toString(): string };
const sortFields: NonNullable<AdminGeographyQuery["sortBy"]>[] = [
  "name",
  "slug",
  "sortOrder",
  "createdAt",
  "updatedAt",
];

function parseAdminGeographyQuery(
  searchParams: SearchParamsReader,
  defaultLimit: number,
): AdminGeographyQuery {
  const active = searchParams.get("isActive");
  const sortBy = searchParams.get("sortBy");
  return {
    page: positiveInteger(searchParams.get("page"), 1),
    limit: defaultLimit,
    search: optional(searchParams.get("search")),
    isActive: active === "true" ? true : active === "false" ? false : undefined,
    sortBy: sortFields.includes(sortBy as NonNullable<AdminGeographyQuery["sortBy"]>)
      ? (sortBy as NonNullable<AdminGeographyQuery["sortBy"]>)
      : "sortOrder",
    sortDirection: searchParams.get("sortDirection") === "desc" ? "desc" : "asc",
  };
}

function createAdminGeographyHref(
  current: SearchParamsReader,
  updates: Record<string, boolean | number | string | undefined>,
  route: string,
) {
  const next = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === "") next.delete(key);
    else next.set(key, String(value));
  }
  const query = next.toString();
  return query ? `${route}?${query}` : route;
}

function optional(value: string | null) {
  const normalized = value?.trim();
  return normalized || undefined;
}

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export { createAdminGeographyHref, parseAdminGeographyQuery };
