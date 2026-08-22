import type {
  CorrectionSection,
  ReportReason,
  ReportResolutionAction,
} from "@/features/moderation/types/content-moderation";

const correctionSectionLabels: Record<CorrectionSection, string> = {
  TITLE: "عنوان",
  SUMMARY: "خلاصه",
  CONTENT: "متن مطلب",
};

const reportReasonLabels: Record<ReportReason, string> = {
  INACCURATE_INFORMATION: "اطلاعات نادرست",
  OFFENSIVE_OR_DISCRIMINATORY_CONTENT: "محتوای توهین‌آمیز یا تبعیض‌آمیز",
  COPYRIGHT_PROBLEM: "مشکل حق نشر",
  PRIVACY_PROBLEM: "نقض حریم خصوصی",
  INCORRECT_PROVINCE_OR_CATEGORY: "ولایت یا موضوع نادرست",
  DUPLICATE_CONTENT: "مطلب تکراری",
  MISSING_OR_MISLEADING_SOURCE: "منبع ناقص یا گمراه‌کننده",
  CULTURALLY_SENSITIVE_CONTENT: "محتوای حساس فرهنگی",
  INVALID_YOUTUBE_LINK: "پیوند ویدیویی نامعتبر",
  SPAM: "هرزنامه",
  OTHER: "دلیل دیگر",
};

const reportActionLabels: Record<ReportResolutionAction, string> = {
  DISMISS: "بستن گزارش و نگه‌داشتن محتوا",
  HIDE_CONTENT: "پنهان‌کردن مطلب",
  HIDE_REVIEW: "پنهان‌کردن دیدگاه",
  ARCHIVE_CONTENT: "بایگانی‌کردن مطلب",
};

const historyActionLabels: Record<string, string> = {
  ENTRY_SUBMITTED: "مطلب برای بررسی فرستاده شد",
  ENTRY_APPROVED: "مطلب تأیید و منتشر شد",
  ENTRY_REJECTED: "مطلب رد شد",
  ENTRY_CHANGES_REQUESTED: "درخواست اصلاح فرستاده شد",
  ENTRY_HIDDEN: "مطلب پنهان شد",
  ENTRY_RESTORED: "مطلب دوباره در دسترس قرار گرفت",
  CORRECTION_SUBMITTED: "پیشنهاد اصلاح ثبت شد",
  CORRECTION_ACCEPTED: "پیشنهاد اصلاح پذیرفته شد",
  CORRECTION_REJECTED: "پیشنهاد اصلاح رد شد",
  REPORT_SUBMITTED: "گزارش تازه ثبت شد",
  REPORT_RESOLVED: "گزارش بررسی شد",
  REVIEW_HIDDEN: "دیدگاه پنهان شد",
};

export { correctionSectionLabels, historyActionLabels, reportActionLabels, reportReasonLabels };
