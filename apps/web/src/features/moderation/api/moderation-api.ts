import type { OwnEntry } from "@/features/entries/api/entry-drafts-api";
import type {
  ModerationDecisionInput,
  ModerationDecisionResponse,
  ModerationListResponse,
  ModerationQueueQuery,
  ModerationSubmissionResponse,
} from "@/features/moderation/types/moderation";
import { apiRequest } from "@/lib/api/api-client";
import { setOptionalSearchParam } from "@/lib/utils/url-search-params";

type RevisionListResponse = {
  data: OwnEntry[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

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

async function listModerationRevisions(page = 1, limit = 20, signal?: AbortSignal) {
  return apiRequest<RevisionListResponse>(`/moderation/revisions?page=${page}&limit=${limit}`, {
    method: "GET",
    signal,
  });
}

async function getModerationRevision(revisionId: string, signal?: AbortSignal) {
  const response = await apiRequest<{ data: OwnEntry }>(`/moderation/revisions/${revisionId}`, {
    method: "GET",
    signal,
  });
  return response.data;
}

async function decideModerationRevision(input: {
  revisionId: string;
  decision: "APPROVE" | "REQUEST_CHANGES" | "REJECT";
  reason?: string;
}) {
  const action = {
    APPROVE: "approve",
    REQUEST_CHANGES: "request-changes",
    REJECT: "reject",
  }[input.decision];
  return apiRequest(`/moderation/revisions/${input.revisionId}/${action}`, {
    method: "POST",
    body: input.decision === "APPROVE" ? {} : { reason: input.reason },
  });
}

async function requestPublishedEntryRevision(entryId: string, reason: string) {
  return apiRequest(`/moderation/entries/${entryId}/request-revision`, {
    method: "POST",
    body: { reason },
  });
}

export {
  decideModerationRevision,
  decideModerationSubmission,
  getModerationRevision,
  getModerationSubmission,
  listModerationRevisions,
  listModerationSubmissions,
  requestPublishedEntryRevision,
};
