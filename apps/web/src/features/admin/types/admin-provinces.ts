type AdminProvinceImage = {
  secureUrl: string;
  thumbnailUrl: string;
  altText: string;
  width: number | null;
  height: number | null;
};

type AdminProvince = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: AdminProvinceImage | null;
  sortOrder: number;
  isActive: boolean;
  entryCount: number;
  districtCount: number;
  createdAt: string;
  updatedAt: string;
};

type AdminProvinceDetail = AdminProvince & {
  publishedEntryCount: number;
  activeDistrictCount: number;
};

type AdminDistrict = {
  id: string;
  provinceId: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  entryCount: number;
  createdAt: string;
  updatedAt: string;
};

type AdminGeographyQuery = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: "name" | "slug" | "sortOrder" | "createdAt" | "updatedAt";
  sortDirection?: "asc" | "desc";
};

type AdminProvinceInput = {
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
};

type AdminDistrictInput = {
  provinceId: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

type AdminGeographyResponse<TItem> = {
  data: TItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

type AdminReorderInput = {
  items: Array<{ id: string; sortOrder: number }>;
};

export type {
  AdminDistrict,
  AdminDistrictInput,
  AdminGeographyQuery,
  AdminGeographyResponse,
  AdminProvince,
  AdminProvinceDetail,
  AdminProvinceImage,
  AdminProvinceInput,
  AdminReorderInput,
};
