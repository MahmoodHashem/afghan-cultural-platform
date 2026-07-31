import type { Metadata } from "next";

import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { RegisterForm } from "@/features/auth/components/register-form";
import { REGISTER_BACKGROUND_SRC } from "@/features/auth/constants/auth-assets";

export const metadata: Metadata = {
  title: "ایجاد حساب کاربری | میراث افغانستان",
  description: "ایجاد حساب کاربری در میراث افغانستان برای همراهی با جامعه فرهنگی فارسی‌زبان.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return (
    <AuthLayout backgroundSrc={REGISTER_BACKGROUND_SRC} variant="register">
      <AuthCard
        title="ایجاد حساب کاربری"
        description="به جمع علاقه‌مندان فرهنگ و دانش افغانستان بپیوندید."
      >
        <RegisterForm />
      </AuthCard>
    </AuthLayout>
  );
}
