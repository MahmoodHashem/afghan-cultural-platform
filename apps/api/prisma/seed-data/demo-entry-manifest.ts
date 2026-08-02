import { EntryStatus } from "../../src/generated/prisma/enums";

type DemoEntryManifestItem = {
  key: string;
  authorEmail: string;
  status: EntryStatus;
  submittedAt: string | null;
  publishedAt: string | null;
  moderatorEmail: string | null;
  moderationComment: string | null;
};

const demoEntryManifest: DemoEntryManifestItem[] = [
  published("abdul-rahman-jami", "contributor.herat.demo@afghan-culture.local", 1),
  published("afghan-handicrafts", "contributor.national.demo@afghan-culture.local", 2),
  published("ahmad-shah-durrani", "contributor.national.demo@afghan-culture.local", 3),
  published("dozandagi", "contributor.national.demo@afghan-culture.local", 4),
  published("fakhr-razi", "contributor.herat.demo@afghan-culture.local", 5),
  published("herat-citadel", "contributor.herat.demo@afghan-culture.local", 6),
  published("jami-mosque-herat", "contributor.herat.demo@afghan-culture.local", 7),
  published("khwaja-abdullah-ansari", "contributor.herat.demo@afghan-culture.local", 8),
  published("molana-jalaluddin-balkhi", "contributor.herat.demo@afghan-culture.local", 9),
  published("qalin", "contributor.national.demo@afghan-culture.local", 10),
  published("timur-shah-mausoleum", "contributor.kabul.demo@afghan-culture.local", 11),
  {
    key: "kabuli-pulao",
    authorEmail: "contributor.national.demo@afghan-culture.local",
    status: EntryStatus.DRAFT,
    submittedAt: null,
    publishedAt: null,
    moderatorEmail: null,
    moderationComment: null,
  },
  {
    key: "babur-garden",
    authorEmail: "contributor.kabul.demo@afghan-culture.local",
    status: EntryStatus.PENDING_REVIEW,
    submittedAt: "2026-02-20T08:00:00.000Z",
    publishedAt: null,
    moderatorEmail: null,
    moderationComment: null,
  },
  {
    key: "gand-afghan-dress",
    authorEmail: "contributor.herat.demo@afghan-culture.local",
    status: EntryStatus.CHANGES_REQUESTED,
    submittedAt: "2026-02-21T08:00:00.000Z",
    publishedAt: null,
    moderatorEmail: "moderator.one.demo@afghan-culture.local",
    moderationComment: "برای نمونه، بازبین درخواست کرده است متن نهایی یک بار دیگر بررسی شود.",
  },
  {
    key: "qala-bost",
    authorEmail: "contributor.herat.demo@afghan-culture.local",
    status: EntryStatus.REJECTED,
    submittedAt: "2026-02-22T08:00:00.000Z",
    publishedAt: null,
    moderatorEmail: "moderator.two.demo@afghan-culture.local",
    moderationComment: "برای نمونه، این مدخل تا بازنویسی کامل‌تر منتشر نمی‌شود.",
  },
];

function published(key: string, authorEmail: string, dayOffset: number): DemoEntryManifestItem {
  return {
    key,
    authorEmail,
    status: EntryStatus.PUBLISHED,
    submittedAt: `2026-02-${String(dayOffset).padStart(2, "0")}T08:00:00.000Z`,
    publishedAt: `2026-02-${String(dayOffset).padStart(2, "0")}T12:00:00.000Z`,
    moderatorEmail:
      dayOffset % 2 === 0
        ? "moderator.two.demo@afghan-culture.local"
        : "moderator.one.demo@afghan-culture.local",
    moderationComment: "مدخل نمونه برای نمایش عمومی تایید شد.",
  };
}

export type { DemoEntryManifestItem };
export { demoEntryManifest };
