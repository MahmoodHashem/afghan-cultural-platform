"use client";

import { DirectionProvider } from "@base-ui/react/direction-provider";
import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";

/** Base UI reads direction from context (not the html `dir`), so RTL is set here for every primitive. */
function AppProviders({ children }: { children: ReactNode }) {
  return (
    <DirectionProvider direction="rtl">
      <QueryProvider>
        <AuthProvider>
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </AuthProvider>
        <Toaster toastOptions={{ closeButton: true }} />
      </QueryProvider>
    </DirectionProvider>
  );
}

export { AppProviders };
