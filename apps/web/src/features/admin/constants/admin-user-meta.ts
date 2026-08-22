import type {
  AdminAccountAuditAction,
  AdminAuthMethod,
  AdminEntryStatus,
  AdminReviewStatus,
  AdminUserRole,
  AdminUserStatus,
} from "@/features/admin/types/admin-users";

const adminUserRoleLabels: Record<AdminUserRole, string> = {
  USER: "کاربر",
  MODERATOR: "ناظر",
  ADMIN: "مدیر",
};

const adminUserStatusLabels: Record<AdminUserStatus, string> = {
  ACTIVE: "فعال",
  SUSPENDED: "تعلیق‌شده",
};

const adminAuthMethodLabels: Record<AdminAuthMethod, string> = {
  PASSWORD: "رمز عبور",
  GOOGLE: "گوگل",
  FACEBOOK: "فیسبوک",
};

const adminEntryStatusLabels: Record<AdminEntryStatus, string> = {
  DRAFT: "پیش‌نویس",
  PENDING_REVIEW: "در انتظار بررسی",
  CHANGES_REQUESTED: "نیازمند اصلاح",
  PUBLISHED: "منتشرشده",
  REJECTED: "ردشده",
  HIDDEN: "پنهان",
  ARCHIVED: "بایگانی‌شده",
};

const adminReviewStatusLabels: Record<AdminReviewStatus, string> = {
  ACTIVE: "فعال",
  HIDDEN: "پنهان",
  DELETED: "حذف‌شده",
};

const adminAccountAuditLabels: Record<AdminAccountAuditAction, string> = {
  USER_ROLE_CHANGED: "نقش حساب تغییر کرد",
  USER_SUSPENDED: "حساب تعلیق شد",
  USER_REACTIVATED: "حساب دوباره فعال شد",
  USER_SESSIONS_REVOKED: "نشست‌های فعال پایان یافت",
};

export {
  adminAccountAuditLabels,
  adminAuthMethodLabels,
  adminEntryStatusLabels,
  adminReviewStatusLabels,
  adminUserRoleLabels,
  adminUserStatusLabels,
};
