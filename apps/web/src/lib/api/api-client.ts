import { ApiError, type ApiFieldError } from "@/lib/api/api-error";
import { getPublicApiBaseUrl } from "@/lib/api/env";
import { clearAuthSession, refreshAccessTokenOnce } from "@/lib/auth/auth-coordinator";
import { getAccessToken } from "@/stores/auth-store";

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown | FormData;
  accessToken?: string | null;
  signal?: AbortSignal;
  headers?: HeadersInit;
  includeCredentials?: boolean;
  skipAuthRefresh?: boolean;
};

type BackendErrorEnvelope = {
  error?: {
    code?: unknown;
    message?: unknown;
    fieldErrors?: unknown;
  };
  requestId?: unknown;
};

function createUrl(path: string) {
  const baseUrl = getPublicApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

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

async function apiRequest<TData>(
  path: string,
  {
    method = "GET",
    body,
    accessToken = getAccessToken(),
    signal,
    headers,
    includeCredentials = true,
    skipAuthRefresh = false,
  }: ApiRequestOptions = {},
): Promise<TData> {
  const requestHeaders = new Headers(headers);

  if (accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const requestInit: RequestInit = {
    method,
    headers: requestHeaders,
    signal,
    credentials: includeCredentials ? "include" : "same-origin",
  };

  if (body !== undefined) {
    if (isFormData(body)) {
      requestInit.body = body;
    } else {
      requestHeaders.set("Content-Type", "application/json");
      requestInit.body = JSON.stringify(body);
    }
  }

  const url = createUrl(path);
  let response: Response;

  try {
    response = await fetch(url, requestInit);
  } catch {
    throw new ApiError({
      code: "NETWORK_ERROR",
      message: "ارتباط با سرور برقرار نشد.",
    });
  }

  const parsedResponse = await parseJsonResponse(response);

  if (!response.ok) {
    const apiError = createApiError(response, parsedResponse);

    if (shouldRefreshAccessToken(apiError, path, accessToken, skipAuthRefresh)) {
      try {
        const refreshedAccessToken = await refreshAccessTokenOnce();

        return apiRequest<TData>(path, {
          method,
          body,
          accessToken: refreshedAccessToken,
          signal,
          headers,
          includeCredentials,
          skipAuthRefresh: true,
        });
      } catch {
        clearAuthSession();
      }
    }

    if (apiError.code === "AUTH_ACCOUNT_SUSPENDED") {
      clearAuthSession();
    }

    throw apiError;
  }

  return parsedResponse as TData;
}

function shouldRefreshAccessToken(
  error: ApiError,
  path: string,
  accessToken: string | null,
  skipAuthRefresh: boolean,
) {
  return (
    !skipAuthRefresh &&
    Boolean(accessToken) &&
    error.status === 401 &&
    !path.startsWith("/auth/refresh")
  );
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

export { apiRequest };
