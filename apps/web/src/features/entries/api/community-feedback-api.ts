import { apiRequest } from "@/lib/api/api-client";

type RatingResponse = {
  data: {
    entryId: string;
    value: number;
    averageRating: number;
    ratingCount: number;
  };
};

async function submitRating(entryId: string, value: number) {
  const response = await apiRequest<RatingResponse>(`/entries/${entryId}/rating`, {
    method: "PUT",
    body: { value },
  });

  return response.data;
}

export { submitRating };
