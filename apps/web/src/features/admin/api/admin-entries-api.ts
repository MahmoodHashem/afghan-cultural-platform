import {
  mapAdminEntryDetail,
  mapAdminEntryListItem,
} from "@/features/admin/mappers/admin-entry-mapper";
import type {
  AdminEntriesQuery,
  AdminEntriesResponse,
  AdminEntryDetail,
  AdminEntryLifecycleInput,
  AdminEntryLifecycleResult,
  AdminEntryTaxonomyData,
  AdminTaxonomyOption,
} from "@/features/admin/types/admin-entries";
import { apiRequest } from "@/lib/api/api-client";
import { setOptionalSearchParam } from "@/lib/utils/url-search-params";

async function listAdminEntries(query: AdminEntriesQuery, signal?: AbortSignal) {
  const response = await apiRequest<AdminEntriesResponse>(
    `/admin/entries${createQueryString(query)}`,
    {
      method: "GET",
      signal,
    },
  );
  return { ...response, data: response.data.map(mapAdminEntryListItem) };
}

async function getAdminEntry(entryId: string, signal?: AbortSignal) {
  const response = await apiRequest<{ data: AdminEntryDetail }>(`/admin/entries/${entryId}`, {
    method: "GET",
    signal,
  });
  return mapAdminEntryDetail(response.data);
}

async function archiveAdminEntry(entryId: string, input: AdminEntryLifecycleInput) {
  const response = await apiRequest<{ data: AdminEntryLifecycleResult }>(
    `/admin/entries/${entryId}/archive`,
    { method: "POST", body: input },
  );
  return response.data;
}

async function restoreAdminEntry(entryId: string, input: AdminEntryLifecycleInput) {
  const response = await apiRequest<{ data: AdminEntryLifecycleResult }>(
    `/admin/entries/${entryId}/restore`,
    { method: "POST", body: input },
  );
  return response.data;
}

async function getAdminEntryTaxonomy(signal?: AbortSignal): Promise<AdminEntryTaxonomyData> {
  const [provinces, categories, contentTypes] = await Promise.all([
    listAdminTaxonomy("provinces", signal),
    listAdminTaxonomy("categories", signal),
    listAdminTaxonomy("content-types", signal),
  ]);
  return { provinces, categories, contentTypes };
}

async function listAdminTaxonomy(path: string, signal?: AbortSignal) {
  const response = await apiRequest<{ data: AdminTaxonomyOption[] }>(
    `/taxonomy/admin/${path}?page=1&limit=100&sortBy=sortOrder&sortDirection=asc`,
    { method: "GET", signal },
  );
  return response.data;
}

function createQueryString(query: Record<string, unknown>) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string" || typeof value === "number") {
      setOptionalSearchParam(searchParams, key, value);
    }
  }
  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : "";
}

export {
  archiveAdminEntry,
  getAdminEntry,
  getAdminEntryTaxonomy,
  listAdminEntries,
  restoreAdminEntry,
};
