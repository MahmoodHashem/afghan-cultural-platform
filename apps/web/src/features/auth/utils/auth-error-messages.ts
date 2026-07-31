import { isApiError } from "@/lib/api/api-error";

const authErrorMessages: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: "اطلاعات ورود نادرست است.",
  AUTH_PASSWORD_NOT_CONFIGURED: "برای این حساب رمز عبور تنظیم نشده است.",
  AUTH_ACCOUNT_SUSPENDED: "این حساب موقتاً تعلیق شده است.",
  AUTH_EMAIL_ALREADY_REGISTERED: "این ایمیل قبلاً ثبت شده است.",
  AUTH_PASSWORD_TOO_WEAK: "رمز عبور شرایط امنیتی لازم را ندارد.",
  BAD_REQUEST: "لطفاً اطلاعات واردشده را بررسی کنید.",
  TOO_MANY_REQUESTS: "تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.",
  NETWORK_ERROR: "ارتباط با سرور برقرار نشد.",
};

function getAuthErrorMessage(error: unknown) {
  if (!isApiError(error)) {
    return "خطایی رخ داد. کمی بعد دوباره تلاش کنید.";
  }

  const controlledMessage = authErrorMessages[error.code];

  if (controlledMessage) {
    return withRequestId(controlledMessage, error.requestId);
  }

  return withRequestId("خطایی رخ داد.", error.requestId);
}

function withRequestId(message: string, requestId: string | undefined) {
  return requestId ? `${message} شناسه درخواست: ${requestId}` : message;
}

export { getAuthErrorMessage };
