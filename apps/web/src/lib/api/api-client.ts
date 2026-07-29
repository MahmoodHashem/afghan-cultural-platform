import { getPublicApiBaseUrl } from "@/lib/api/env";

type ApiSuccessResponse<TData> = {
  success: true;
  data: TData;
  message?: string;
};

type ApiFieldError = {
  field: string;
  message: string;
};

type ApiErrorResponse = {
  success: false;
  message: string;
  code?: string;
  fieldErrors?: ApiFieldError[];
};

class ApiError extends Error {
  status: number;
  response: ApiErrorResponse;

  constructor(status: number, response: ApiErrorResponse) {
    super(response.message);
    this.name = "ApiError";
    this.status = status;
    this.response = response;
  }
}

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown | FormData;
  accessToken?: string;
  signal?: AbortSignal;
  headers?: HeadersInit;
};

function createUrl(path: string) {
  const baseUrl = getPublicApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

async function parseJsonResponse<T>(response: Response): Promise<T | undefined> {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return undefined;
  }

  return response.json() as Promise<T>;
}

async function apiRequest<TData>(
  path: string,
  { method = "GET", body, accessToken, signal, headers }: ApiRequestOptions = {},
): Promise<TData> {
  const requestHeaders = new Headers(headers);

  if (accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const requestInit: RequestInit = {
    method,
    headers: requestHeaders,
    signal,
  };

  if (body !== undefined) {
    if (isFormData(body)) {
      requestInit.body = body;
    } else {
      requestHeaders.set("Content-Type", "application/json");
      requestInit.body = JSON.stringify(body);
    }
  }

  const response = await fetch(createUrl(path), requestInit);
  const parsedResponse = await parseJsonResponse<ApiSuccessResponse<TData> | ApiErrorResponse>(
    response,
  );

  if (!response.ok) {
    const errorResponse: ApiErrorResponse =
      parsedResponse && "success" in parsedResponse && !parsedResponse.success
        ? parsedResponse
        : {
            success: false,
            message: "درخواست با خطا روبه‌رو شد.",
          };

    throw new ApiError(response.status, errorResponse);
  }

  if (parsedResponse && "success" in parsedResponse && parsedResponse.success) {
    return parsedResponse.data;
  }

  return parsedResponse as TData;
}

export type { ApiErrorResponse, ApiFieldError, ApiSuccessResponse };
export { ApiError, apiRequest };
