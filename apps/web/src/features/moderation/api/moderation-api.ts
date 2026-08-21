import type {
  ModerationDecisionInput,
  ModerationDecisionResponse,
  ModerationListResponse,
  ModerationQueueQuery,
  ModerationSubmissionResponse,
} from "@/features/moderation/types/moderation";
import { apiRequest } from "@/lib/api/api-client";
import { setOptionalSearchParam } from "@/lib/utils/url-search-params";

async function listModerationSubmissions(query: ModerationQueueQuery, signal?: AbortSignal) {
  const searchParams = new URLSearchParams();

  setOptionalSearchParam(searchParams, "page", query.page);
  setOptionalSearchParam(searchParams, "limit", query.limit);
  setOptionalSearchParam(searchParams, "authorId", query.authorId);
  setOptionalSearchParam(searchParams, "provinceId", query.provinceId);
  setOptionalSearchParam(searchParams, "categoryId", query.categoryId);
  setOptionalSearchParam(searchParams, "contentTypeId", query.contentTypeId);
  setOptionalSearchParam(searchParams, "sortDirection", query.sortDirection);

  return apiRequest<ModerationListResponse>(`/moderation/submissions?${searchParams.toString()}`, {
    method: "GET",
    signal,
  });
}

async function getModerationSubmission(entryId: string, signal?: AbortSignal) {
  return apiRequest<ModerationSubmissionResponse>(`/moderation/submissions/${entryId}`, {
    method: "GET",
    signal,
  });
}

async function decideModerationSubmission(input: ModerationDecisionInput) {
  const pathByDecision = {
    APPROVE: "approve",
    REQUEST_CHANGES: "request-changes",
    REJECT: "reject",
  } as const;
  const body =
    input.decision === "APPROVE"
      ? undefined
      : {
          reason: input.reason,
        };

  return apiRequest<ModerationDecisionResponse>(
    `/moderation/submissions/${input.entryId}/${pathByDecision[input.decision]}`,
    {
      method: "POST",
      body,
    },
  );
}

export { decideModerationSubmission, getModerationSubmission, listModerationSubmissions };
