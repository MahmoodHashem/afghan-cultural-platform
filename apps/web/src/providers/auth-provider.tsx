"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { bootstrapAuthSession, configureAuthCoordinator } from "@/lib/auth/auth-coordinator";
import { clearPrivateAuthQueries, setCurrentUserQuery } from "@/lib/auth/auth-query";

function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    configureAuthCoordinator({
      onAuthCleared: () => {
        clearPrivateAuthQueries(queryClient);
      },
      onAuthRestored: (session) => {
        setCurrentUserQuery(queryClient, session.user);
      },
    });

    void bootstrapAuthSession();
  }, [queryClient]);

  return children;
}

export { AuthProvider };
