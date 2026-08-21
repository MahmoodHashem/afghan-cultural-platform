import { getPublicApiBaseUrl } from "@/lib/api/env";
import { createApiError, parseJsonResponse } from "@/lib/api/response";
import type { AuthSession } from "@/stores/auth-store";
import { useAuthStore } from "@/stores/auth-store";

type AuthSessionResponse = {
  data: AuthSession;
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

export {
  bootstrapAuthSession,
  clearAuthSession,
  configureAuthCoordinator,
  markAuthLogoutStarted,
  refreshAccessTokenOnce,
  refreshAuthSessionOnce,
};
