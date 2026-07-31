type ApiFieldError = {
  field: string;
  message: string;
};

type ApiErrorInput = {
  code: string;
  message: string;
  fieldErrors?: ApiFieldError[];
  requestId?: string;
  status?: number;
};

class ApiError extends Error {
  code: string;
  fieldErrors: ApiFieldError[];
  requestId?: string;
  status?: number;

  constructor({ code, message, fieldErrors = [], requestId, status }: ApiErrorInput) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.requestId = requestId;
    this.status = status;
  }
}

function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export type { ApiErrorInput, ApiFieldError };
export { ApiError, isApiError };
