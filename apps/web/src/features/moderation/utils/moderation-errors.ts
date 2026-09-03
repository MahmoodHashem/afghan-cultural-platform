import { isApiError } from "@/lib/api/api-error";

const MODERATION_ERROR_MESSAGES: Record<string, string> = {
  AUTH_UNAUTHORIZED: "برای ادامه باید وارد حساب شوید.",
  AUTH_INSUFFICIENT_ROLE: "شما اجازه بررسی مطالب را ندارید.",
  AUTH_EMAIL_VERIFICATION_REQUIRED: "برای بررسی مطالب باید ایمیل خود را تأیید کنید.",
  AUTH_ACCOUNT_SUSPENDED: "این حساب موقتاً تعلیق شده است.",
  MODERATION_SUBMISSION_NOT_FOUND: "این مطلب دیگر در صف بررسی نیست.",
  MODERATION_SELF_APPROVAL_FORBIDDEN: "نمی‌توانید مطلب خودتان را تأیید کنید.",
  ENTRY_REVISION_NOT_FOUND: "ویرایش مورد نظر پیدا نشد.",
  ENTRY_REVISION_INVALID_STATUS: "این ویرایش دیگر قابل بررسی نیست.",
  ENTRY_REVISION_STALE:
    "نسخه عمومی مطلب پس از ارسال این ویرایش تغییر کرده است. بررسی را از نسخه تازه آغاز کنید.",
  ENTRY_REVISION_CONFLICT: "این ویرایش قبلاً بررسی شده یا وضعیت آن تغییر کرده است.",
  MODERATION_REASON_REQUIRED: "دلیل تصمیم را بنویسید.",
  MODERATION_ALREADY_DECIDED: "این مطلب پیش‌تر بررسی شده است.",
  MODERATION_CONFLICT: "بررسی‌کننده دیگری زودتر درباره این مطلب تصمیم گرفته است.",
  CORRECTION_ENTRY_NOT_FOUND: "این مطلب برای پیشنهاد اصلاح در دسترس نیست.",
  CORRECTION_NOT_FOUND: "پیشنهاد اصلاح پیدا نشد.",
  CORRECTION_ALREADY_PENDING: "برای این بخش یک پیشنهاد اصلاح در انتظار بررسی دارید.",
  CORRECTION_ALREADY_DECIDED: "این پیشنهاد پیش‌تر بررسی شده است.",
  CORRECTION_CONFLICT: "بررسی‌کننده دیگری زودتر درباره این پیشنهاد تصمیم گرفته است.",
  CORRECTION_SELF_REVIEW_FORBIDDEN: "نمی‌توانید پیشنهاد اصلاح خودتان را بپذیرید.",
  CORRECTION_CONTENT_INVALID: "متن پیشنهاد اصلاح را بررسی کنید.",
  REPORT_TARGET_NOT_FOUND: "محتوای گزارش‌شده دیگر در دسترس نیست.",
  REPORT_NOT_FOUND: "گزارش پیدا نشد.",
  REPORT_ALREADY_OPEN: "این مورد را پیش‌تر گزارش کرده‌اید و هنوز در حال بررسی است.",
  REPORT_ALREADY_RESOLVED: "این گزارش پیش‌تر بررسی شده است.",
  REPORT_ACTION_INVALID: "این تصمیم برای محتوای گزارش‌شده قابل اجرا نیست.",
  REPORT_CONFLICT: "بررسی‌کننده دیگری زودتر این گزارش را بررسی کرده است.",
  BAD_REQUEST: "اطلاعات فرستاده‌شده را بررسی کنید.",
  NETWORK_ERROR: "ارتباط با سرور برقرار نشد.",
};

function getModerationErrorMessage(error: unknown) {
  if (!isApiError(error)) {
    return "این کار انجام نشد. کمی بعد دوباره تلاش کنید.";
  }

  const message = MODERATION_ERROR_MESSAGES[error.code] ?? "این کار انجام نشد.";
  return error.requestId ? `${message} شناسه درخواست: ${error.requestId}` : message;
}

function isStaleModerationError(error: unknown) {
  return (
    isApiError(error) &&
    [
      "MODERATION_SUBMISSION_NOT_FOUND",
      "MODERATION_ALREADY_DECIDED",
      "MODERATION_CONFLICT",
    ].includes(error.code)
  );
}

export { getModerationErrorMessage, isStaleModerationError };
