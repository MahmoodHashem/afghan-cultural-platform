import type { AdminGeographyQuery } from "@/features/admin/types/admin-provinces";

const adminProvincesQueryKeys = {
  all: ["admin", "taxonomy", "provinces"] as const,
  lists: () => [...adminProvincesQueryKeys.all, "list"] as const,
  list: (query: AdminGeographyQuery) => [...adminProvincesQueryKeys.lists(), query] as const,
  details: () => [...adminProvincesQueryKeys.all, "detail"] as const,
  detail: (provinceId: string) => [...adminProvincesQueryKeys.details(), provinceId] as const,
  districts: (provinceId: string) =>
    [...adminProvincesQueryKeys.detail(provinceId), "districts"] as const,
  districtList: (provinceId: string, query: AdminGeographyQuery) =>
    [...adminProvincesQueryKeys.districts(provinceId), query] as const,
};

export { adminProvincesQueryKeys };
