import type { AdminDescribedTaxonomyConfig } from "@/features/admin/constants/admin-described-taxonomy";
import type {
  AdminTopicInput,
  AdminTopicMutationResult,
  AdminTopicReorderInput,
  AdminTopicsQuery,
  AdminTopicsResponse,
} from "@/features/admin/types/admin-topics";
import { apiRequest } from "@/lib/api/api-client";
import { setOptionalSearchParam } from "@/lib/utils/url-search-params";

async function listAdminTopics(
  resource: AdminDescribedTaxonomyConfig["endpoint"],
  query: AdminTopicsQuery,
  signal?: AbortSignal,
) {
  return apiRequest<AdminTopicsResponse>(`/taxonomy/admin/${resource}${createQueryString(query)}`, {
    method: "GET",
    signal,
  });
}

async function createAdminTopic(
  resource: AdminDescribedTaxonomyConfig["endpoint"],
  input: AdminTopicInput,
) {
  const response = await apiRequest<{ data: AdminTopicMutationResult }>(
    `/taxonomy/admin/${resource}`,
    {
      method: "POST",
      body: input,
    },
  );
  return response.data;
}

async function updateAdminTopic(
  resource: AdminDescribedTaxonomyConfig["endpoint"],
  topicId: string,
  input: AdminTopicInput,
) {
  const response = await apiRequest<{ data: AdminTopicMutationResult }>(
    `/taxonomy/admin/${resource}/${topicId}`,
    { method: "PATCH", body: input },
  );
  return response.data;
}

async function setAdminTopicActive(
  resource: AdminDescribedTaxonomyConfig["endpoint"],
  topicId: string,
  isActive: boolean,
) {
  const response = await apiRequest<{ data: AdminTopicMutationResult }>(
    `/taxonomy/admin/${resource}/${topicId}/active`,
    { method: "PATCH", body: { isActive } },
  );
  return response.data;
}

async function reorderAdminTopics(
  resource: AdminDescribedTaxonomyConfig["endpoint"],
  input: AdminTopicReorderInput,
) {
  const response = await apiRequest<{ data: { message: string } }>(
    `/taxonomy/admin/${resource}/reorder`,
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
