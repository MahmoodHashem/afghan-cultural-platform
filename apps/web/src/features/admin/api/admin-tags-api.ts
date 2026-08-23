import type {
  AdminTagInput,
  AdminTagMutationResult,
  AdminTagsQuery,
  AdminTagsResponse,
} from "@/features/admin/types/admin-tags";
import { apiRequest } from "@/lib/api/api-client";
import { setOptionalSearchParam } from "@/lib/utils/url-search-params";

async function listAdminTags(query: AdminTagsQuery, signal?: AbortSignal) {
  return apiRequest<AdminTagsResponse>(`/taxonomy/admin/tags${createQueryString(query)}`, {
    method: "GET",
    signal,
  });
}

async function createAdminTag(input: AdminTagInput) {
  const response = await apiRequest<{ data: AdminTagMutationResult }>("/taxonomy/admin/tags", {
    method: "POST",
    body: input,
  });
  return response.data;
}

async function updateAdminTag(tagId: string, input: AdminTagInput) {
  const response = await apiRequest<{ data: AdminTagMutationResult }>(
    `/taxonomy/admin/tags/${tagId}`,
    { method: "PATCH", body: input },
  );
  return response.data;
}

async function setAdminTagActive(tagId: string, isActive: boolean) {
  const response = await apiRequest<{ data: AdminTagMutationResult }>(
    `/taxonomy/admin/tags/${tagId}/active`,
    { method: "PATCH", body: { isActive } },
  );
  return response.data;
}

function createQueryString(query: AdminTagsQuery) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean")
      setOptionalSearchParam(searchParams, key, value);
  }
  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : "";
}

export { createAdminTag, listAdminTags, setAdminTagActive, updateAdminTag };
