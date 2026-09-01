import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { LoginForm } from "@/features/auth/components/login-form";
import { LOGIN_BACKGROUND_SRC } from "@/features/auth/constants/auth-assets";

export const metadata: Metadata = {
  title: "ورود به حساب",
  description: "ورود به حساب کاربری میراث افغانستان.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <AuthLayout backgroundSrc={LOGIN_BACKGROUND_SRC} variant="login">
      <AuthCard title="خوش آمدید" description="برای ادامه، وارد حساب خود شوید.">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </AuthCard>
    </AuthLayout>
  );
}
