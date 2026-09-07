import type { AdminUsersQuery } from "@/features/admin/types/admin-users";

type AdminModeratorsQuery = Pick<
  AdminUsersQuery,
  "page" | "limit" | "search" | "status" | "emailVerified" | "sortBy" | "sortDirection"
>;

type SearchParamsReader = {
  get(name: string): string | null;
  toString(): string;
};

function parseAdminModeratorsQuery(searchParams: SearchParamsReader): AdminModeratorsQuery {
  const status = searchParams.get("status");
  const verified = searchParams.get("emailVerified");
  const sortBy = searchParams.get("sortBy");

  return {
    page: parsePositiveInteger(searchParams.get("page"), 1),
    limit: 20,
    search: normalizeOptional(searchParams.get("search")),
    status: status === "ACTIVE" || status === "SUSPENDED" ? status : undefined,
    emailVerified: verified === "true" ? true : verified === "false" ? false : undefined,
    sortBy:
      sortBy === "displayName" || sortBy === "lastLoginAt" || sortBy === "createdAt"
        ? sortBy
        : "createdAt",
    sortDirection: searchParams.get("sortDirection") === "asc" ? "asc" : "desc",
  };
}

function createAdminModeratorsHref(
  current: SearchParamsReader,
  updates: Record<string, boolean | number | string | undefined>,
) {
  const next = new URLSearchParams(current.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === "") next.delete(key);
    else next.set(key, String(value));
  }

  const query = next.toString();
  return query ? `/admin/moderators?${query}` : "/admin/moderators";
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeOptional(value: string | null) {
  const normalized = value?.trim();
  return normalized || undefined;
}

export type { AdminModeratorsQuery };
export { createAdminModeratorsHref, parseAdminModeratorsQuery };
