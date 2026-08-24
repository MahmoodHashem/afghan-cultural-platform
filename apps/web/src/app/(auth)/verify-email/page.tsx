import type { Metadata } from "next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { EmailVerificationCompletion } from "@/features/auth/components/email-verification-completion";

export const metadata: Metadata = {
  title: "تأیید ایمیل | میراث افغانستان",
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
    <main className="flex min-h-svh items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-lg space-y-5 rounded-xl border border-border bg-card p-8">
        <Skeleton className="mx-auto size-16 rounded-full" />
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="mx-auto h-5 w-64 max-w-full" />
      </div>
    </main>
  );
}
