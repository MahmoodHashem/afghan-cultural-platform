import { ApiError } from "@/lib/api/api-error";
import { getApiErrorMessage } from "@/lib/api/api-error-messages";

const ADMIN_USER_ERROR_MESSAGES: Record<string, string> = {
  ADMIN_USER_NOT_FOUND: "این حساب پیدا نشد یا دیگر در دسترس نیست.",
  ADMIN_USER_SELF_ACTION_FORBIDDEN: "نمی‌توانید وضعیت حساب خودتان را از این بخش تغییر دهید.",
  ADMIN_USER_SUSPENSION_REASON_REQUIRED: "برای تعلیق حساب، دلیل کوتاهی بنویسید.",
  ADMIN_USER_ALREADY_SUSPENDED: "این حساب از قبل تعلیق شده است.",
  ADMIN_USER_ALREADY_ACTIVE: "این حساب هم‌اکنون فعال است.",
  ADMIN_USER_STATUS_CONFLICT: "وضعیت حساب هم‌زمان تغییر کرده است. صفحه را تازه کنید.",
  ADMIN_USER_ROLE_REASON_REQUIRED: "برای تغییر نقش، دلیل کوتاه و روشنی بنویسید.",
  ADMIN_USER_ROLE_INVALID_TRANSITION: "این تغییر نقش از بخش مدیریت ناظران امکان‌پذیر نیست.",
  ADMIN_USER_ROLE_PROMOTION_REQUIRES_VERIFIED_EMAIL:
    "برای ناظرشدن، ایمیل کاربر باید تأیید شده باشد.",
  ADMIN_USER_ROLE_PROMOTION_REQUIRES_ACTIVE_ACCOUNT: "حساب تعلیق‌شده نمی‌تواند ناظر شود.",
  ADMIN_USER_ROLE_PROTECTED_ADMIN: "نقش مدیر از بخش مدیریت ناظران قابل تغییر نیست.",
  ADMIN_USER_ROLE_CONFLICT: "نقش کاربر هم‌زمان تغییر کرده است. اطلاعات را تازه کنید.",
  AUTH_INSUFFICIENT_ROLE: "برای انجام این کار دسترسی لازم را ندارید.",
  AUTH_ACCOUNT_SUSPENDED: "حساب شما تعلیق شده است.",
  NETWORK_ERROR: "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.",
};

function getAdminUserErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return ADMIN_USER_ERROR_MESSAGES[error.code] ?? getApiErrorMessage(error);
  }

  return "انجام این کار ممکن نشد. دوباره تلاش کنید.";
}

export { getAdminUserErrorMessage };
