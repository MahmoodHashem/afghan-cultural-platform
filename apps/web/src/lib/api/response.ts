import { ApiError, type ApiFieldError } from "@/lib/api/api-error";

type BackendErrorEnvelope = {
  error?: {
    code?: unknown;
    message?: unknown;
    fieldErrors?: unknown;
  };
  requestId?: unknown;
};

async function parseJsonResponse(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return undefined;
  }

  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function createApiError(response: Response, parsedResponse: unknown): ApiError {
  const errorEnvelope = isBackendErrorEnvelope(parsedResponse) ? parsedResponse : undefined;
  const backendError = errorEnvelope?.error;
  const code =
    typeof backendError?.code === "string"
      ? backendError.code
      : createHttpErrorCode(response.status);
  const message =
    typeof backendError?.message === "string" ? backendError.message : "درخواست با خطا روبه‌رو شد.";
  const requestId =
    typeof errorEnvelope?.requestId === "string" ? errorEnvelope.requestId : undefined;

  return new ApiError({
    code,
    message,
    fieldErrors: createFieldErrors(backendError?.fieldErrors),
    requestId,
    status: response.status,
  });
}

function isBackendErrorEnvelope(value: unknown): value is BackendErrorEnvelope {
  return typeof value === "object" && value !== null && "error" in value;
}

function createFieldErrors(value: unknown): ApiFieldError[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((fieldError) => {
    if (
      typeof fieldError === "object" &&
      fieldError !== null &&
      "field" in fieldError &&
      "message" in fieldError &&
      typeof fieldError.field === "string" &&
      typeof fieldError.message === "string"
    ) {
      return [{ field: fieldError.field, message: fieldError.message }];
    }

    return [];
  });
}

function createHttpErrorCode(status: number) {
  if (status === 429) {
    return "TOO_MANY_REQUESTS";
  }

  return `HTTP_${status}`;
}

export { createApiError, parseJsonResponse };
