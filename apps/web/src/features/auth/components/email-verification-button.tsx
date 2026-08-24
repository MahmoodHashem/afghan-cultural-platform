"use client";

import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useResendEmailVerification } from "@/features/auth/hooks/use-auth-mutations";
import { getAuthErrorMessage } from "@/features/auth/utils/auth-error-messages";
import { cn } from "@/lib/utils";
import { formatPersianNumber } from "@/lib/utils/formatters";

type EmailVerificationButtonProps = {
  email: string;
  compact?: boolean;
  className?: string;
};

const RESEND_COOLDOWN_SECONDS = 60;

function EmailVerificationButton({
  email,
  compact = false,
  className,
}: EmailVerificationButtonProps) {
  const resendVerification = useResendEmailVerification();
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = window.setTimeout(
      () => setCooldownSeconds((current) => Math.max(0, current - 1)),
      1000,
    );

    return () => window.clearTimeout(timer);
  }, [cooldownSeconds]);

  function resend() {
    if (resendVerification.isPending || cooldownSeconds > 0) return;

    resendVerification.mutate(email, {
      onSuccess: () => {
        setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
        toast.success("پیوند تأیید فرستاده شد.", {
          description: "ایمیل خود را باز کنید و روی پیوند تأیید بزنید.",
        });
      },
      onError: (error) => toast.error(getAuthErrorMessage(error)),
    });
  }

  return (
    <Button
      type="button"
      variant={compact ? "ghost" : "outline"}
      size={compact ? "sm" : "default"}
      className={cn(compact && "text-primary hover:bg-primary-light hover:text-primary", className)}
      disabled={resendVerification.isPending || cooldownSeconds > 0}
      aria-live="polite"
      onClick={resend}
    >
      <EnvelopeIcon aria-hidden="true" />
      {resendVerification.isPending
        ? "در حال ارسال..."
        : cooldownSeconds > 0
          ? `ارسال دوباره تا ${formatPersianNumber(cooldownSeconds)} ثانیه`
          : compact
            ? "تأیید ایمیل"
            : "فرستادن ایمیل تأیید"}
    </Button>
  );
}

export { EmailVerificationButton, RESEND_COOLDOWN_SECONDS };
