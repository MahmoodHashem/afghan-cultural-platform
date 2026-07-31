import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { getAuthErrorMessage } from "@/features/auth/utils/auth-error-messages";
import { isApiError } from "@/lib/api/api-error";

type FieldNameMap<TFormValues extends FieldValues> = Partial<Record<string, Path<TFormValues>>>;

function applyApiFieldErrors<TFormValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFormValues>,
  fieldNameMap: FieldNameMap<TFormValues>,
) {
  if (!isApiError(error)) {
    return false;
  }

  let appliedFieldError = false;

  for (const fieldError of error.fieldErrors) {
    const fieldName = fieldNameMap[fieldError.field];

    if (fieldName) {
      setError(
        fieldName,
        {
          type: "server",
          message: getPersianFieldErrorMessage(fieldError.field, fieldError.message),
        },
        {
          shouldFocus: !appliedFieldError,
        },
      );
      appliedFieldError = true;
    }
  }

  return appliedFieldError;
}

function getPersianFieldErrorMessage(field: string, message: string) {
  if (field === "email") {
    return "ایمیل معتبر وارد کنید.";
  }

  if (field === "displayName") {
    return "نام و نام خانوادگی باید بین ۲ تا ۸۰ نویسه باشد.";
  }

  if (field === "password") {
    return "رمز عبور را مطابق شرایط امنیتی وارد کنید.";
  }

  return message || "لطفاً این فیلد را بررسی کنید.";
}

function getAuthFormErrorMessage(error: unknown) {
  return getAuthErrorMessage(error);
}

export { applyApiFieldErrors, getAuthFormErrorMessage };
