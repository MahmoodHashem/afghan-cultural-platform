"use client";

import { EnvelopeIcon } from "@heroicons/react/24/outline";

import { EmailVerificationButton } from "@/features/auth/components/email-verification-button";
import { useAuthStore } from "@/stores/auth-store";

type VerifiedEmailBannerProps = {
  email?: string;
};

function VerifiedEmailBanner({ email }: VerifiedEmailBannerProps) {
  const currentUser = useAuthStore((state) => state.user);
  const emailAddress = email ?? currentUser?.email;

  return (
    <aside className="rounded-card border border-saffron/30 bg-tint-sand px-4 py-4 text-[14px] leading-[1.9] text-ink sm:flex sm:items-center sm:justify-between sm:gap-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[12px_12px_12px_4px] bg-surface text-saffron">
          <EnvelopeIcon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-bold text-ink">ایمیل شما هنوز تأیید نشده است.</p>
          <p className="mt-0.5 text-copy">
            برای افزایش امنیت حساب و بازیابی آسان‌تر آن، ایمیل خود را تأیید کنید.
          </p>
          {emailAddress ? (
            <p className="mt-1 text-[12px] text-faint" dir="ltr">
              {emailAddress}
            </p>
          ) : null}
        </div>
      </div>

      {emailAddress ? (
        <div className="mt-4 shrink-0 sm:mt-0">
          <EmailVerificationButton email={emailAddress} />
        </div>
      ) : null}
    </aside>
  );
}

export { VerifiedEmailBanner };
