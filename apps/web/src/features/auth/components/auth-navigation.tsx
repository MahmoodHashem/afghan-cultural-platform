"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/use-auth-mutations";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

function AuthNavigation() {
  const { status, user } = useAuthStore((state) => ({
    status: state.status,
    user: state.user,
  }));
  const logoutMutation = useLogout();

  if (status === "initializing") {
    return <div className="h-10 w-32 animate-pulse rounded bg-muted" aria-hidden="true" />;
  }

  if (status !== "authenticated" || !user) {
    return (
      <nav className="flex items-center gap-2" aria-label="ناوبری حساب کاربری">
        <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }))}>
          ورود
        </Link>
        <Link href="/register" className={cn(buttonVariants())}>
          ثبت‌نام
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="ناوبری حساب کاربری">
      <Link href="/profile" className={cn(buttonVariants({ variant: "ghost" }))}>
        پروفایل
      </Link>
      {user.role === "MODERATOR" || user.role === "ADMIN" ? (
        <Link href="/moderator" className={cn(buttonVariants({ variant: "ghost" }))}>
          مدیریت محتوا
        </Link>
      ) : null}
      {user.role === "ADMIN" ? (
        <Link href="/admin" className={cn(buttonVariants({ variant: "ghost" }))}>
          مدیریت سامانه
        </Link>
      ) : null}
      {!user.emailVerified ? (
        <span className="rounded-full bg-warning/10 px-3 py-1 text-[13px] text-warning">
          ایمیل تأیید نشده
        </span>
      ) : null}
      <Button
        type="button"
        variant="outline"
        disabled={logoutMutation.isPending}
        onClick={() => logoutMutation.mutate()}
      >
        خروج
      </Button>
    </nav>
  );
}

export { AuthNavigation };
