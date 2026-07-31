import { apiRequest } from "@/lib/api/api-client";
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

export type { LoginWithEmailInput, RegisterWithEmailInput };
export { loginWithEmail, registerWithEmail };
