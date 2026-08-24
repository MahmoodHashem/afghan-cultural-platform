import type {
  AdminActivityTone,
  AdminActivityViewModel,
  AdminAuditAction,
  AdminOverviewActivity,
  AdminOverviewData,
  AdminOverviewViewModel,
} from "@/features/admin/types/admin-overview";

const activityMetadata: Record<AdminAuditAction, { label: string; tone: AdminActivityTone }> = {
  ENTRY_SUBMITTED: { label: "ارسال مطلب", tone: "blue" },
  ENTRY_APPROVED: { label: "تأیید مطلب", tone: "green" },
  ENTRY_REJECTED: { label: "رد مطلب", tone: "red" },
  ENTRY_CHANGES_REQUESTED: { label: "درخواست تغییر", tone: "orange" },
  ENTRY_HIDDEN: { label: "پنهان‌کردن مطلب", tone: "red" },
  ENTRY_RESTORED: { label: "بازگردانی مطلب", tone: "green" },
  CORRECTION_SUBMITTED: { label: "پیشنهاد اصلاح", tone: "blue" },
  CORRECTION_ACCEPTED: { label: "پذیرش اصلاح", tone: "green" },
  CORRECTION_REJECTED: { label: "رد اصلاح", tone: "red" },
  REPORT_SUBMITTED: { label: "ثبت گزارش", tone: "orange" },
  REPORT_RESOLVED: { label: "حل گزارش", tone: "green" },
  COMMENT_HIDDEN: { label: "پنهان‌کردن دیدگاه", tone: "red" },
  USER_ROLE_CHANGED: { label: "تغییر نقش", tone: "neutral" },
  USER_SUSPENDED: { label: "تعلیق کاربر", tone: "red" },
};

function mapAdminOverview(data: AdminOverviewData): AdminOverviewViewModel {
  return {
    ...data,
    recentActivity: data.recentActivity.map(mapAdminActivity),
  };
}

function mapAdminActivity(activity: AdminOverviewActivity): AdminActivityViewModel {
  const metadata = activityMetadata[activity.action];

  return {
    ...activity,
    ...metadata,
    actorName: activity.actor?.displayName ?? "سیستم",
    description: createActivityDescription(activity),
  };
}

function createActivityDescription(activity: AdminOverviewActivity) {
  const entryTitle = activity.entry ? `«${activity.entry.title}»` : "یک مطلب";
  const targetUser = activity.targetUser?.displayName ?? "یک کاربر";

  const descriptions: Record<AdminAuditAction, string> = {
    ENTRY_SUBMITTED: `${entryTitle} برای بررسی ارسال شد.`,
    ENTRY_APPROVED: `${entryTitle} تأیید و منتشر شد.`,
    ENTRY_REJECTED: `${entryTitle} رد شد.`,
    ENTRY_CHANGES_REQUESTED: `${entryTitle} برای اصلاح به نویسنده برگشت.`,
    ENTRY_HIDDEN: `${entryTitle} از نمایش عمومی پنهان شد.`,
    ENTRY_RESTORED: `${entryTitle} دوباره در دسترس قرار گرفت.`,
    CORRECTION_SUBMITTED: `یک پیشنهاد اصلاح برای ${entryTitle} ثبت شد.`,
    CORRECTION_ACCEPTED: `پیشنهاد اصلاح ${entryTitle} پذیرفته شد.`,
    CORRECTION_REJECTED: `پیشنهاد اصلاح ${entryTitle} رد شد.`,
    REPORT_SUBMITTED: `گزارشی برای ${entryTitle} ثبت شد.`,
    REPORT_RESOLVED: `گزارش مربوط به ${entryTitle} بررسی شد.`,
    COMMENT_HIDDEN: `یک دیدگاه مربوط به ${entryTitle} پنهان شد.`,
    USER_ROLE_CHANGED: `نقش ${targetUser} تغییر کرد.`,
    USER_SUSPENDED: `حساب ${targetUser} تعلیق شد.`,
  };

  return descriptions[activity.action];
}

export { mapAdminActivity, mapAdminOverview };
