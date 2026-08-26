"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getCurrentUser,
  type LoginWithEmailInput,
  loginWithEmail,
  logoutAllSessions,
  logoutCurrentSession,
  type RegisterWithEmailInput,
  registerWithEmail,
  resendEmailVerification,
  verifyEmail,
} from "@/features/auth/api/auth-api";
import { publishAuthEvent } from "@/features/auth/utils/auth-events";
import { markAuthLogoutStarted, refreshAuthSessionOnce } from "@/lib/auth/auth-coordinator";
import {
  clearPrivateAuthQueries,
  currentUserQueryKey,
  setCurrentUserQuery,
} from "@/lib/auth/auth-query";
import { useAuthStore } from "@/stores/auth-store";

function useLogin() {
  const queryClient = useQueryClient();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  return useMutation({
    mutationFn: (input: LoginWithEmailInput) => loginWithEmail(input),
    onSuccess: (session) => {
      setAuthenticated(session);
      setCurrentUserQuery(queryClient, session.user);
    },
  });
}

function useRegister() {
  const queryClient = useQueryClient();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  return useMutation({
    mutationFn: (input: RegisterWithEmailInput) => registerWithEmail(input),
    onSuccess: (session) => {
      setAuthenticated(session);
      setCurrentUserQuery(queryClient, session.user);
    },
  });
}

function useRefreshAuthSession() {
  const queryClient = useQueryClient();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated);

  return useMutation({
    mutationFn: () => refreshAuthSessionOnce(),
    onSuccess: (session) => {
      setAuthenticated(session);
      setCurrentUserQuery(queryClient, session.user);
    },
    onError: () => {
      setUnauthenticated();
      clearPrivateAuthQueries(queryClient);
    },
  });
}

function useCurrentUser() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: ({ signal }) => getCurrentUser(signal),
  });
}

function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutCurrentSession(),
    onMutate: () => {
      markAuthLogoutStarted();
      clearPrivateAuthQueries(queryClient);
    },
    onSettled: () => {
      markAuthLogoutStarted();
      clearPrivateAuthQueries(queryClient);
    },
  });
}

function useLogoutAll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutAllSessions(),
    onMutate: () => {
      markAuthLogoutStarted();
      clearPrivateAuthQueries(queryClient);
    },
    onSettled: () => {
      markAuthLogoutStarted();
      clearPrivateAuthQueries(queryClient);
    },
  });
}

function useResendEmailVerification() {
  return useMutation({
    mutationFn: (email: string) => resendEmailVerification(email),
  });
}

function useVerifyEmail() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (token: string) => verifyEmail(token),
    onSuccess: async ({ user }) => {
      updateUser(user);

      try {
        const session = await refreshAuthSessionOnce();
        setCurrentUserQuery(queryClient, session.user);
      } catch {
        // Verification remains successful even when this browser has no active refresh session.
      }

      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      publishAuthEvent({ type: "email-verified", userId: user.id });
    },
  });
}

export {
  currentUserQueryKey,
  useCurrentUser,
  useLogin,
  useLogout,
  useLogoutAll,
  useRefreshAuthSession,
  useRegister,
  useResendEmailVerification,
  useVerifyEmail,
};
