import { isApiError } from "@/lib/api/api-error";

export function getEntryFormErrorMessage(error: unknown) {
  if (!isApiError(error)) {
    return "درخواست با خطا روبه‌رو شد.";
  }

  const messages: Record<string, string> = {
    AUTH_EMAIL_VERIFICATION_REQUIRED: "برای افزودن مطلب، ابتدا ایمیل خود را تأیید کنید.",
    AUTH_ACCOUNT_SUSPENDED: "این حساب موقتاً تعلیق شده است.",
    ENTRY_TITLE_REQUIRED: "عنوان مطلب را وارد کنید.",
    ENTRY_TAXONOMY_INVALID: "موضوع، نوع مطلب یا ولایت انتخاب‌شده معتبر نیست.",
    ENTRY_DISTRICT_PROVINCE_MISMATCH: "ولسوالی با ولایت انتخاب‌شده سازگار نیست.",
    ENTRY_CONTENT_INVALID: "متن مطلب معتبر نیست.",
    ENTRY_INVALID_STATUS: "این مطلب در وضعیت قابل ویرایش نیست.",
    ENTRY_SUBMISSION_INCOMPLETE: "برای ارسال، بخش‌های ضروری مطلب را کامل کنید.",
    ENTRY_SUBMISSION_REFERENCE_INVALID: "یکی از پیوندهای داخلی این مطلب معتبر نیست.",
    IMAGE_LIMIT_EXCEEDED: "تعداد تصاویر بیشتر از حد مجاز است.",
    IMAGE_TOO_LARGE: "حجم تصویر بیشتر از حد مجاز است.",
    IMAGE_INVALID_TYPE: "نوع فایل تصویر پشتیبانی نمی‌شود.",
    IMAGE_PERMISSION_REQUIRED: "اجازه استفاده از تصویر را تأیید کنید.",
    YOUTUBE_URL_INVALID: "نشانی یوتیوب معتبر نیست.",
    YOUTUBE_VIDEO_NOT_FOUND: "این ویدیو پیدا نشد یا در دسترس عموم نیست.",
    YOUTUBE_METADATA_UNAVAILABLE:
      "فعلاً دریافت خودکار جزئیات ویدیو ممکن نیست؛ می‌توانید آن‌ها را دستی وارد کنید.",
    TOO_MANY_REQUESTS: "تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.",
    NETWORK_ERROR: "ارتباط با سرور برقرار نشد.",
  };

  return messages[error.code] ?? `خطایی رخ داد. شناسه درخواست: ${error.requestId ?? "نامشخص"}`;
}
