import { ApiError } from "@/lib/api/api-error";
import { getPublicApiBaseUrl } from "@/lib/api/env";
import { createApiError, parseJsonResponse } from "@/lib/api/response";
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

function createUrl(path: string) {
  const baseUrl = getPublicApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
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

export { apiRequest };
