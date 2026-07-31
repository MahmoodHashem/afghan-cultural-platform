"use client";

import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { useRefreshAuthSession } from "@/features/auth/hooks/use-auth-mutations";
import { getAuthErrorMessageByCode } from "@/features/auth/utils/auth-error-messages";
import { getSafeRedirectPath } from "@/features/auth/utils/redirects";
import { isApiError } from "@/lib/api/api-error";

function OAuthCallbackCompletion() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshMutation = useRefreshAuthSession();
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    if (hasCompletedRef.current) {
      return;
    }

    hasCompletedRef.current = true;

    const nextPath = getSafeRedirectPath(searchParams.get("next"));
    const errorCode = normalizeOAuthErrorCode(searchParams.get("error"));

    if (errorCode) {
      toast.error(getAuthErrorMessageByCode(errorCode));
      router.replace(createLoginRedirectPath(nextPath));
      return;
    }

    refreshMutation.mutate(undefined, {
      onSuccess: (session) => {
        if (!session.user.emailVerified) {
          toast.message("ایمیل شما هنوز تأیید نشده است.", {
            description: "برای برخی مشارکت‌ها بعداً به تأیید ایمیل نیاز دارید.",
          });
        }

        router.replace(nextPath);
      },
      onError: (error) => {
        const message = isApiError(error)
          ? getAuthErrorMessageByCode(error.code, error.requestId)
          : getAuthErrorMessageByCode("AUTH_OAUTH_FAILED");

        toast.error(message);
        router.replace(createLoginRedirectPath(nextPath));
      },
    });
  }, [refreshMutation, router, searchParams]);

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6 py-10">
      <section
        className="flex w-full max-w-sm flex-col items-center rounded-card border bg-card px-6 py-8 text-center shadow-sm"
        aria-live="polite"
      >
        <ArrowPathIcon className="mb-4 size-8 animate-spin text-primary" aria-hidden="true" />
        <h1 className="text-card-title text-foreground">در حال تکمیل ورود</h1>
        <p className="mt-2 text-[15px] leading-7 text-muted-foreground">
          لطفاً چند لحظه صبر کنید تا حساب شما آماده شود.
        </p>
      </section>
    </main>
  );
}

function normalizeOAuthErrorCode(error: string | null) {
  if (!error) {
    return null;
  }

  if (error === "access_denied" || error === "cancelled") {
    return "OAUTH_CANCELLED";
  }

  return error;
}

function createLoginRedirectPath(nextPath: string) {
  const loginPath = new URLSearchParams();

  if (nextPath !== "/") {
    loginPath.set("next", nextPath);
  }

  const query = loginPath.toString();

  return query ? `/login?${query}` : "/login";
}

export { OAuthCallbackCompletion };
