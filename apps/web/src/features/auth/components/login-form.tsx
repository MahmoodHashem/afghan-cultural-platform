"use client";

import { ArrowLeftIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthDivider } from "@/features/auth/components/auth-divider";
import { FieldError } from "@/features/auth/components/field-error";
import { OAuthButtons } from "@/features/auth/components/oauth-buttons";
import { PasswordField } from "@/features/auth/components/password-field";
import { UnverifiedEmailNotice } from "@/features/auth/components/unverified-email-notice";
import { useLogin } from "@/features/auth/hooks/use-auth-mutations";
import { type LoginFormValues, loginSchema } from "@/features/auth/schemas/auth-schemas";
import { applyApiFieldErrors, getAuthFormErrorMessage } from "@/features/auth/utils/form-errors";
import { redirectToOAuthProvider } from "@/features/auth/utils/oauth-redirect";
import { createRegisterPath, getSafeRedirectPath } from "@/features/auth/utils/redirects";
import { cn } from "@/lib/utils";
import type { AuthSession } from "@/stores/auth-store";

type LoginFormProps = {
  embedded?: boolean;
  nextPath?: string;
  onAuthenticated?: (session: AuthSession) => void;
  onSwitchToRegister?: () => void;
};

function LoginForm({
  embedded = false,
  nextPath,
  onAuthenticated,
  onSwitchToRegister,
}: LoginFormProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLogin();
  const [showUnverifiedNotice, setShowUnverifiedNotice] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onBlur",
  });

  async function handleLoginSubmit(values: LoginFormValues) {
    setShowUnverifiedNotice(false);

    try {
      const session = await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });

      if (!session.user.emailVerified) {
        setShowUnverifiedNotice(true);
      }

      if (onAuthenticated) {
        onAuthenticated(session);
        return;
      }

      window.setTimeout(
        () => {
          router.replace(getSafeRedirectPath(nextPath ?? searchParams.get("next")));
        },
        session.user.emailVerified ? 0 : 900,
      );
    } catch (error) {
      applyApiFieldErrors<LoginFormValues>(error, setError, {
        email: "email",
        password: "password",
      });
      toast.error(getAuthFormErrorMessage(error));
    }
  }

  return (
    <form
      className={cn(embedded ? "space-y-4" : "space-y-6")}
      onSubmit={handleSubmit(handleLoginSubmit)}
      noValidate
    >
      {showUnverifiedNotice ? <UnverifiedEmailNotice /> : null}

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="login-email" className="text-form-label">
            ایمیل
          </Label>
          <div className="relative">
            <EnvelopeIcon
              className="pointer-events-none absolute top-1/2 inset-e-3 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="login-email"
              type="email"
              dir="ltr"
              autoComplete="email"
              placeholder="email@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "login-email-error" : undefined}
              className={cn("h-11 pr-3 pl-10 text-left", errors.email && "border-destructive")}
              {...register("email")}
            />
          </div>
          <FieldError id="login-email-error" message={errors.email?.message} />
        </div>

        <PasswordField
          id="login-password"
          label="رمز عبور"
          placeholder="رمز عبور خود را وارد کنید"
          autoComplete="current-password"
          registration={register("password")}
          error={errors.password?.message}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-[14px]">
        <Link href="/forgot-password" className="font-medium text-primary hover:text-primary-hover">
          رمز عبور را فراموش کرده‌اید؟
        </Link>
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full shadow-sm"
        disabled={loginMutation.isPending}
        aria-busy={loginMutation.isPending}
      >
        <span>{loginMutation.isPending ? "در حال ورود..." : "ورود"}</span>
        <ArrowLeftIcon className="size-5" aria-hidden="true" />
      </Button>

      <AuthDivider label="یا از یکی از این روش‌ها استفاده کنید" />

      <OAuthButtons
        googleLabel="ورود با گوگل"
        facebookLabel="ورود با فیسبوک"
        onGoogleClick={() =>
          redirectToOAuthProvider("google", nextPath ?? searchParams.get("next"))
        }
        onFacebookClick={() =>
          redirectToOAuthProvider("facebook", nextPath ?? searchParams.get("next"))
        }
      />

      <p className="text-center text-[15px] text-muted-foreground">
        حساب کاربری ندارید؟{" "}
        {embedded && onSwitchToRegister ? (
          <button
            type="button"
            className="font-semibold text-primary hover:text-primary-hover"
            onClick={onSwitchToRegister}
          >
            ثبت‌نام کنید
          </button>
        ) : (
          <Link
            href={createRegisterPath(nextPath ?? searchParams.get("next") ?? "/")}
            className="font-semibold text-primary hover:text-primary-hover"
          >
            ثبت‌نام کنید
          </Link>
        )}
      </p>
    </form>
  );
}

export { LoginForm };
