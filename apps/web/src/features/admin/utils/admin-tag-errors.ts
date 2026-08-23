import { isApiError } from "@/lib/api/api-error";

const tagErrorMessages: Record<string, string> = {
  TAXONOMY_DUPLICATE_NAME: "برچسبی با این نام از قبل وجود دارد.",
  TAXONOMY_DUPLICATE_SLUG: "این نشانی قبلاً برای برچسب دیگری استفاده شده است.",
  TAXONOMY_INVALID_SLUG: "نشانی برچسب معتبر نیست.",
  TAXONOMY_NOT_FOUND: "این برچسب پیدا نشد.",
  AUTH_INSUFFICIENT_ROLE: "برای مدیریت برچسب‌ها دسترسی لازم را ندارید.",
};

function getAdminTagErrorMessage(error: unknown) {
  if (!isApiError(error)) return "ارتباط با سرور برقرار نشد.";
  return (
    tagErrorMessages[error.code] ??
    (error.requestId
      ? `ثبت تغییرات ممکن نشد. شناسه درخواست: ${error.requestId}`
      : "ثبت تغییرات ممکن نشد.")
  );
}

export { getAdminTagErrorMessage };
