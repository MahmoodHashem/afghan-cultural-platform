import { isApiError } from "@/lib/api/api-error";

function getAdminAuditErrorMessage(error: unknown) {
  if (isApiError(error) && error.code === "ADMIN_AUDIT_DATE_RANGE_INVALID") {
    return "تاریخ آغاز باید پیش از تاریخ پایان باشد.";
  }
  return "تاریخچه فعالیت‌ها بارگذاری نشد. دوباره تلاش کنید.";
}

export { getAdminAuditErrorMessage };
