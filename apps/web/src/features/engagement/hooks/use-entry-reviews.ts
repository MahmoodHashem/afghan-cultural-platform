"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createEntryReview,
  deleteOwnEntryReview,
  listEntryReviews,
  updateOwnEntryReview,
} from "@/features/engagement/api/entry-engagement-api";
import { engagementQueryKeys } from "@/features/engagement/constants/engagement-query-keys";
import { getEngagementErrorMessage } from "@/features/engagement/utils/engagement-errors";
import type { PublicReview } from "@/features/entries/types/public-entry";
import { profileQueryKeys } from "@/features/profile/constants/profile-query-keys";

function useEntryReviews(entryId: string, initialReviews: PublicReview[]) {
  return useQuery({
    queryKey: engagementQueryKeys.reviews(entryId),
    queryFn: ({ signal }) => listEntryReviews(entryId, signal),
    initialData: initialReviews,
    staleTime: initialReviews.length > 0 ? 30_000 : 0,
    refetchOnMount: initialReviews.length === 0 ? "always" : false,
  });
}

function useCreateEntryReview(entryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => createEntryReview(entryId, body),
    onSuccess: async (review) => {
      queryClient.setQueryData<PublicReview[]>(engagementQueryKeys.reviews(entryId), (current) => [
        review,
        ...(current ?? []).filter((item) => item.id !== review.id),
      ]);
      toast.success("دیدگاه شما ثبت شد.");
      await syncProfileReviewQueries(queryClient);
    },
    onError: (error) => {
      toast.error(getEngagementErrorMessage(error));
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: engagementQueryKeys.reviews(entryId),
        exact: true,
      });
    },
  });
}

function useUpdateEntryReview(entryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => updateOwnEntryReview(entryId, body),
    onSuccess: async (review) => {
      queryClient.setQueryData<PublicReview[]>(engagementQueryKeys.reviews(entryId), (current) =>
        (current ?? []).map((item) => (item.id === review.id ? review : item)),
      );
      toast.success("دیدگاه شما ویرایش شد.");
      await syncProfileReviewQueries(queryClient);
    },
    onError: (error) => {
      toast.error(getEngagementErrorMessage(error));
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: engagementQueryKeys.reviews(entryId),
        exact: true,
      });
    },
  });
}

function useDeleteEntryReview(entryId: string, reviewId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteOwnEntryReview(entryId),
    onSuccess: async () => {
      queryClient.setQueryData<PublicReview[]>(engagementQueryKeys.reviews(entryId), (current) =>
        (current ?? []).filter((review) => review.id !== reviewId),
      );
      toast.success("دیدگاه شما حذف شد.");
      await syncProfileReviewQueries(queryClient);
    },
    onError: (error) => {
      toast.error(getEngagementErrorMessage(error));
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: engagementQueryKeys.reviews(entryId),
        exact: true,
      });
    },
  });
}

async function syncProfileReviewQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: profileQueryKeys.reviewLists() }),
    queryClient.invalidateQueries({ queryKey: profileQueryKeys.stats() }),
  ]);
}

export { useCreateEntryReview, useDeleteEntryReview, useEntryReviews, useUpdateEntryReview };
