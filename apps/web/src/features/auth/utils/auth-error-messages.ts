import { isApiError } from "@/lib/api/api-error";

const authErrorMessages: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: "اطلاعات ورود نادرست است.",
  AUTH_PASSWORD_NOT_CONFIGURED: "برای این حساب رمز عبور تنظیم نشده است.",
  AUTH_ACCOUNT_SUSPENDED: "این حساب موقتاً تعلیق شده است.",
  AUTH_UNAUTHORIZED: "برای ادامه باید وارد حساب شوید.",
  AUTH_INSUFFICIENT_ROLE: "حساب شما اجازه دسترسی به این بخش را ندارد.",
  AUTH_EMAIL_VERIFICATION_REQUIRED: "برای این کار باید ایمیل خود را تأیید کنید.",
  AUTH_EMAIL_ALREADY_REGISTERED: "این ایمیل قبلاً ثبت شده است.",
  AUTH_PASSWORD_TOO_WEAK: "رمز عبور شرایط امنیتی لازم را ندارد.",
  AUTH_GOOGLE_EMAIL_NOT_VERIFIED: "ایمیل حساب گوگل شما تأیید نشده است.",
  AUTH_GOOGLE_ACCOUNT_ALREADY_LINKED: "این حساب گوگل قبلاً به حساب دیگری وصل شده است.",
  AUTH_GOOGLE_AUTH_FAILED: "ورود با گوگل کامل نشد. دوباره تلاش کنید.",
  AUTH_FACEBOOK_EMAIL_REQUIRED: "فیسبوک ایمیل حساب شما را در اختیار ما قرار نداد.",
  AUTH_FACEBOOK_EMAIL_LINKING_NOT_ALLOWED:
    "این ایمیل قبلاً با روش دیگری ثبت شده و فیسبوک امکان اتصال امن آن را تأیید نکرده است.",
  AUTH_FACEBOOK_ACCOUNT_ALREADY_LINKED: "این حساب فیسبوک قبلاً به حساب دیگری وصل شده است.",
  AUTH_FACEBOOK_AUTH_FAILED: "ورود با فیسبوک کامل نشد. دوباره تلاش کنید.",
  AUTH_OAUTH_FAILED: "ورود اجتماعی کامل نشد. دوباره تلاش کنید.",
  AUTH_REFRESH_TOKEN_MISSING: "نشست ورود شما پیدا نشد. دوباره وارد شوید.",
  AUTH_REFRESH_TOKEN_INVALID: "نشست ورود معتبر نیست. دوباره وارد شوید.",
  AUTH_REFRESH_TOKEN_EXPIRED: "نشست ورود شما منقضی شده است. دوباره وارد شوید.",
  AUTH_REFRESH_TOKEN_REVOKED: "نشست ورود شما پایان یافته است. دوباره وارد شوید.",
  AUTH_SESSION_NOT_FOUND: "نشست ورود شما پیدا نشد. دوباره وارد شوید.",
  OAUTH_CANCELLED: "ورود لغو شد.",
  BAD_REQUEST: "لطفاً اطلاعات واردشده را بررسی کنید.",
  TOO_MANY_REQUESTS: "تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.",
  NETWORK_ERROR: "ارتباط با سرور برقرار نشد.",
};

function getAuthErrorMessageByCode(code: string, requestId?: string) {
  return withRequestId(authErrorMessages[code] ?? "خطایی رخ داد.", requestId);
}

function getAuthErrorMessage(error: unknown) {
  if (!isApiError(error)) {
    return "خطایی رخ داد. کمی بعد دوباره تلاش کنید.";
  }

  return getAuthErrorMessageByCode(error.code, error.requestId);
}

function withRequestId(message: string, requestId: string | undefined) {
  return requestId ? `${message} شناسه درخواست: ${requestId}` : message;
}

export { getAuthErrorMessage, getAuthErrorMessageByCode };
