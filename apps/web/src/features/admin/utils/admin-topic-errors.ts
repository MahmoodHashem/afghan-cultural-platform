import { isApiError } from "@/lib/api/api-error";
import { getApiErrorMessage } from "@/lib/api/api-error-messages";

const topicErrorMessages: Record<string, string> = {
  TAXONOMY_DUPLICATE_NAME: "موضوعی با این نام از قبل وجود دارد.",
  TAXONOMY_DUPLICATE_SLUG: "این نشانی قبلاً برای موضوع دیگری استفاده شده است.",
  TAXONOMY_INVALID_SLUG: "نشانی موضوع معتبر نیست.",
  TAXONOMY_NOT_FOUND: "این موضوع پیدا نشد.",
  TAXONOMY_INVALID_REORDER_ITEMS: "ترتیب انتخاب‌شده معتبر نیست.",
  AUTH_INSUFFICIENT_ROLE: "برای مدیریت موضوع‌ها دسترسی لازم را ندارید.",
};

function getAdminTopicErrorMessage(error: unknown, singular = "موضوع") {
  if (!isApiError(error)) return "ارتباط با سرور برقرار نشد.";
  const knownMessage = topicErrorMessages[error.code]?.replaceAll("موضوع", singular);
  return knownMessage ?? getApiErrorMessage(error);
}

export { getAdminTopicErrorMessage };
