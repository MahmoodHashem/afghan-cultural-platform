"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";

import { createLoginPath } from "@/features/auth/utils/redirects";
import { useAuthStore } from "@/stores/auth-store";

type EngagementAction = "like" | "bookmark" | "comment" | "report" | "correction";

const verificationMessages: Record<EngagementAction, string> = {
  like: "برای پسندیدن مطلب باید ایمیل خود را تأیید کنید.",
  bookmark: "برای ذخیره‌کردن مطلب باید ایمیل خود را تأیید کنید.",
  comment: "برای نوشتن دیدگاه باید ایمیل خود را تأیید کنید.",
  report: "برای فرستادن گزارش باید ایمیل خود را تأیید کنید.",
  correction: "برای پیشنهاد اصلاح باید ایمیل خود را تأیید کنید.",
};

function useEngagementAccess() {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  const ensureVerifiedAccess = useCallback(
    (action: EngagementAction) => {
      if (status === "initializing") {
        return false;
      }

      if (status !== "authenticated" || !user) {
        const currentPath = `${window.location.pathname}${window.location.search}`;
        router.push(createLoginPath(currentPath));
        return false;
      }

      if (user.status === "SUSPENDED") {
        toast.error("این حساب موقتاً تعلیق شده است.");
        return false;
      }

      if (!user.emailVerified) {
        toast.warning(verificationMessages[action]);
        return false;
      }

      return true;
    },
    [router, status, user],
  );

  return {
    status,
    user,
    isAuthenticated: status === "authenticated" && Boolean(user),
    canContribute:
      status === "authenticated" && user?.status === "ACTIVE" && Boolean(user.emailVerified),
    ensureVerifiedAccess,
  };
}

export { useEngagementAccess };
