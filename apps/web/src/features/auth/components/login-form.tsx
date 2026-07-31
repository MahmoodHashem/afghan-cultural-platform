"use client";

import { ArrowLeftIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthDivider } from "@/features/auth/components/auth-divider";
import { FieldError } from "@/features/auth/components/field-error";
import { OAuthButtons } from "@/features/auth/components/oauth-buttons";
import { PasswordField } from "@/features/auth/components/password-field";
import { type LoginFormValues, loginSchema } from "@/features/auth/schemas/auth-schemas";
import { cn } from "@/lib/utils";

function LoginForm() {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onBlur",
  });

  function handleLoginSubmit(_values: LoginFormValues) {
    // TODO: Connect to the auth API integration boundary in the authentication integration step.
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(handleLoginSubmit)} noValidate>
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

      <Button type="submit" size="lg" className="h-12 w-full shadow-sm">
        <span>ورود به حساب کاربری</span>
        <ArrowLeftIcon className="size-5" aria-hidden="true" />
      </Button>

      <AuthDivider label="یا" />

      <OAuthButtons googleLabel="ورود با گوگل" facebookLabel="ورود با فیسبوک" />

      <p className="text-center text-[15px] text-muted-foreground">
        حساب کاربری ندارید؟{" "}
        <Link href="/register" className="font-semibold text-primary hover:text-primary-hover">
          ثبت‌نام کنید
        </Link>
      </p>
    </form>
  );
}

export { LoginForm };
