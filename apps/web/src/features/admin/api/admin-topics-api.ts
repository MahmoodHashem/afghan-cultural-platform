import type {
  AdminTopicInput,
  AdminTopicMutationResult,
  AdminTopicReorderInput,
  AdminTopicsQuery,
  AdminTopicsResponse,
} from "@/features/admin/types/admin-topics";
import { apiRequest } from "@/lib/api/api-client";
import { setOptionalSearchParam } from "@/lib/utils/url-search-params";

async function listAdminTopics(query: AdminTopicsQuery, signal?: AbortSignal) {
  return apiRequest<AdminTopicsResponse>(`/taxonomy/admin/categories${createQueryString(query)}`, {
    method: "GET",
    signal,
  });
}

async function createAdminTopic(input: AdminTopicInput) {
  const response = await apiRequest<{ data: AdminTopicMutationResult }>(
    "/taxonomy/admin/categories",
    {
      method: "POST",
      body: input,
    },
  );
  return response.data;
}

async function updateAdminTopic(topicId: string, input: AdminTopicInput) {
  const response = await apiRequest<{ data: AdminTopicMutationResult }>(
    `/taxonomy/admin/categories/${topicId}`,
    { method: "PATCH", body: input },
  );
  return response.data;
}

async function setAdminTopicActive(topicId: string, isActive: boolean) {
  const response = await apiRequest<{ data: AdminTopicMutationResult }>(
    `/taxonomy/admin/categories/${topicId}/active`,
    { method: "PATCH", body: { isActive } },
  );
  return response.data;
}

async function reorderAdminTopics(input: AdminTopicReorderInput) {
  const response = await apiRequest<{ data: { message: string } }>(
    "/taxonomy/admin/categories/reorder",
    { method: "PATCH", body: input },
  );
  return response.data;
}

function createQueryString(query: AdminTopicsQuery) {
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
  createAdminTopic,
  listAdminTopics,
  reorderAdminTopics,
  setAdminTopicActive,
  updateAdminTopic,
};
