import type { Metadata } from "next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { EmailVerificationCompletion } from "@/features/auth/components/email-verification-completion";

export const metadata: Metadata = {
  title: "تأیید ایمیل",
  description: "تأیید ایمیل حساب کاربری میراث افغانستان.",
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<EmailVerificationFallback />}>
      <EmailVerificationCompletion />
    </Suspense>
  );
}

function EmailVerificationFallback() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-5 sm:py-10">
      <div className="w-full max-w-lg space-y-5 bg-card p-4 sm:rounded-xl sm:border sm:border-border sm:p-8">
        <Skeleton className="mx-auto size-16 rounded-full" />
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="mx-auto h-5 w-64 max-w-full" />
      </div>
    </main>
  );
}
