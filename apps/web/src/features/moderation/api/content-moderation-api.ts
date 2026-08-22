import type {
  ContentReport,
  CorrectionStatus,
  CorrectionSuggestion,
  ModerationHistoryItem,
  PaginatedResponse,
  ReportReason,
  ReportResolutionAction,
  ReportStatus,
  ReportTargetType,
  SubmitCorrectionInput,
  SubmitReportInput,
} from "@/features/moderation/types/content-moderation";
import { apiRequest } from "@/lib/api/api-client";
import { setOptionalSearchParam } from "@/lib/utils/url-search-params";

function submitCorrection({ entryId, ...body }: SubmitCorrectionInput) {
  return apiRequest<{ data: CorrectionSuggestion }>(`/entries/${entryId}/corrections`, {
    method: "POST",
    body,
  });
}

function submitContentReport({ entryId, reviewId, ...body }: SubmitReportInput) {
  const path = reviewId
    ? `/entries/${entryId}/reviews/${reviewId}/reports`
    : `/entries/${entryId}/reports`;
  return apiRequest<{ data: ContentReport }>(path, { method: "POST", body });
}

function listCorrections(
  query: { page: number; limit: number; status?: CorrectionStatus },
  signal?: AbortSignal,
) {
  const params = new URLSearchParams();
  setOptionalSearchParam(params, "page", query.page);
  setOptionalSearchParam(params, "limit", query.limit);
  setOptionalSearchParam(params, "status", query.status);
  return apiRequest<PaginatedResponse<CorrectionSuggestion>>(`/moderation/corrections?${params}`, {
    signal,
  });
}

function getCorrection(id: string, signal?: AbortSignal) {
  return apiRequest<{ data: CorrectionSuggestion }>(`/moderation/corrections/${id}`, { signal });
}

function decideCorrection(input: { id: string; decision: "ACCEPT" | "REJECT"; comments: string }) {
  return apiRequest<{ data: CorrectionSuggestion }>(
    `/moderation/corrections/${input.id}/${input.decision === "ACCEPT" ? "accept" : "reject"}`,
    {
      method: "POST",
      body: input.decision === "ACCEPT" ? { comments: input.comments } : { reason: input.comments },
    },
  );
}

function listReports(
  query: {
    page: number;
    limit: number;
    status?: ReportStatus;
    reason?: ReportReason;
    targetType?: ReportTargetType;
  },
  signal?: AbortSignal,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    setOptionalSearchParam(params, key, value);
  }
  return apiRequest<PaginatedResponse<ContentReport>>(`/moderation/reports?${params}`, { signal });
}

function getReport(id: string, signal?: AbortSignal) {
  return apiRequest<{ data: ContentReport }>(`/moderation/reports/${id}`, { signal });
}

function resolveReport(input: {
  id: string;
  resolutionAction: ReportResolutionAction;
  notes: string;
}) {
  return apiRequest<{ data: ContentReport }>(`/moderation/reports/${input.id}/resolve`, {
    method: "POST",
    body: { resolutionAction: input.resolutionAction, notes: input.notes },
  });
}

function listModerationHistory(
  query: { page: number; limit: number; action?: string; entryId?: string },
  signal?: AbortSignal,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    setOptionalSearchParam(params, key, value);
  }
  return apiRequest<PaginatedResponse<ModerationHistoryItem>>(`/moderation/history?${params}`, {
    signal,
  });
}

export {
  decideCorrection,
  getCorrection,
  getReport,
  listCorrections,
  listModerationHistory,
  listReports,
  resolveReport,
  submitContentReport,
  submitCorrection,
};
