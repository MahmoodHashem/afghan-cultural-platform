import { isApiError } from "@/lib/api/api-error";
import { getApiErrorMessage } from "@/lib/api/api-error-messages";

const geographyErrorMessages: Record<string, string> = {
  TAXONOMY_DUPLICATE_NAME: "موردی با این نام از قبل وجود دارد.",
  TAXONOMY_DUPLICATE_SLUG: "نشانی تولیدشده قبلاً استفاده شده است.",
  TAXONOMY_PROVINCE_NOT_FOUND: "این ولایت پیدا نشد.",
  TAXONOMY_NOT_FOUND: "این ولسوالی پیدا نشد.",
  TAXONOMY_PROVINCE_IMAGE_NOT_FOUND: "برای این ولایت تصویر مدیریت‌شده‌ای ثبت نشده است.",
  TAXONOMY_INVALID_REORDER_ITEMS: "ترتیب انتخاب‌شده معتبر نیست.",
  IMAGE_TOO_LARGE: "حجم تصویر بیشتر از حد مجاز است.",
  IMAGE_INVALID_TYPE: "تنها تصویر معتبر JPEG، PNG یا WebP پذیرفته می‌شود.",
  IMAGE_UPLOAD_FAILED: "بارگذاری تصویر انجام نشد.",
  IMAGE_DELETE_FAILED: "حذف تصویر انجام نشد.",
  AUTH_INSUFFICIENT_ROLE: "برای مدیریت ولایت‌ها دسترسی لازم را ندارید.",
};

function getAdminProvinceErrorMessage(error: unknown) {
  if (!isApiError(error)) return "ارتباط با سرور برقرار نشد.";
  return geographyErrorMessages[error.code] ?? getApiErrorMessage(error);
}

export { getAdminProvinceErrorMessage };
