import type {
  AdminDistrict,
  AdminDistrictInput,
  AdminGeographyQuery,
  AdminGeographyResponse,
  AdminProvince,
  AdminProvinceDetail,
  AdminProvinceInput,
  AdminReorderInput,
} from "@/features/admin/types/admin-provinces";
import { apiRequest } from "@/lib/api/api-client";
import { setOptionalSearchParam } from "@/lib/utils/url-search-params";

function listAdminProvinces(query: AdminGeographyQuery, signal?: AbortSignal) {
  return apiRequest<AdminGeographyResponse<AdminProvince>>(
    `/taxonomy/admin/provinces${createQueryString(query)}`,
    { method: "GET", signal },
  );
}

async function getAdminProvince(provinceId: string, signal?: AbortSignal) {
  const response = await apiRequest<{ data: AdminProvinceDetail }>(
    `/taxonomy/admin/provinces/${provinceId}`,
    { method: "GET", signal },
  );
  return response.data;
}

async function updateAdminProvince(provinceId: string, input: AdminProvinceInput) {
  const response = await apiRequest<{ data: AdminProvince }>(
    `/taxonomy/admin/provinces/${provinceId}`,
    { method: "PATCH", body: input },
  );
  return response.data;
}

async function setAdminProvinceActive(provinceId: string, isActive: boolean) {
  const response = await apiRequest<{ data: AdminProvince }>(
    `/taxonomy/admin/provinces/${provinceId}/active`,
    { method: "PATCH", body: { isActive } },
  );
  return response.data;
}

async function reorderAdminProvinces(input: AdminReorderInput) {
  await apiRequest("/taxonomy/admin/provinces/reorder", { method: "PATCH", body: input });
}

function listAdminDistricts(provinceId: string, query: AdminGeographyQuery, signal?: AbortSignal) {
  return apiRequest<AdminGeographyResponse<AdminDistrict>>(
    `/taxonomy/admin/districts${createQueryString({ ...query, provinceId })}`,
    { method: "GET", signal },
  );
}

async function createAdminDistrict(input: AdminDistrictInput) {
  const response = await apiRequest<{ data: AdminDistrict }>("/taxonomy/admin/districts", {
    method: "POST",
    body: input,
  });
  return response.data;
}

async function updateAdminDistrict(districtId: string, input: AdminDistrictInput) {
  const response = await apiRequest<{ data: AdminDistrict }>(
    `/taxonomy/admin/districts/${districtId}`,
    { method: "PATCH", body: input },
  );
  return response.data;
}

async function setAdminDistrictActive(districtId: string, isActive: boolean) {
  const response = await apiRequest<{ data: AdminDistrict }>(
    `/taxonomy/admin/districts/${districtId}/active`,
    { method: "PATCH", body: { isActive } },
  );
  return response.data;
}

async function reorderAdminDistricts(input: AdminReorderInput) {
  await apiRequest("/taxonomy/admin/districts/reorder", { method: "PATCH", body: input });
}

async function uploadAdminProvinceImage(provinceId: string, file: File, altText: string) {
  const formData = new FormData();
  formData.set("image", file);
  formData.set("altText", altText);
  const response = await apiRequest<{ data: AdminProvince }>(
    `/taxonomy/admin/provinces/${provinceId}/image`,
    { method: "POST", body: formData },
  );
  return response.data;
}

async function updateAdminProvinceImage(provinceId: string, altText: string) {
  const response = await apiRequest<{ data: AdminProvince }>(
    `/taxonomy/admin/provinces/${provinceId}/image`,
    { method: "PATCH", body: { altText } },
  );
  return response.data;
}

async function deleteAdminProvinceImage(provinceId: string) {
  await apiRequest(`/taxonomy/admin/provinces/${provinceId}/image`, { method: "DELETE" });
}

function createQueryString(query: AdminGeographyQuery & { provinceId?: string }) {
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
  createAdminDistrict,
  deleteAdminProvinceImage,
  getAdminProvince,
  listAdminDistricts,
  listAdminProvinces,
  reorderAdminDistricts,
  reorderAdminProvinces,
  setAdminDistrictActive,
  setAdminProvinceActive,
  updateAdminDistrict,
  updateAdminProvince,
  updateAdminProvinceImage,
  uploadAdminProvinceImage,
};
