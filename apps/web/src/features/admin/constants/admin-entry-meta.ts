import type { AdminEntryStatus } from "@/features/admin/types/admin-users";

const adminEntryStatusMeta: Record<
  AdminEntryStatus,
  { label: string; className: string; shortLabel: string }
> = {
  DRAFT: { label: "پیش‌نویس", shortLabel: "پیش‌نویس", className: "border-line bg-line-soft text-copy" },
  PENDING_REVIEW: {
    label: "در انتظار بررسی",
    shortLabel: "در انتظار",
    className: "border-saffron/30 bg-tint-sand text-saffron-deep dark:text-gold",
  },
  CHANGES_REQUESTED: {
    label: "نیازمند تغییر",
    shortLabel: "نیازمند تغییر",
    className: "border-brand/25 bg-tint-rose text-anar dark:text-brand-ink",
  },
  PUBLISHED: {
    label: "منتشرشده",
    shortLabel: "منتشرشده",
    className: "border-ok/25 bg-ok-soft text-ok",
  },
  REJECTED: {
    label: "ردشده",
    shortLabel: "ردشده",
    className: "border-brand/25 bg-brand-soft text-brand-ink",
  },
  HIDDEN: {
    label: "پنهان",
    shortLabel: "پنهان",
    className: "border-line bg-paper text-faint",
  },
  ARCHIVED: {
    label: "بایگانی‌شده",
    shortLabel: "بایگانی",
    className: "border-line bg-line-soft text-faint",
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
