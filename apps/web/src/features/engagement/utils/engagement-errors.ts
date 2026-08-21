import { isApiError } from "@/lib/api/api-error";

const engagementErrorMessages: Record<string, string> = {
  AUTH_EMAIL_VERIFICATION_REQUIRED: "برای این کار باید ایمیل خود را تأیید کنید.",
  AUTH_ACCOUNT_SUSPENDED: "این حساب موقتاً تعلیق شده است.",
  AUTH_UNAUTHORIZED: "برای ادامه باید وارد حساب شوید.",
  COMMUNITY_ENTRY_NOT_FOUND: "این مطلب دیگر برای تعامل در دسترس نیست.",
  PROFILE_BOOKMARK_ENTRY_NOT_FOUND: "این مطلب دیگر برای ذخیره‌کردن در دسترس نیست.",
  COMMUNITY_REVIEW_ALREADY_EXISTS: "شما پیش‌تر برای این مطلب دیدگاه نوشته‌اید.",
  COMMUNITY_REVIEW_NOT_FOUND: "دیدگاه شما پیدا نشد.",
  COMMUNITY_REVIEW_BODY_INVALID: "متن دیدگاه باید بین ۱۰ تا ۱۲۰۰ حرف باشد.",
  BAD_REQUEST: "لطفاً اطلاعات واردشده را بررسی کنید.",
  TOO_MANY_REQUESTS: "درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.",
  NETWORK_ERROR: "ارتباط با سرور برقرار نشد.",
};

function getEngagementErrorMessage(error: unknown): string {
  if (!isApiError(error)) {
    return "این کار انجام نشد. کمی بعد دوباره تلاش کنید.";
  }

  const message = engagementErrorMessages[error.code] ?? "این کار انجام نشد. دوباره تلاش کنید.";

  return error.requestId ? `${message} شناسه درخواست: ${error.requestId}` : message;
}

export { getEngagementErrorMessage };
