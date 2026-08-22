import type {
  AdminUserActivityQuery,
  AdminUserEntriesQuery,
  AdminUserReviewsQuery,
  AdminUsersQuery,
} from "@/features/admin/types/admin-users";

const adminUsersQueryKeys = {
  all: ["admin", "users"] as const,
  lists: () => [...adminUsersQueryKeys.all, "list"] as const,
  list: (query: AdminUsersQuery) => [...adminUsersQueryKeys.lists(), query] as const,
  details: () => [...adminUsersQueryKeys.all, "detail"] as const,
  detail: (userId: string) => [...adminUsersQueryKeys.details(), userId] as const,
  entries: (userId: string, query: AdminUserEntriesQuery) =>
    [...adminUsersQueryKeys.detail(userId), "entries", query] as const,
  reviews: (userId: string, query: AdminUserReviewsQuery) =>
    [...adminUsersQueryKeys.detail(userId), "reviews", query] as const,
  activity: (userId: string, query: AdminUserActivityQuery) =>
    [...adminUsersQueryKeys.detail(userId), "activity", query] as const,
};

export { adminUsersQueryKeys };
