import { isApiError } from "@/lib/api/api-error";

const MODERATION_ERROR_MESSAGES: Record<string, string> = {
  AUTH_UNAUTHORIZED: "برای ادامه باید وارد حساب شوید.",
  AUTH_INSUFFICIENT_ROLE: "شما اجازه بررسی مطالب را ندارید.",
  AUTH_EMAIL_VERIFICATION_REQUIRED: "برای بررسی مطالب باید ایمیل خود را تأیید کنید.",
  AUTH_ACCOUNT_SUSPENDED: "این حساب موقتاً تعلیق شده است.",
  MODERATION_SUBMISSION_NOT_FOUND: "این مطلب دیگر در صف بررسی نیست.",
  MODERATION_SELF_APPROVAL_FORBIDDEN: "نمی‌توانید مطلب خودتان را تأیید کنید.",
  MODERATION_REASON_REQUIRED: "دلیل تصمیم را بنویسید.",
  MODERATION_ALREADY_DECIDED: "این مطلب پیش‌تر بررسی شده است.",
  MODERATION_CONFLICT: "بررسی‌کننده دیگری زودتر درباره این مطلب تصمیم گرفته است.",
  BAD_REQUEST: "اطلاعات فرستاده‌شده را بررسی کنید.",
  NETWORK_ERROR: "ارتباط با سرور برقرار نشد.",
};

function getModerationErrorMessage(error: unknown) {
  if (!isApiError(error)) {
    return "بررسی مطلب انجام نشد. کمی بعد دوباره تلاش کنید.";
  }

  const message = MODERATION_ERROR_MESSAGES[error.code] ?? "بررسی مطلب انجام نشد.";
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
