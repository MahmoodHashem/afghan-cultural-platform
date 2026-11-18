import type {
  ReportReason,
  ReportResolutionAction,
  ReportStatus,
  ReportTargetType,
} from "@/features/moderation/types/content-moderation";

const adminReportStatusLabels: Record<ReportStatus, string> = {
  OPEN: "باز",
  UNDER_REVIEW: "در حال بررسی",
  RESOLVED: "بسته‌شده",
};

const adminReportTargetLabels: Record<ReportTargetType, string> = {
  ENTRY: "مطلب",
  COMMENT: "دیدگاه",
};

const adminReportStatusClasses: Record<ReportStatus, string> = {
  OPEN: "border-brand/25 bg-brand-soft text-brand-ink",
  UNDER_REVIEW: "border-gold/40 bg-tint-sand text-saffron-deep dark:text-gold",
  RESOLVED: "border-ok/25 bg-ok-soft text-ok",
};

const adminReportReasons = [
  "INACCURATE_INFORMATION",
  "OFFENSIVE_OR_DISCRIMINATORY_CONTENT",
  "COPYRIGHT_PROBLEM",
  "PRIVACY_PROBLEM",
  "INCORRECT_PROVINCE_OR_CATEGORY",
  "DUPLICATE_CONTENT",
  "MISSING_OR_MISLEADING_SOURCE",
  "CULTURALLY_SENSITIVE_CONTENT",
  "INVALID_YOUTUBE_LINK",
  "SPAM",
  "OTHER",
] as const satisfies readonly ReportReason[];

const entryReportActions = [
  "DISMISS",
  "HIDE_CONTENT",
  "ARCHIVE_CONTENT",
] as const satisfies readonly ReportResolutionAction[];
const commentReportActions = [
  "DISMISS",
  "HIDE_COMMENT",
] as const satisfies readonly ReportResolutionAction[];

export {
  adminReportReasons,
  adminReportStatusClasses,
  adminReportStatusLabels,
  adminReportTargetLabels,
  commentReportActions,
  entryReportActions,
};
