"use client";

import { EnvelopeIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { motion, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useState } from "react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { EmailVerificationButton } from "@/features/auth/components/email-verification-button";
import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";
import { cn } from "@/lib/utils";
import type { AuthSession, SafeUser } from "@/stores/auth-store";

type ShellAuthReason = "unauthenticated" | "unverified" | "suspended";
type AuthMode = "login" | "register";

function MobileShellAuthDrawer({
  open,
  onOpenChange,
  title,
  description,
  returnPath,
  reason,
  user,
  onAuthenticated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  returnPath: string;
  reason: ShellAuthReason;
  user: SafeUser | null;
  onAuthenticated: (session: AuthSession) => void;
}) {
  const [mode, setMode] = useState<AuthMode>("login");
  const reducedMotion = Boolean(useReducedMotion());

  useEffect(() => {
    if (!open) setMode("login");
  }, [open]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent
        dir="rtl"
        className="max-h-[92dvh] overflow-hidden border-border p-0 [overscroll-behavior-block:contain]"
      >
        <DrawerHeader className="border-b border-border px-5 pt-3 pb-4 text-start">
          <DrawerTitle className="text-[18px] font-bold">{title}</DrawerTitle>
          <DrawerDescription className="leading-6">{description}</DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] [scroll-padding-bottom:2rem]">
          {reason === "unauthenticated" ? (
            <>
              <div
                role="tablist"
                aria-label="ورود یا ثبت‌نام"
                className="relative mb-5 grid grid-cols-2 rounded-lg bg-muted p-1"
              >
                <motion.span
                  aria-hidden="true"
                  className="absolute top-1 right-1 bottom-1 w-[calc(50%_-_4px)] rounded-md bg-card shadow-sm"
                  animate={{ x: mode === "register" ? "-100%" : "0" }}
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 360, damping: 36, mass: 0.85 }
                  }
                />
                <AuthTab active={mode === "login"} onClick={() => setMode("login")}>
                  ورود
                </AuthTab>
                <AuthTab active={mode === "register"} onClick={() => setMode("register")}>
                  ثبت‌نام
                </AuthTab>
              </div>

              {mode === "login" ? (
                <LoginForm
                  embedded
                  nextPath={returnPath}
                  onAuthenticated={onAuthenticated}
                  onSwitchToRegister={() => setMode("register")}
                />
              ) : (
                <RegisterForm
                  embedded
                  nextPath={returnPath}
                  onAuthenticated={onAuthenticated}
                  onSwitchToLogin={() => setMode("login")}
                />
              )}
            </>
          ) : null}

          {reason === "unverified" && user ? (
            <div className="space-y-4">
              <p dir="ltr" className="truncate text-start text-[13px] text-muted-foreground">
                {user.email}
              </p>
              <EmailVerificationButton email={user.email} className="w-full" />
              <p className="flex items-center gap-2 text-[12px] leading-6 text-muted-foreground">
                <EnvelopeIcon className="size-4 shrink-0" aria-hidden="true" />
                پس از تأیید ایمیل دوباره این کار را انجام دهید.
              </p>
            </div>
          ) : null}

          {reason === "suspended" ? (
            <p className="flex items-start gap-2 rounded-lg bg-destructive/8 p-4 text-[13px] leading-7 text-destructive">
              <ExclamationTriangleIcon className="mt-1 size-5 shrink-0" aria-hidden="true" />
              در حال حاضر امکان انجام این کار با این حساب وجود ندارد.
            </p>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function AuthTab({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className="relative z-10 flex h-9 items-center justify-center rounded-md px-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40"
      onClick={onClick}
    >
      <span className={cn(active ? "text-foreground" : "text-muted-foreground")}>{children}</span>
    </button>
  );
}

export type { ShellAuthReason };
export { MobileShellAuthDrawer };
