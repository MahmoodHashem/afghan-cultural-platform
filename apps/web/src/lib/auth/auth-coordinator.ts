import { ApiError, type ApiFieldError } from "@/lib/api/api-error";
import { getPublicApiBaseUrl } from "@/lib/api/env";
import type { AuthSession } from "@/stores/auth-store";
import { useAuthStore } from "@/stores/auth-store";

type AuthSessionResponse = {
  data: AuthSession;
};

type BackendErrorEnvelope = {
  error?: {
    code?: unknown;
    message?: unknown;
    fieldErrors?: unknown;
  };
  requestId?: unknown;
};

let refreshPromise: Promise<AuthSession> | null = null;
let authGeneration = 0;
let onAuthCleared: (() => void) | undefined;
let onAuthRestored: ((session: AuthSession) => void) | undefined;

function configureAuthCoordinator(callbacks: {
  onAuthCleared?: () => void;
  onAuthRestored?: (session: AuthSession) => void;
}) {
  onAuthCleared = callbacks.onAuthCleared;
  onAuthRestored = callbacks.onAuthRestored;
}

async function bootstrapAuthSession() {
  useAuthStore.getState().setInitializing();

  try {
    await refreshAuthSessionOnce();
  } catch {
    clearAuthSession();
  }
}

async function refreshAccessTokenOnce() {
  const session = await refreshAuthSessionOnce();

  return session.accessToken;
}

async function refreshAuthSessionOnce() {
  if (!refreshPromise) {
    const generation = authGeneration;

    refreshPromise = requestRefreshSession()
      .then((session) => {
        if (generation === authGeneration) {
          useAuthStore.getState().setAuthenticated(session);
          onAuthRestored?.(session);
        }

        return session;
      })
      .catch((error: unknown) => {
        if (generation === authGeneration) {
          clearAuthSession();
        }

        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function clearAuthSession() {
  authGeneration += 1;
  refreshPromise = null;
  useAuthStore.getState().setUnauthenticated();
  onAuthCleared?.();
}

function markAuthLogoutStarted() {
  clearAuthSession();
}

async function requestRefreshSession() {
  const response = await fetch(`${getPublicApiBaseUrl()}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  const parsedResponse = await parseJsonResponse(response);

  if (!response.ok) {
    throw createApiError(response, parsedResponse);
  }

  return (parsedResponse as AuthSessionResponse).data;
}

async function parseJsonResponse(response: Response): Promise<unknown> {
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

export {
  bootstrapAuthSession,
  clearAuthSession,
  configureAuthCoordinator,
  markAuthLogoutStarted,
  refreshAccessTokenOnce,
  refreshAuthSessionOnce,
};
