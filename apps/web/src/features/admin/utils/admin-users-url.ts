import type {
  AdminAuthMethod,
  AdminUserRole,
  AdminUserStatus,
  AdminUsersQuery,
} from "@/features/admin/types/admin-users";

type SearchParamsReader = {
  get(name: string): string | null;
  toString(): string;
};

const USER_ROLES: AdminUserRole[] = ["USER", "MODERATOR", "ADMIN"];
const USER_STATUSES: AdminUserStatus[] = ["ACTIVE", "SUSPENDED"];
const AUTH_METHODS: AdminAuthMethod[] = ["PASSWORD", "GOOGLE", "FACEBOOK"];
const USER_SORT_FIELDS: NonNullable<AdminUsersQuery["sortBy"]>[] = [
  "createdAt",
  "displayName",
  "lastLoginAt",
];

function parseAdminUsersQuery(searchParams: SearchParamsReader): AdminUsersQuery {
  const role = searchParams.get("role");
  const status = searchParams.get("status");
  const authMethod = searchParams.get("authMethod");
  const verified = searchParams.get("emailVerified");
  const sortBy = searchParams.get("sortBy");
  const sortDirection = searchParams.get("sortDirection");

  return {
    page: parsePositiveInteger(searchParams.get("page"), 1),
    limit: 20,
    search: normalizeOptional(searchParams.get("search")),
    role: USER_ROLES.includes(role as AdminUserRole) ? (role as AdminUserRole) : undefined,
    status: USER_STATUSES.includes(status as AdminUserStatus)
      ? (status as AdminUserStatus)
      : undefined,
    authMethod: AUTH_METHODS.includes(authMethod as AdminAuthMethod)
      ? (authMethod as AdminAuthMethod)
      : undefined,
    emailVerified: verified === "true" ? true : verified === "false" ? false : undefined,
    sortBy: USER_SORT_FIELDS.includes(sortBy as NonNullable<AdminUsersQuery["sortBy"]>)
      ? (sortBy as NonNullable<AdminUsersQuery["sortBy"]>)
      : "createdAt",
    sortDirection: sortDirection === "asc" ? "asc" : "desc",
  };
}

function createAdminUsersHref(
  current: SearchParamsReader,
  updates: Record<string, boolean | number | string | undefined>,
) {
  const next = new URLSearchParams(current.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === "") {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
  }

  const query = next.toString();
  return query ? `/admin/users?${query}` : "/admin/users";
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeOptional(value: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export { createAdminUsersHref, parseAdminUsersQuery };
