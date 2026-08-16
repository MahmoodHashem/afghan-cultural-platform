import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { RegisterForm } from "@/features/auth/components/register-form";
import { REGISTER_BACKGROUND_SRC } from "@/features/auth/constants/auth-assets";

export const metadata: Metadata = {
  title: "ایجاد حساب کاربری | میراث افغانستان",
  description: "ایجاد حساب کاربری در میراث افغانستان.",
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
        description="حساب بسازید و در گردآوری فرهنگ افغانستان سهم بگیرید."
      >
        <Suspense fallback={null}>
          <RegisterForm />
        </Suspense>
      </AuthCard>
    </AuthLayout>
  );
}
