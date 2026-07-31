import type { Metadata } from "next";

import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { LoginForm } from "@/features/auth/components/login-form";
import { LOGIN_BACKGROUND_SRC } from "@/features/auth/constants/auth-assets";

export const metadata: Metadata = {
  title: "ورود به حساب | میراث افغانستان",
  description: "ورود به حساب کاربری میراث افغانستان برای ادامه یادگیری و مشارکت فرهنگی.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <AuthLayout backgroundSrc={LOGIN_BACKGROUND_SRC} variant="login">
      <AuthCard
        title="دوباره خوش آمدید"
        description="برای ادامه مسیر یادگیری و کاوش در میراث افغانستان، وارد شوید."
      >
        <LoginForm />
      </AuthCard>
    </AuthLayout>
  );
}
