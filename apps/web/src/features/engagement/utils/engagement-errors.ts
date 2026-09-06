import { isApiError } from "@/lib/api/api-error";
import { getApiErrorMessage } from "@/lib/api/api-error-messages";

const engagementErrorMessages: Record<string, string> = {
  AUTH_EMAIL_VERIFICATION_REQUIRED: "برای این کار باید ایمیل خود را تأیید کنید.",
  AUTH_ACCOUNT_SUSPENDED: "این حساب موقتاً تعلیق شده است.",
  AUTH_UNAUTHORIZED: "برای ادامه باید وارد حساب شوید.",
  COMMUNITY_ENTRY_NOT_FOUND: "این مطلب دیگر برای تعامل در دسترس نیست.",
  PROFILE_BOOKMARK_ENTRY_NOT_FOUND: "این مطلب دیگر برای ذخیره‌کردن در دسترس نیست.",
  COMMENT_NOT_FOUND: "این دیدگاه پیدا نشد یا دیگر در دسترس نیست.",
  COMMENT_BODY_INVALID: "متن دیدگاه باید بین ۵ تا ۱۰۰۰ حرف باشد.",
  COMMENT_PARENT_INVALID: "دیدگاهی که به آن پاسخ می‌دهید معتبر نیست.",
  COMMENT_PARENT_UNAVAILABLE: "این گفتگو دیگر پاسخ تازه نمی‌پذیرد.",
  COMMENT_NOT_OWNED: "فقط نویسنده دیدگاه می‌تواند آن را تغییر دهد.",
  COMMENT_UNAVAILABLE: "این دیدگاه دیگر برای این کار در دسترس نیست.",
  COMMENT_SELF_LIKE_FORBIDDEN: "نمی‌توانید دیدگاه خودتان را بپسندید.",
  BAD_REQUEST: "لطفاً اطلاعات واردشده را بررسی کنید.",
  TOO_MANY_REQUESTS: "درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.",
  NETWORK_ERROR: "ارتباط با سرور برقرار نشد.",
};

function getEngagementErrorMessage(error: unknown): string {
  if (!isApiError(error)) {
    return "این کار انجام نشد. کمی بعد دوباره تلاش کنید.";
  }

  const message = engagementErrorMessages[error.code] ?? getApiErrorMessage(error);

  return engagementErrorMessages[error.code]
    ? error.requestId
      ? `${message} شناسه درخواست: ${error.requestId}`
      : message
    : message;
}

export { getEngagementErrorMessage };
