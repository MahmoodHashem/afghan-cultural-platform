"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
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
} from "@/features/admin/api/admin-provinces-api";
import { adminEntriesQueryKeys } from "@/features/admin/constants/admin-entries-query-keys";
import { adminProvincesQueryKeys } from "@/features/admin/constants/admin-provinces-query-keys";
import type {
  AdminDistrictInput,
  AdminGeographyQuery,
  AdminProvinceInput,
  AdminReorderInput,
} from "@/features/admin/types/admin-provinces";
import { getAdminProvinceErrorMessage } from "@/features/admin/utils/admin-province-errors";

function useAdminProvinces(query: AdminGeographyQuery) {
  return useQuery({
    queryKey: adminProvincesQueryKeys.list(query),
    queryFn: ({ signal }) => listAdminProvinces(query, signal),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

function useAdminProvince(provinceId: string) {
  return useQuery({
    queryKey: adminProvincesQueryKeys.detail(provinceId),
    queryFn: ({ signal }) => getAdminProvince(provinceId, signal),
    enabled: Boolean(provinceId),
    staleTime: 30_000,
  });
}

function useAdminDistricts(provinceId: string, query: AdminGeographyQuery) {
  return useQuery({
    queryKey: adminProvincesQueryKeys.districtList(provinceId, query),
    queryFn: ({ signal }) => listAdminDistricts(provinceId, query, signal),
    enabled: Boolean(provinceId),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

function useUpdateAdminProvince(provinceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminProvinceInput) => updateAdminProvince(provinceId, input),
    onSuccess: async () => {
      toast.success("اطلاعات ولایت ذخیره شد.");
      await invalidateProvinceQueries(queryClient, provinceId);
    },
    onError: (error) => toast.error(getAdminProvinceErrorMessage(error)),
  });
}

function useSetAdminProvinceActive(provinceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isActive: boolean) => setAdminProvinceActive(provinceId, isActive),
    onSuccess: async (_, isActive) => {
      toast.success(isActive ? "ولایت فعال شد." : "ولایت غیرفعال شد.");
      await invalidateProvinceQueries(queryClient, provinceId);
    },
    onError: (error) => toast.error(getAdminProvinceErrorMessage(error)),
  });
}

function useReorderAdminProvinces() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminReorderInput) => reorderAdminProvinces(input),
    onSuccess: async () => {
      toast.success("ترتیب ولایت‌ها ذخیره شد.");
      await queryClient.invalidateQueries({ queryKey: adminProvincesQueryKeys.lists() });
    },
    onError: (error) => toast.error(getAdminProvinceErrorMessage(error)),
  });
}

function useProvinceImageMutations(provinceId: string) {
  const queryClient = useQueryClient();
  const invalidate = () => invalidateProvinceQueries(queryClient, provinceId);
  const upload = useMutation({
    mutationFn: ({ file, altText }: { file: File; altText: string }) =>
      uploadAdminProvinceImage(provinceId, file, altText),
    onSuccess: async () => {
      toast.success("تصویر ولایت ذخیره شد.");
      await invalidate();
    },
    onError: (error) => toast.error(getAdminProvinceErrorMessage(error)),
  });
  const updateMetadata = useMutation({
    mutationFn: (altText: string) => updateAdminProvinceImage(provinceId, altText),
    onSuccess: async () => {
      toast.success("متن جایگزین تصویر ذخیره شد.");
      await invalidate();
    },
    onError: (error) => toast.error(getAdminProvinceErrorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: () => deleteAdminProvinceImage(provinceId),
    onSuccess: async () => {
      toast.success("تصویر مدیریت‌شده حذف شد.");
      await invalidate();
    },
    onError: (error) => toast.error(getAdminProvinceErrorMessage(error)),
  });
  return { upload, updateMetadata, remove };
}

function useDistrictMutations(provinceId: string, districtId?: string) {
  const queryClient = useQueryClient();
  const invalidate = () => invalidateDistrictQueries(queryClient, provinceId);
  const create = useMutation({
    mutationFn: (input: AdminDistrictInput) => createAdminDistrict(input),
    onSuccess: async () => {
      toast.success("ولسوالی جدید ساخته شد.");
      await invalidate();
    },
    onError: (error) => toast.error(getAdminProvinceErrorMessage(error)),
  });
  const update = useMutation({
    mutationFn: (input: AdminDistrictInput) => updateAdminDistrict(districtId ?? "", input),
    onSuccess: async () => {
      toast.success("تغییرات ولسوالی ذخیره شد.");
      await invalidate();
    },
    onError: (error) => toast.error(getAdminProvinceErrorMessage(error)),
  });
  const setActive = useMutation({
    mutationFn: (isActive: boolean) => setAdminDistrictActive(districtId ?? "", isActive),
    onSuccess: async (_, isActive) => {
      toast.success(isActive ? "ولسوالی فعال شد." : "ولسوالی غیرفعال شد.");
      await invalidate();
    },
    onError: (error) => toast.error(getAdminProvinceErrorMessage(error)),
  });
  const reorder = useMutation({
    mutationFn: (input: AdminReorderInput) => reorderAdminDistricts(input),
    onSuccess: async () => {
      toast.success("ترتیب ولسوالی‌ها ذخیره شد.");
      await invalidate();
    },
    onError: (error) => toast.error(getAdminProvinceErrorMessage(error)),
  });
  return { create, update, setActive, reorder };
}

async function invalidateProvinceQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  provinceId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: adminProvincesQueryKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: adminProvincesQueryKeys.detail(provinceId) }),
    queryClient.invalidateQueries({ queryKey: adminEntriesQueryKeys.taxonomy() }),
  ]);
}

async function invalidateDistrictQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  provinceId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: adminProvincesQueryKeys.districts(provinceId) }),
    queryClient.invalidateQueries({ queryKey: adminProvincesQueryKeys.detail(provinceId) }),
    queryClient.invalidateQueries({ queryKey: adminProvincesQueryKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: adminEntriesQueryKeys.taxonomy() }),
  ]);
}

export {
  useAdminDistricts,
  useAdminProvince,
  useAdminProvinces,
  useDistrictMutations,
  useProvinceImageMutations,
  useReorderAdminProvinces,
  useSetAdminProvinceActive,
  useUpdateAdminProvince,
};
