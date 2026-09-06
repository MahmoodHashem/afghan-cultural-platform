import { ApiError } from "@/lib/api/api-error";
import { getApiErrorMessage } from "@/lib/api/api-error-messages";

const messages: Record<string, string> = {
  ADMIN_ENTRY_NOT_FOUND: "این مطلب پیدا نشد.",
  ADMIN_ENTRY_INVALID_STATUS: "وضعیت فعلی مطلب برای این کار مناسب نیست.",
  ADMIN_ENTRY_REASON_REQUIRED: "دلیل این تصمیم را دست‌کم در سه حرف بنویسید.",
  ADMIN_ENTRY_ALREADY_ARCHIVED: "این مطلب پیش‌تر بایگانی شده است.",
  ADMIN_ENTRY_ALREADY_RESTORED: "این مطلب پیش‌تر به حالت منتشرشده برگشته است.",
  ADMIN_ENTRY_LIFECYCLE_CONFLICT: "وضعیت مطلب هم‌زمان تغییر کرده است. صفحه را تازه کنید.",
  AUTH_INSUFFICIENT_ROLE: "برای انجام این کار دسترسی لازم را ندارید.",
};

function getAdminEntryErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return messages[error.code] ?? getApiErrorMessage(error);
  }
  return "ارتباط با سرور برقرار نشد.";
}

export { getAdminEntryErrorMessage };
