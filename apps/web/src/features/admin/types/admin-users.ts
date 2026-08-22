type AdminUserRole = "USER" | "MODERATOR" | "ADMIN";
type AdminUserStatus = "ACTIVE" | "SUSPENDED";
type AdminAuthProvider = "GOOGLE" | "FACEBOOK";
type AdminAuthMethod = "PASSWORD" | AdminAuthProvider;
type AdminEntryStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "CHANGES_REQUESTED"
  | "PUBLISHED"
  | "REJECTED"
  | "HIDDEN"
  | "ARCHIVED";
type AdminReviewStatus = "ACTIVE" | "HIDDEN" | "DELETED";
type AdminAccountAuditAction =
  | "USER_ROLE_CHANGED"
  | "USER_SUSPENDED"
  | "USER_REACTIVATED"
  | "USER_SESSIONS_REVOKED";

type AdminPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type AdminUserCounts = {
  entries: number;
  reviews: number;
  bookmarks: number;
};

type AdminUserListItem = {
  id: string;
  displayName: string;
  email: string;
  profileImageUrl: string | null;
  role: AdminUserRole;
  status: AdminUserStatus;
  emailVerified: boolean;
  authMethods: AdminAuthMethod[];
  counts: AdminUserCounts;
  lastLoginAt: string | null;
  createdAt: string;
};

type AdminUserEntryStatusCounts = {
  total: number;
  draft: number;
  pendingReview: number;
  changesRequested: number;
  published: number;
  rejected: number;
  hidden: number;
  archived: number;
};

type AdminUserDetailStats = {
  entries: AdminUserEntryStatusCounts;
  reviews: number;
  bookmarks: number;
  likes: number;
  reportsSubmitted: number;
  correctionsSubmitted: number;
  activeSessions: number;
};

type AdminUserDetail = AdminUserListItem & {
  biography: string | null;
  province: { id: string; name: string; slug: string } | null;
  culturalInterests: string[];
  emailVerifiedAt: string | null;
  suspendedAt: string | null;
  updatedAt: string;
  providers: Array<{ provider: AdminAuthProvider; connectedAt: string }>;
  stats: AdminUserDetailStats;
};

type AdminUserEntry = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: AdminEntryStatus;
  submittedAt: string | null;
  publishedAt: string | null;
  updatedAt: string;
};

type AdminUserReview = {
  id: string;
  body: string;
  status: AdminReviewStatus;
  entry: { id: string; slug: string; title: string };
  createdAt: string;
  updatedAt: string;
};

type AdminUserActivity = {
  id: string;
  action: AdminAccountAuditAction;
  actor: { id: string; displayName: string } | null;
  reason: string | null;
  createdAt: string;
};

type AdminUsersQuery = {
  page?: number;
  limit?: number;
  search?: string;
  role?: AdminUserRole;
  status?: AdminUserStatus;
  authMethod?: AdminAuthMethod;
  emailVerified?: boolean;
  sortBy?: "createdAt" | "displayName" | "lastLoginAt";
  sortDirection?: "asc" | "desc";
};

type AdminUserEntriesQuery = {
  page?: number;
  limit?: number;
  status?: AdminEntryStatus;
  sortDirection?: "asc" | "desc";
};

type AdminUserReviewsQuery = {
  page?: number;
  limit?: number;
  status?: AdminReviewStatus;
};

type AdminUserActivityQuery = {
  page?: number;
  limit?: number;
};

type AdminListResponse<TData> = {
  data: TData[];
  meta: AdminPaginationMeta;
};

type UpdateAdminUserStatusInput = {
  status: AdminUserStatus;
  reason?: string;
};

export type {
  AdminAccountAuditAction,
  AdminAuthMethod,
  AdminAuthProvider,
  AdminEntryStatus,
  AdminListResponse,
  AdminPaginationMeta,
  AdminReviewStatus,
  AdminUserActivity,
  AdminUserActivityQuery,
  AdminUserDetail,
  AdminUserEntriesQuery,
  AdminUserEntry,
  AdminUserListItem,
  AdminUserReview,
  AdminUserReviewsQuery,
  AdminUserRole,
  AdminUserStatus,
  AdminUsersQuery,
  UpdateAdminUserStatusInput,
};
