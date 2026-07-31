import { apiRequest } from "@/lib/api/api-client";
import { getPublicApiBaseUrl } from "@/lib/api/env";
import type { AuthSession } from "@/stores/auth-store";

type LoginWithEmailInput = {
  email: string;
  password: string;
};

type RegisterWithEmailInput = {
  displayName: string;
  email: string;
  password: string;
};

type AuthSessionResponse = {
  data: AuthSession;
};

type OAuthProvider = "google" | "facebook";

async function loginWithEmail(input: LoginWithEmailInput, signal?: AbortSignal) {
  const response = await apiRequest<AuthSessionResponse>("/auth/login", {
    method: "POST",
    body: input,
    signal,
  });

  return response.data;
}

async function registerWithEmail(input: RegisterWithEmailInput, signal?: AbortSignal) {
  const response = await apiRequest<AuthSessionResponse>("/auth/register", {
    method: "POST",
    body: input,
    signal,
  });

  return response.data;
}

async function refreshAuthSession(signal?: AbortSignal) {
  const response = await apiRequest<AuthSessionResponse>("/auth/refresh", {
    method: "POST",
    signal,
  });

  return response.data;
}

function createOAuthStartUrl(provider: OAuthProvider, nextPath?: string) {
  const url = new URL(`${getPublicApiBaseUrl()}/auth/${provider}`);

  if (nextPath) {
    url.searchParams.set("next", nextPath);
  }

  return url.toString();
}

export type { LoginWithEmailInput, RegisterWithEmailInput };
export { createOAuthStartUrl, loginWithEmail, refreshAuthSession, registerWithEmail };
