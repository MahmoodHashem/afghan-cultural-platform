"use client";

import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AuthLogo } from "@/features/auth/components/auth-logo";
import { VerifiedEmailBanner } from "@/features/auth/components/verified-email-banner";
import { useVerifyEmail } from "@/features/auth/hooks/use-auth-mutations";
import { getAuthErrorMessage } from "@/features/auth/utils/auth-error-messages";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

type VerificationState =
  | { status: "processing" }
  | { status: "success" }
  | { status: "error"; message: string };

function EmailVerificationCompletion() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const verifyMutation = useVerifyEmail();
  const startedRef = useRef(false);
  const [verification, setVerification] = useState<VerificationState>({ status: "processing" });

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const token = searchParams.get("token")?.trim();

    if (!token) {
      setVerification({
        status: "error",
        message: "پیوند تأیید کامل نیست. از پروفایل خود یک پیوند تازه بگیرید.",
      });
      return;
    }

    verifyMutation
      .mutateAsync(token)
      .then(() => {
        setVerification({ status: "success" });
        router.replace("/verify-email", { scroll: false });
      })
      .catch((error: unknown) => {
        setVerification({ status: "error", message: getAuthErrorMessage(error) });
        router.replace("/verify-email", { scroll: false });
      });
  }, [router, searchParams, verifyMutation]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-5 sm:py-10">
      <Card className="w-full max-w-lg rounded-none border-0 bg-card shadow-none sm:rounded-xl sm:border sm:border-border sm:shadow-[0_2px_10px_rgba(0,0,0,.05)]">
        <CardContent className="space-y-6 p-4 text-center sm:space-y-7 sm:p-10">
          <AuthLogo priority />

          {verification.status === "processing" ? (
            <VerificationMessage
              icon={<ArrowPathIcon className="size-9 animate-spin" aria-hidden="true" />}
              title="در حال تأیید ایمیل"
              description="لطفاً چند لحظه صبر کنید."
            />
          ) : null}

          {verification.status === "success" ? (
            <>
              <VerificationMessage
                icon={<CheckCircleIcon className="size-10" aria-hidden="true" />}
                title="ایمیل شما تأیید شد"
                description="اکنون می‌توانید مطلب اضافه کنید، دیدگاه بنویسید و در تکمیل محتوای سایت سهم بگیرید."
                success
              />
              <Link href="/profile" className={cn(buttonVariants(), "w-full sm:w-auto")}>
                رفتن به پروفایل
              </Link>
            </>
          ) : null}

          {verification.status === "error" ? (
            <>
              <VerificationMessage
                icon={<ExclamationTriangleIcon className="size-9" aria-hidden="true" />}
                title="تأیید ایمیل انجام نشد"
                description={verification.message}
              />
              {user && !user.emailVerified ? <VerifiedEmailBanner email={user.email} /> : null}
              <Link
                href={user ? "/profile" : "/login"}
                className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
              >
                {user ? "بازگشت به پروفایل" : "ورود به حساب"}
              </Link>
            </>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}

function VerificationMessage({
  icon,
  title,
  description,
  success = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  success?: boolean;
}) {
  return (
    <section className="space-y-3" aria-live="polite">
      <span
        className={cn(
          "mx-auto flex size-16 items-center justify-center rounded-full bg-warning/10 text-warning",
          success && "bg-primary-light text-primary",
        )}
      >
        {icon}
      </span>
      <h1 className="text-[26px] font-bold leading-10 text-foreground">{title}</h1>
      <p className="text-[14px] leading-7 text-muted-foreground">{description}</p>
    </section>
  );
}

export { EmailVerificationCompletion };
