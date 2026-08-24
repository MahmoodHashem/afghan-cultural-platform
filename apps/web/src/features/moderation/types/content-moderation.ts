type CorrectionSection = "TITLE" | "SUMMARY" | "CONTENT";
type CorrectionStatus = "PENDING" | "ACCEPTED" | "REJECTED";
type ReportStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED";
type ReportTargetType = "ENTRY" | "COMMENT";
type ReportReason =
  | "INACCURATE_INFORMATION"
  | "OFFENSIVE_OR_DISCRIMINATORY_CONTENT"
  | "COPYRIGHT_PROBLEM"
  | "PRIVACY_PROBLEM"
  | "INCORRECT_PROVINCE_OR_CATEGORY"
  | "DUPLICATE_CONTENT"
  | "MISSING_OR_MISLEADING_SOURCE"
  | "CULTURALLY_SENSITIVE_CONTENT"
  | "INVALID_YOUTUBE_LINK"
  | "SPAM"
  | "OTHER";
type ReportResolutionAction = "DISMISS" | "HIDE_CONTENT" | "HIDE_COMMENT" | "ARCHIVE_CONTENT";

type ModerationEntrySummary = {
  id: string;
  slug: string | null;
  title: string;
  summary: string;
  status: string;
  publishedAt?: string | null;
};

type CorrectionSuggestion = {
  id: string;
  entryId: string;
  status: CorrectionStatus;
  section: CorrectionSection;
  originalText: string;
  proposedCorrection: string;
  reason: string;
  sourceText: string | null;
  reviewerComments: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  entry: ModerationEntrySummary;
  submittedBy: { id: string; displayName: string };
  reviewedBy: { id: string; displayName: string } | null;
};

type ContentReport = {
  id: string;
  entryId: string;
  entryCommentId: string | null;
  targetType: ReportTargetType;
  reason: ReportReason;
  explanation: string;
  status: ReportStatus;
  resolutionAction: ReportResolutionAction | null;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  entry: ModerationEntrySummary;
  entryComment: {
    id: string;
    body: string;
    status: string;
    createdAt: string;
    author: { id: string; displayName: string };
  } | null;
  reviewedBy: { id: string; displayName: string } | null;
};

type ModerationHistoryItem = {
  id: string;
  action: string;
  entryId: string | null;
  reportId: string | null;
  correctionSuggestionId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: { id: string; displayName: string } | null;
  entry: { id: string; title: string; slug: string | null } | null;
};

type PaginatedResponse<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

type SubmitCorrectionInput = {
  entryId: string;
  section: CorrectionSection;
  proposedCorrection: string;
  reason: string;
  sourceText?: string;
};

type SubmitReportInput = {
  entryId: string;
  commentId?: string;
  reason: ReportReason;
  explanation: string;
};

export type {
  ContentReport,
  CorrectionSection,
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
};
