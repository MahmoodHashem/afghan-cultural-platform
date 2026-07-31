import { create } from "zustand";

type AuthStatus = "initializing" | "authenticated" | "unauthenticated";

type SafeUser = {
  id: string;
  email: string;
  displayName: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  status: string;
  emailVerified: boolean;
};

type AuthSession = {
  accessToken: string;
  user: SafeUser;
};

type AuthState = {
  status: AuthStatus;
  accessToken: string | null;
  user: SafeUser | null;
  setInitializing: () => void;
  setAuthenticated: (session: AuthSession) => void;
  setUnauthenticated: () => void;
  updateUser: (user: SafeUser) => void;
};

const useAuthStore = create<AuthState>((set) => ({
  status: "initializing",
  accessToken: null,
  user: null,
  setInitializing: () =>
    set({
      status: "initializing",
      accessToken: null,
      user: null,
    }),
  setAuthenticated: ({ accessToken, user }) =>
    set({
      status: "authenticated",
      accessToken,
      user,
    }),
  setUnauthenticated: () =>
    set({
      status: "unauthenticated",
      accessToken: null,
      user: null,
    }),
  updateUser: (user) => set({ user }),
}));

function getAccessToken() {
  return useAuthStore.getState().accessToken;
}

export type { AuthSession, AuthState, AuthStatus, SafeUser };
export { getAccessToken, useAuthStore };
