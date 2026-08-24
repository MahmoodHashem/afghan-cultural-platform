type AdminAuditAction =
  | "ENTRY_SUBMITTED"
  | "ENTRY_APPROVED"
  | "ENTRY_REJECTED"
  | "ENTRY_CHANGES_REQUESTED"
  | "ENTRY_HIDDEN"
  | "ENTRY_RESTORED"
  | "CORRECTION_SUBMITTED"
  | "CORRECTION_ACCEPTED"
  | "CORRECTION_REJECTED"
  | "REPORT_SUBMITTED"
  | "REPORT_RESOLVED"
  | "COMMENT_HIDDEN"
  | "USER_ROLE_CHANGED"
  | "USER_SUSPENDED";

type AdminOverviewMetric = {
  total: number;
  last30Days: number;
};

type AdminOverviewStats = {
  users: AdminOverviewMetric;
  publishedEntries: AdminOverviewMetric;
  pendingReview: number;
  openReports: number;
  staleReports: number;
};

type AdminOverviewGrowthPoint = {
  date: string;
  users: number;
  publishedEntries: number;
};

type AdminOverviewAttention = {
  pendingSubmissions: number;
  pendingCorrections: number;
  openReports: number;
  staleReports: number;
};

type AdminOverviewPerson = {
  id: string;
  displayName: string;
};

type AdminOverviewEntry = {
  id: string;
  slug: string;
  title: string;
};

type AdminOverviewActivity = {
  id: string;
  action: AdminAuditAction;
  actor: AdminOverviewPerson | null;
  targetUser: AdminOverviewPerson | null;
  entry: AdminOverviewEntry | null;
  createdAt: string;
};

type AdminOverviewData = {
  stats: AdminOverviewStats;
  growth: AdminOverviewGrowthPoint[];
  attention: AdminOverviewAttention;
  recentActivity: AdminOverviewActivity[];
  generatedAt: string;
};

type AdminOverviewResponse = {
  data: AdminOverviewData;
};

type AdminActivityTone = "blue" | "green" | "orange" | "red" | "neutral";

type AdminActivityViewModel = AdminOverviewActivity & {
  actorName: string;
  description: string;
  label: string;
  tone: AdminActivityTone;
};

type AdminOverviewViewModel = Omit<AdminOverviewData, "recentActivity"> & {
  recentActivity: AdminActivityViewModel[];
};

export type {
  AdminActivityTone,
  AdminActivityViewModel,
  AdminAuditAction,
  AdminOverviewActivity,
  AdminOverviewAttention,
  AdminOverviewData,
  AdminOverviewEntry,
  AdminOverviewGrowthPoint,
  AdminOverviewMetric,
  AdminOverviewPerson,
  AdminOverviewResponse,
  AdminOverviewStats,
  AdminOverviewViewModel,
};
