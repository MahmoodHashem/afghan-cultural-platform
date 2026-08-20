import type { EntryStatus, OwnEntry } from "@/features/entries/api/entry-drafts-api";
import { cn } from "@/lib/utils";

type EntryStatusMeta = {
  label: string;
  description: string;
  badgeClassName: string;
};

type EntryStatusFilter = {
  value: EntryStatus | "ALL";
  label: string;
};

const ENTRY_STATUS_META = {
  DRAFT: {
    label: "پیش‌نویس",
    description: "هنوز برای بررسی فرستاده نشده است.",
    badgeClassName: "border-primary/25 bg-primary-light text-primary",
  },
  PENDING_REVIEW: {
    label: "در انتظار بررسی",
    description: "مطلب برای بررسی فرستاده شده است.",
    badgeClassName: "border-gold/35 bg-gold/12 text-[#8A641C]",
  },
  CHANGES_REQUESTED: {
    label: "نیازمند اصلاح",
    description: "پس از اصلاح می‌توانید دوباره بفرستید.",
    badgeClassName: "border-terracotta/30 bg-terracotta/10 text-terracotta",
  },
  PUBLISHED: {
    label: "منتشرشده",
    description: "این مطلب در سایت قابل خواندن است.",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  REJECTED: {
    label: "ردشده",
    description: "این نسخه تأیید نشده است.",
    badgeClassName: "border-destructive/25 bg-destructive/10 text-destructive",
  },
  HIDDEN: {
    label: "پنهان",
    description: "این مطلب فعلاً در سایت نمایش داده نمی‌شود.",
    badgeClassName: "border-muted bg-muted text-muted-foreground",
  },
  ARCHIVED: {
    label: "بایگانی‌شده",
    description: "این مطلب در آرشیو نگهداری می‌شود.",
    badgeClassName: "border-muted bg-muted text-muted-foreground",
  },
} satisfies Record<EntryStatus, EntryStatusMeta>;

const ENTRY_STATUS_FILTERS: EntryStatusFilter[] = [
  { value: "ALL", label: "همه" },
  { value: "DRAFT", label: ENTRY_STATUS_META.DRAFT.label },
  { value: "PENDING_REVIEW", label: ENTRY_STATUS_META.PENDING_REVIEW.label },
  { value: "CHANGES_REQUESTED", label: ENTRY_STATUS_META.CHANGES_REQUESTED.label },
  { value: "PUBLISHED", label: ENTRY_STATUS_META.PUBLISHED.label },
  { value: "REJECTED", label: ENTRY_STATUS_META.REJECTED.label },
  { value: "HIDDEN", label: ENTRY_STATUS_META.HIDDEN.label },
  { value: "ARCHIVED", label: ENTRY_STATUS_META.ARCHIVED.label },
];

const OWNER_EDITABLE_STATUSES = new Set<EntryStatus>(["DRAFT", "CHANGES_REQUESTED"]);

function isOwnerEditableStatus(status: EntryStatus) {
  return OWNER_EDITABLE_STATUSES.has(status);
}

function canDeleteOwnEntry(entry: Pick<OwnEntry, "status">) {
  return entry.status === "DRAFT";
}

function getEntryStatusBadgeClassName(status: EntryStatus, className?: string) {
  return cn(ENTRY_STATUS_META[status].badgeClassName, className);
}

export type { EntryStatusFilter, EntryStatusMeta };
export {
  canDeleteOwnEntry,
  ENTRY_STATUS_FILTERS,
  ENTRY_STATUS_META,
  getEntryStatusBadgeClassName,
  isOwnerEditableStatus,
};
