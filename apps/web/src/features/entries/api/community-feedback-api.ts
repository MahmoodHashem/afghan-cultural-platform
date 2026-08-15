import { apiRequest } from "@/lib/api/api-client";
import type { PublicReview } from "../types/public-entry";

type PublicReviewResponse = {
  data: PublicReview;
};

type RatingResponse = {
  data: {
    entryId: string;
    value: number;
    averageRating: number;
    ratingCount: number;
  };
};

async function submitPublicReview(entryId: string, body: string) {
  try {
    const response = await apiRequest<PublicReviewResponse>(`/entries/${entryId}/reviews`, {
      method: "PUT",
      body: { body },
    });

    return response.data;
  } catch (error) {
    if (isReviewAlreadyExistsError(error)) {
      const response = await apiRequest<PublicReviewResponse>(`/entries/${entryId}/reviews/me`, {
        method: "PATCH",
        body: { body },
      });

      return response.data;
    }

    throw error;
  }
}

async function submitRating(entryId: string, value: number) {
  const response = await apiRequest<RatingResponse>(`/entries/${entryId}/rating`, {
    method: "PUT",
    body: { value },
  });

  return response.data;
}

function isReviewAlreadyExistsError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "COMMUNITY_REVIEW_ALREADY_EXISTS"
  );
}

export { submitPublicReview, submitRating };
