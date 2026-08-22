import type { AdminEntryStatus } from "@/features/admin/types/admin-users";

const adminEntryStatusMeta: Record<
  AdminEntryStatus,
  { label: string; className: string; shortLabel: string }
> = {
  DRAFT: { label: "پیش‌نویس", shortLabel: "پیش‌نویس", className: "bg-muted text-foreground" },
  PENDING_REVIEW: {
    label: "در انتظار بررسی",
    shortLabel: "در انتظار",
    className: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  CHANGES_REQUESTED: {
    label: "نیازمند تغییر",
    shortLabel: "نیازمند تغییر",
    className: "bg-orange-50 text-orange-800 ring-orange-200",
  },
  PUBLISHED: {
    label: "منتشرشده",
    shortLabel: "منتشرشده",
    className: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  },
  REJECTED: {
    label: "ردشده",
    shortLabel: "ردشده",
    className: "bg-red-50 text-red-800 ring-red-200",
  },
  HIDDEN: {
    label: "پنهان",
    shortLabel: "پنهان",
    className: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  ARCHIVED: {
    label: "بایگانی‌شده",
    shortLabel: "بایگانی",
    className: "bg-stone-100 text-stone-700 ring-stone-200",
  },
};

const adminEntryStatusOrder: AdminEntryStatus[] = [
  "PUBLISHED",
  "PENDING_REVIEW",
  "CHANGES_REQUESTED",
  "DRAFT",
  "REJECTED",
  "HIDDEN",
  "ARCHIVED",
];

const adminGeographicScopeLabels = {
  PROVINCE: "وابسته به یک ولایت",
  NATIONAL: "سراسری",
  NONE: "بدون وابستگی به مکان",
} as const;

export { adminEntryStatusMeta, adminEntryStatusOrder, adminGeographicScopeLabels };
