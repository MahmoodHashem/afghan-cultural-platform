import type { ApiFieldError } from "@/lib/api/api-error";

const fieldLabels: Record<string, string> = {
  email: "ایمیل",
  password: "رمز عبور",
  newPassword: "رمز عبور جدید",
  displayName: "نام و نام خانوادگی",
  title: "عنوان",
  summary: "خلاصه",
  body: "متن دیدگاه",
  contentJson: "متن مطلب",
  slug: "نشانی",
  name: "نام",
  description: "توضیحات",
  reason: "دلیل",
  altText: "متن جایگزین تصویر",
};

function getPersianFieldErrorMessage(fieldError: ApiFieldError) {
  const { field, message } = fieldError;

  if (field === "email") return "ایمیل معتبر وارد کنید.";
  if (field === "displayName") return "نام و نام خانوادگی باید بین ۲ تا ۸۰ حرف باشد.";
  if (field === "password" || field === "newPassword") {
    return "رمز عبور را مطابق شرایط امنیتی وارد کنید.";
  }
  if (field === "title") {
    if (message.includes("less than 2")) return "عنوان باید دست‌کم ۲ حرف باشد.";
    if (message.includes("greater than 60")) return "عنوان باید حداکثر ۶۰ حرف باشد.";
    return "عنوان مطلب را بررسی کنید.";
  }
  if (field === "summary") {
    if (message.includes("less than 10")) return "خلاصه باید دست‌کم ۱۰ حرف باشد.";
    if (message.includes("greater than 160")) return "خلاصه باید حداکثر ۱۶۰ حرف باشد.";
    return "خلاصه مطلب را بررسی کنید.";
  }
  if (message.includes("should not exist")) {
    return `${fieldLabels[field] ?? "این فیلد"} قابل ارسال نیست.`;
  }
  if (message.includes("must not be greater than")) {
    const limit = message.match(/greater than (\d+)/)?.[1];
    return limit
      ? `${fieldLabels[field] ?? "این فیلد"} باید حداکثر ${toPersianDigits(limit)} حرف باشد.`
      : `${fieldLabels[field] ?? "این فیلد"} بیش از حد طولانی است.`;
  }
  if (message.includes("must not be less than")) {
    const limit = message.match(/less than (\d+)/)?.[1];
    return limit
      ? `${fieldLabels[field] ?? "این فیلد"} باید دست‌کم ${toPersianDigits(limit)} حرف باشد.`
      : `${fieldLabels[field] ?? "این فیلد"} کوتاه است.`;
  }
  if (message.includes("should not be empty")) {
    return `${fieldLabels[field] ?? "این فیلد"} را وارد کنید.`;
  }
  if (message.includes("must be an email")) return "ایمیل معتبر وارد کنید.";
  if (message.includes("must be a UUID")) return `${fieldLabels[field] ?? "این مقدار"} معتبر نیست.`;
  if (message.includes("must be one of the following values")) {
    return `${fieldLabels[field] ?? "این گزینه"} انتخاب‌شده معتبر نیست.`;
  }
  if (message.includes("must be a URL")) return "نشانی اینترنتی معتبر وارد کنید.";
  if (message.includes("must be a valid ISO 8601 date")) return "تاریخ معتبر وارد کنید.";

  return `${fieldLabels[field] ?? "این فیلد"} را بررسی کنید.`;
}

function localizeApiFieldErrors(fieldErrors: ApiFieldError[]) {
  return fieldErrors.map((fieldError) => ({
    ...fieldError,
    message: getPersianFieldErrorMessage(fieldError),
  }));
}

function toPersianDigits(value: string) {
  return value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit);
}

export { getPersianFieldErrorMessage, localizeApiFieldErrors };
