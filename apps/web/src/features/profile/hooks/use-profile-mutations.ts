"use client";

import { type QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { engagementQueryKeys } from "@/features/engagement/constants/engagement-query-keys";
import {
  deleteMyProfileImage,
  type ProfileOwner,
  type UpdateProfileInput,
  updateMyProfile,
  uploadMyProfileImage,
} from "@/features/profile/api/profile-api";
import { profileQueryKeys } from "@/features/profile/constants/profile-query-keys";
import { isApiError } from "@/lib/api/api-error";
import { getApiErrorMessage } from "@/lib/api/api-error-messages";
import { useAuthStore } from "@/stores/auth-store";

function useProfileIdentityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateMyProfile(input),
    onSuccess: (profile) => {
      syncProfileOwner(queryClient, profile);
      toast.success("نام شما ذخیره شد.");
    },
    onError: (error) => toast.error(getProfileMutationError(error)),
  });
}

function useProfileImageUploadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadMyProfileImage(file),
    onSuccess: (profile) => {
      syncProfileOwner(queryClient, profile);
      toast.success("تصویر پروفایل ذخیره شد.");
    },
    onError: (error) => toast.error(getProfileMutationError(error)),
  });
}

function useProfileImageDeleteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMyProfileImage,
    onSuccess: (profile) => {
      syncProfileOwner(queryClient, profile);
      toast.success("تصویر پروفایل حذف شد.");
    },
    onError: (error) => toast.error(getProfileMutationError(error)),
  });
}

function syncProfileOwner(queryClient: QueryClient, profile: ProfileOwner) {
  queryClient.setQueryData(profileQueryKeys.owner(), profile);
  void queryClient.invalidateQueries({ queryKey: engagementQueryKeys.all });
  const authUser = useAuthStore.getState().user;

  if (authUser) {
    useAuthStore.getState().updateUser({
      ...authUser,
      displayName: profile.displayName,
      profileImageUrl: profile.profileImageUrl,
    });
  }
}

function getProfileMutationError(error: unknown) {
  if (isApiError(error)) {
    if (error.code === "PROFILE_IMAGE_TOO_LARGE") {
      return "حجم تصویر بیشتر از حد مجاز است.";
    }

    if (error.code === "PROFILE_IMAGE_INVALID_TYPE") {
      return "فقط تصویر JPEG، PNG یا WebP انتخاب کنید.";
    }

    if (error.code === "PROFILE_DISPLAY_NAME_INVALID") {
      return "نام باید بین ۲ تا ۸۰ حرف باشد.";
    }
  }

  return isApiError(error)
    ? getApiErrorMessage(error)
    : "ذخیره تغییرات انجام نشد. دوباره تلاش کنید.";
}

export { useProfileIdentityMutation, useProfileImageDeleteMutation, useProfileImageUploadMutation };
