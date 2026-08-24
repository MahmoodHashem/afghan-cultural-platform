"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getAdminUser,
  listAdminUserActivity,
  listAdminUserComments,
  listAdminUserEntries,
  listAdminUsers,
  revokeAdminUserSessions,
  updateAdminUserStatus,
} from "@/features/admin/api/admin-users-api";
import { adminUsersQueryKeys } from "@/features/admin/constants/admin-users-query-keys";
import type {
  AdminUserActivityQuery,
  AdminUserCommentsQuery,
  AdminUserEntriesQuery,
  AdminUsersQuery,
  UpdateAdminUserStatusInput,
} from "@/features/admin/types/admin-users";
import { getAdminUserErrorMessage } from "@/features/admin/utils/admin-user-errors";

function useAdminUsers(query: AdminUsersQuery) {
  return useQuery({
    queryKey: adminUsersQueryKeys.list(query),
    queryFn: ({ signal }) => listAdminUsers(query, signal),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

function useAdminUser(userId: string) {
  return useQuery({
    queryKey: adminUsersQueryKeys.detail(userId),
    queryFn: ({ signal }) => getAdminUser(userId, signal),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

function useAdminUserEntries(userId: string, query: AdminUserEntriesQuery, enabled = true) {
  return useQuery({
    queryKey: adminUsersQueryKeys.entries(userId, query),
    queryFn: ({ signal }) => listAdminUserEntries(userId, query, signal),
    enabled: enabled && Boolean(userId),
    staleTime: 30_000,
  });
}

function useAdminUserComments(userId: string, query: AdminUserCommentsQuery, enabled = true) {
  return useQuery({
    queryKey: adminUsersQueryKeys.comments(userId, query),
    queryFn: ({ signal }) => listAdminUserComments(userId, query, signal),
    enabled: enabled && Boolean(userId),
    staleTime: 30_000,
  });
}

function useAdminUserActivity(userId: string, query: AdminUserActivityQuery, enabled = true) {
  return useQuery({
    queryKey: adminUsersQueryKeys.activity(userId, query),
    queryFn: ({ signal }) => listAdminUserActivity(userId, query, signal),
    enabled: enabled && Boolean(userId),
    staleTime: 30_000,
  });
}

function useUpdateAdminUserStatus(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAdminUserStatusInput) => updateAdminUserStatus(userId, input),
    onSuccess: async (result) => {
      toast.success(result.status === "SUSPENDED" ? "حساب تعلیق شد." : "حساب دوباره فعال شد.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.detail(userId) }),
      ]);
    },
    onError: (error) => toast.error(getAdminUserErrorMessage(error)),
  });
}

function useRevokeAdminUserSessions(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => revokeAdminUserSessions(userId),
    onSuccess: async (result) => {
      toast.success(
        result.revokedSessions > 0
          ? "نشست‌های فعال این حساب پایان یافت."
          : "این حساب نشست فعالی نداشت.",
      );
      await queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.detail(userId) });
    },
    onError: (error) => toast.error(getAdminUserErrorMessage(error)),
  });
}

export {
  useAdminUser,
  useAdminUserActivity,
  useAdminUserComments,
  useAdminUserEntries,
  useAdminUsers,
  useRevokeAdminUserSessions,
  useUpdateAdminUserStatus,
};
