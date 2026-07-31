"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  type LoginWithEmailInput,
  loginWithEmail,
  type RegisterWithEmailInput,
  registerWithEmail,
} from "@/features/auth/api/auth-api";
import { useAuthStore } from "@/stores/auth-store";

const currentUserQueryKey = ["auth", "current-user"] as const;

function useLogin() {
  const queryClient = useQueryClient();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  return useMutation({
    mutationFn: (input: LoginWithEmailInput) => loginWithEmail(input),
    onSuccess: (session) => {
      setAuthenticated(session);
      queryClient.setQueryData(currentUserQueryKey, session.user);
      void queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
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
      queryClient.setQueryData(currentUserQueryKey, session.user);
      void queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
    },
  });
}

export { currentUserQueryKey, useLogin, useRegister };
