"use client";

import { ArrowLeftIcon, EnvelopeIcon, UserIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthDivider } from "@/features/auth/components/auth-divider";
import { FieldError } from "@/features/auth/components/field-error";
import { OAuthButtons } from "@/features/auth/components/oauth-buttons";
import { PasswordField } from "@/features/auth/components/password-field";
import { type RegisterFormValues, registerSchema } from "@/features/auth/schemas/auth-schemas";
import { cn } from "@/lib/utils";

function RegisterForm() {
  const {
    formState: { errors },
    handleSubmit,
    register,
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

  function handleRegisterSubmit(_values: RegisterFormValues) {
    // TODO: Connect to the auth API integration boundary in the authentication integration step.
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(handleRegisterSubmit)} noValidate>
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
            <label htmlFor="accepted-terms" className="cursor-pointer">
              من با
            </label>{" "}
            <Link href="/terms" className="font-medium text-primary hover:text-primary-hover">
              شرایط استفاده
            </Link>{" "}
            <label htmlFor="accepted-terms" className="cursor-pointer">
              و
            </label>{" "}
            <Link href="/privacy" className="font-medium text-primary hover:text-primary-hover">
              سیاست حریم خصوصی
            </Link>{" "}
            <label htmlFor="accepted-terms" className="cursor-pointer">
              موافقم.
            </label>
          </span>
        </div>
        <FieldError id="accepted-terms-error" message={errors.acceptedTerms?.message} />
      </div>

      <Button type="submit" size="lg" className="h-12 w-full shadow-sm">
        <span>ثبت‌نام</span>
        <ArrowLeftIcon className="size-5" aria-hidden="true" />
      </Button>

      <AuthDivider label="یا با حساب خود ادامه دهید" />

      <OAuthButtons googleLabel="ثبت‌نام با گوگل" facebookLabel="ثبت‌نام با فیسبوک" />

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
