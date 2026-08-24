import type {
  AdminListResponse,
  AdminUserActivity,
  AdminUserActivityQuery,
  AdminUserComment,
  AdminUserCommentsQuery,
  AdminUserDetail,
  AdminUserEntriesQuery,
  AdminUserEntry,
  AdminUserListItem,
  AdminUsersQuery,
  UpdateAdminUserStatusInput,
} from "@/features/admin/types/admin-users";
import { apiRequest } from "@/lib/api/api-client";
import { setOptionalSearchParam } from "@/lib/utils/url-search-params";

async function listAdminUsers(query: AdminUsersQuery, signal?: AbortSignal) {
  return apiRequest<AdminListResponse<AdminUserListItem>>(
    `/admin/users${createQueryString(query)}`,
    { method: "GET", signal },
  );
}

async function getAdminUser(userId: string, signal?: AbortSignal) {
  const response = await apiRequest<{ data: AdminUserDetail }>(`/admin/users/${userId}`, {
    method: "GET",
    signal,
  });
  return response.data;
}

async function listAdminUserEntries(
  userId: string,
  query: AdminUserEntriesQuery,
  signal?: AbortSignal,
) {
  return apiRequest<AdminListResponse<AdminUserEntry>>(
    `/admin/users/${userId}/entries${createQueryString(query)}`,
    { method: "GET", signal },
  );
}

async function listAdminUserComments(
  userId: string,
  query: AdminUserCommentsQuery,
  signal?: AbortSignal,
) {
  return apiRequest<AdminListResponse<AdminUserComment>>(
    `/admin/users/${userId}/comments${createQueryString(query)}`,
    { method: "GET", signal },
  );
}

async function listAdminUserActivity(
  userId: string,
  query: AdminUserActivityQuery,
  signal?: AbortSignal,
) {
  return apiRequest<AdminListResponse<AdminUserActivity>>(
    `/admin/users/${userId}/activity${createQueryString(query)}`,
    { method: "GET", signal },
  );
}

async function updateAdminUserStatus(userId: string, input: UpdateAdminUserStatusInput) {
  const response = await apiRequest<{
    data: { id: string; status: UpdateAdminUserStatusInput["status"]; suspendedAt: string | null };
  }>(`/admin/users/${userId}/status`, {
    method: "PATCH",
    body: input,
  });
  return response.data;
}

async function revokeAdminUserSessions(userId: string) {
  const response = await apiRequest<{ data: { userId: string; revokedSessions: number } }>(
    `/admin/users/${userId}/revoke-sessions`,
    { method: "POST" },
  );
  return response.data;
}

function createQueryString(query: Record<string, unknown>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      setOptionalSearchParam(searchParams, key, value);
    }
  }

  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : "";
}

export {
  getAdminUser,
  listAdminUserActivity,
  listAdminUserComments,
  listAdminUserEntries,
  listAdminUsers,
  revokeAdminUserSessions,
  updateAdminUserStatus,
};
