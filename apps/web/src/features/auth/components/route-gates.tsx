"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { AuthLoadingState } from "@/features/auth/components/auth-loading-state";
import { ForbiddenState } from "@/features/auth/components/forbidden-state";
import { VerifiedEmailBanner } from "@/features/auth/components/verified-email-banner";
import { createLoginPath, getSafeRedirectPath } from "@/features/auth/utils/redirects";
import { type SafeUser, useAuthStore } from "@/stores/auth-store";

type RequireAuthProps = {
  children: ReactNode;
};

type RequireVerifiedEmailProps = {
  children: ReactNode;
};

type RequireRoleProps = {
  roles: SafeUser["role"][];
  children: ReactNode;
};

function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (status !== "unauthenticated") {
      return;
    }

    const nextPath = getSafeRedirectPath(pathname);
    const loginPath = createLoginPath(nextPath);

    router.replace(loginPath);
  }, [pathname, router, status]);

  if (status === "initializing") {
    return <AuthLoadingState />;
  }

  if (status === "unauthenticated") {
    return <AuthLoadingState />;
  }

  return children;
}

function RequireVerifiedEmail({ children }: RequireVerifiedEmailProps) {
  const user = useAuthStore((state) => state.user);

  if (!user?.emailVerified) {
    return (
      <section className="content-container py-10">
        <VerifiedEmailBanner />
      </section>
    );
  }

  return children;
}

function RequireRole({ roles, children }: RequireRoleProps) {
  const user = useAuthStore((state) => state.user);

  if (!user || !roles.includes(user.role)) {
    return <ForbiddenState />;
  }

  return children;
}

export { RequireAuth, RequireRole, RequireVerifiedEmail };
