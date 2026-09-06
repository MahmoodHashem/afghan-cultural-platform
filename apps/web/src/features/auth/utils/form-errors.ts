import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { getAuthErrorMessage } from "@/features/auth/utils/auth-error-messages";
import { isApiError } from "@/lib/api/api-error";
import { getPersianFieldErrorMessage } from "@/lib/api/api-field-errors";

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
          message: getPersianFieldErrorMessage(fieldError),
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

function getAuthFormErrorMessage(error: unknown) {
  return getAuthErrorMessage(error);
}

export { applyApiFieldErrors, getAuthFormErrorMessage };
