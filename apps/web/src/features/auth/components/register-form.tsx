"use client";

import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { ArrowLeftIcon, EnvelopeIcon, UserIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthDivider } from "@/features/auth/components/auth-divider";
import { FieldError } from "@/features/auth/components/field-error";
import { OAuthButtons } from "@/features/auth/components/oauth-buttons";
import { PasswordField } from "@/features/auth/components/password-field";
import { UnverifiedEmailNotice } from "@/features/auth/components/unverified-email-notice";
import { useRegister } from "@/features/auth/hooks/use-auth-mutations";
import { type RegisterFormValues, registerSchema } from "@/features/auth/schemas/auth-schemas";
import { applyApiFieldErrors, getAuthFormErrorMessage } from "@/features/auth/utils/form-errors";
import { redirectToOAuthProvider } from "@/features/auth/utils/oauth-redirect";
import { getSafeRedirectPath } from "@/features/auth/utils/redirects";
import { isApiError } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registerMutation = useRegister();
  const [showUnverifiedNotice, setShowUnverifiedNotice] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: false,
    },
    mode: "onBlur",
  });

  async function handleRegisterSubmit(values: RegisterFormValues) {
    setShowUnverifiedNotice(false);

    try {
      const session = await registerMutation.mutateAsync({
        displayName: values.displayName,
        email: values.email,
        password: values.password,
      });

      if (!session.user.emailVerified) {
        setShowUnverifiedNotice(true);
      }

      window.setTimeout(
        () => {
          router.replace(getSafeRedirectPath(searchParams.get("next")));
        },
        session.user.emailVerified ? 0 : 900,
      );
    } catch (error) {
      if (isApiError(error) && error.code === "AUTH_EMAIL_ALREADY_REGISTERED") {
        setError(
          "email",
          {
            type: "server",
            message: "این ایمیل قبلاً ثبت شده است.",
          },
          {
            shouldFocus: true,
          },
        );
      } else {
        applyApiFieldErrors<RegisterFormValues>(error, setError, {
          displayName: "displayName",
          email: "email",
          password: "password",
        });
      }

      toast.error(getAuthFormErrorMessage(error));
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(handleRegisterSubmit)} noValidate>
      {showUnverifiedNotice ? <UnverifiedEmailNotice /> : null}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="register-name" className="text-form-label">
            نام و نام خانوادگی
          </Label>
          <div className="relative">
            <UserIcon
              className="pointer-events-none absolute top-1/2 inset-e-3 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="register-name"
              type="text"
              autoComplete="name"
              placeholder="نام و نام خانوادگی خود را وارد کنید"
              aria-invalid={Boolean(errors.displayName)}
              aria-describedby={errors.displayName ? "register-name-error" : undefined}
              className={cn("h-11 pe-10", errors.displayName && "border-destructive")}
              {...register("displayName")}
            />
          </div>
          <FieldError id="register-name-error" message={errors.displayName?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-email" className="text-form-label">
            ایمیل
          </Label>
          <div className="relative">
            <EnvelopeIcon
              className="pointer-events-none absolute top-1/2 inset-e-3 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="register-email"
              type="email"
              dir="ltr"
              autoComplete="email"
              placeholder="email@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "register-email-error" : undefined}
              className={cn("h-11 pr-3 pl-10 text-left", errors.email && "border-destructive")}
              {...register("email")}
            />
          </div>
          <FieldError id="register-email-error" message={errors.email?.message} />
        </div>

        <PasswordField
          id="register-password"
          label="رمز عبور"
          placeholder="رمز عبور خود را وارد کنید"
          autoComplete="new-password"
          registration={register("password")}
          error={errors.password?.message}
        />

        <PasswordField
          id="register-confirm-password"
          label="تکرار رمز عبور"
          placeholder="رمز عبور را دوباره وارد کنید"
          autoComplete="new-password"
          registration={register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2 text-[14px] leading-7">
          <Checkbox
            id="accepted-terms"
            className="mt-1"
            aria-invalid={Boolean(errors.acceptedTerms)}
            aria-describedby={errors.acceptedTerms ? "accepted-terms-error" : undefined}
            {...register("acceptedTerms")}
          />
          <span>
            <Link href="/terms" className="font-medium text-primary hover:text-primary-hover">
              شرایط استفاده
            </Link>{" "}
            <label htmlFor="accepted-terms" className="cursor-pointer">
              و
            </label>{" "}
            <Link href="/privacy" className="font-medium text-primary hover:text-primary-hover">
              سیاست حفظ حریم خصوصی
            </Link>{" "}
            <label htmlFor="accepted-terms" className="cursor-pointer">
              را می‌پذیرم.
            </label>
          </span>
        </div>
        <FieldError id="accepted-terms-error" message={errors.acceptedTerms?.message} />
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full shadow-sm"
        disabled={registerMutation.isPending}
        aria-busy={registerMutation.isPending}
      >
        <span>{registerMutation.isPending ? "در حال ثبت‌نام..." : "ثبت‌نام"}</span>
        {registerMutation.isPending ? (
          <ArrowPathIcon className="animate-spin" />
        ) : (
          <ArrowLeftIcon className="size-5" aria-hidden="true" />
        )}
      </Button>

      <AuthDivider label="یا از یکی از این روش‌ها استفاده کنید" />

      <OAuthButtons
        googleLabel="ثبت‌نام با گوگل"
        facebookLabel="ثبت‌نام با فیسبوک"
        onGoogleClick={() => redirectToOAuthProvider("google", searchParams.get("next"))}
        onFacebookClick={() => redirectToOAuthProvider("facebook", searchParams.get("next"))}
      />

      <p className="text-center text-[15px] text-muted-foreground">
        قبلاً حساب کاربری دارید؟{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-primary-hover">
          ورود به حساب
        </Link>
      </p>
    </form>
  );
}

export { RegisterForm };
