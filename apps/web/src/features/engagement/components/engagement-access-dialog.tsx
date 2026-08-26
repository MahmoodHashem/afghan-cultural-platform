"use client";

import {
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { motion, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EmailVerificationButton } from "@/features/auth/components/email-verification-button";
import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";
import type { EngagementAction } from "@/features/engagement/types/engagement-access";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { SafeUser } from "@/stores/auth-store";

type AccessReason = "unauthenticated" | "unverified" | "suspended";
type AuthMode = "login" | "register";

const actionContent: Record<
  EngagementAction,
  { title: string, guest: string; unverified: string }
> = {
  like: {
    title: "پسندیدن",
    guest: "برای پسندیدن این مطلب لطفا وارد حساب خود شوید.",
    unverified: "برای پسندیدن مطلب، لطفا ابتدا ایمیل خود را تأیید کنید.",
  },
  bookmark: {
    title: "دخیره کردن",
    guest: "برای ذخیره‌کردن این مطلب لطفا وارد حساب خود شوید.",
    unverified: "برای ذخیره‌کردن مطلب، ابتدا ایمیل خود را تأیید کنید.",
  },
  comment: {
    title: "دیدگاه",
    guest: "برای ثبت دیدگاه وارد شوید،لطفا وارد حساب خود شوید.",
    unverified: "متن شما حفظ می‌شود؛ برای ثبت آن ابتدا ایمیل خود را تأیید کنید.",
  },
  commentLike: {
    title: "پسندیدن دیدگاه",
    guest: "برای پسندیدن این دیدگاه لطفا وارد حساب خود شوید.",
    unverified: "برای پسندیدن دیدگاه، لطفا ابتدا ایمیل خود را تأیید کنید.",
  },
  report: {
    title: "گزارش",
    guest: "برای فرستادن گزارش وارد شوید.",
    unverified: "برای فرستادن گزارش، ابتدا لطفا ایمیل خود را تأیید کنید.",
  },
  correction: {
    title: "اصلاح",
    guest: "برای پیشنهاد اصلاح وارد شوید.",
    unverified: "برای پیشنهاد اصلاح، ابتدا لطفا ایمیل خود را تأیید کنید.",
  },
};

function EngagementAccessDialog({
  action,
  reason,
  user,
  returnPath,
  open,
  onOpenChange,
}: {
  action: EngagementAction;
  reason: AccessReason;
  user: SafeUser | null;
  returnPath: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const content = actionContent[action];

  useEffect(() => {
    if (!open) setAuthMode("login");
  }, [open]);

  const panel = (
    <AccessPanel
      content={content}
      reason={reason}
      user={user}
      returnPath={returnPath}
      authMode={authMode}
      onAuthModeChange={setAuthMode}
      onClose={() => onOpenChange(false)}
    />
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          dir="rtl"
          className="max-h-[92svh] overflow-y-auto rounded-t-2xl border-border p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{content.title}</SheetTitle>
            <SheetDescription>{content.guest}</SheetDescription>
          </SheetHeader>
          {panel}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[95svh] gap-0 overflow-y-auto p-0 sm:max-w-md"
        dir="rtl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>{content.guest}</DialogDescription>
        </DialogHeader>
        {panel}
      </DialogContent>
    </Dialog>
  );
}

function AccessPanel({
  content,
  reason,
  user,
  returnPath,
  authMode,
  onAuthModeChange,
  onClose,
}: {
  content: (typeof actionContent)[EngagementAction];
  reason: AccessReason;
  user: SafeUser | null;
  returnPath: string;
  authMode: AuthMode;
  onAuthModeChange: (mode: AuthMode) => void;
  onClose: () => void;
}) {
  const suspended = reason === "suspended";
  const reducedMotion = Boolean(useReducedMotion());
  const transition = getAuthTransition(reducedMotion);

  return (
    <div className="bg-card">
      <header className="px-5 pt-6 pb-4 text-start sm:px-6">


        <p className="mt-1 text-[13px] leading-6 text-muted-foreground ">
          {suspended
            ? "در حال حاضر امکان انجام این کار وجود ندارد."
            : reason === "unauthenticated"
              ? content.guest
              : content.unverified}
        </p>
      </header>

      {reason === "unauthenticated" ? (
        <div className="border-t border-border px-5 pt-4 pb-6 sm:px-6">
          <div
            role="tablist"
            className="relative mb-5 grid grid-cols-2 rounded-lg bg-muted p-1"
            aria-label="ورود یا ثبت‌نام"
          >
            <motion.span
              aria-hidden="true"
              className="absolute top-1 right-1 bottom-1 w-[calc(50%_-_4px)] rounded-md bg-card shadow-sm"
              animate={{ x: authMode === "register" ? "-100%" : "0" }}
              transition={transition}
            />
            <AuthTab active={authMode === "login"} onClick={() => onAuthModeChange("login")}>
              ورود
            </AuthTab>
            <AuthTab active={authMode === "register"} onClick={() => onAuthModeChange("register")}>
              ثبت‌نام
            </AuthTab>
          </div>

          <SlidingAuthForms
            mode={authMode}
            returnPath={returnPath}
            reducedMotion={reducedMotion}
            onModeChange={onAuthModeChange}
          />
        </div>
      ) : null}

      {reason === "unverified" && user ? (
        <div className="space-y-4 border-t border-border px-5 py-5 sm:px-6">
          <p dir="ltr" className="truncate text-start text-[13px] text-muted-foreground">
            {user.email}
          </p>
          <EmailVerificationButton email={user.email} className="w-full" />
          <p className="flex items-center gap-2 text-[12px] leading-6 text-muted-foreground">
            <EnvelopeIcon className="size-4 shrink-0" aria-hidden="true" />
            پس از تأیید ایمیل به همین صفحه برگردید.
          </p>
        </div>
      ) : null}

      {suspended ? (
        <div className="border-t border-border px-5 py-4 sm:px-6">
          <Button type="button" variant="outline" className="w-full" onClick={onClose}>
            بستن
          </Button>
        </div>
      ) : null}
    </div>
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

function SlidingAuthForms({
  mode,
  returnPath,
  reducedMotion,
  onModeChange,
}: {
  mode: AuthMode;
  returnPath: string;
  reducedMotion: boolean;
  onModeChange: (mode: AuthMode) => void;
}) {
  const loginRef = useRef<HTMLDivElement | null>(null);
  const registerRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number>();
  const transition = getAuthTransition(reducedMotion);

  useLayoutEffect(() => {
    const content = mode === "login" ? loginRef.current : registerRef.current;
    if (!content) return;

    const updateHeight = () => setHeight(content.getBoundingClientRect().height);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(content);

    return () => observer.disconnect();
  }, [mode]);

  return (
    <motion.div
      initial={false}
      animate={height === undefined ? undefined : { height }}
      className="overflow-hidden"
      transition={transition}
    >
      <motion.div
        className="flex w-[200%] items-start"
        initial={false}
        animate={{ x: mode === "register" ? "50%" : "0" }}
        transition={transition}
      >
        <div
          ref={loginRef}
          className={cn(
            "w-1/2 shrink-0",
            mode !== "login" && "h-0 pointer-events-none",
          )}
          aria-hidden={mode !== "login"}
          inert={mode !== "login"}
        >
          <LoginForm
            embedded
            nextPath={returnPath}
            onAuthenticated={() => undefined}
            onSwitchToRegister={() => onModeChange("register")}
          />
        </div>

        <div
          ref={registerRef}
          className={cn(
            "w-1/2 shrink-0",
            mode !== "register" && "h-0 pointer-events-none",
          )}
          aria-hidden={mode !== "register"}
          inert={mode !== "register"}
        >
          <RegisterForm
            embedded
            nextPath={returnPath}
            onAuthenticated={() => undefined}
            onSwitchToLogin={() => onModeChange("login")}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

function getAuthTransition(reducedMotion: boolean) {
  return reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 360, damping: 36, mass: 0.85 };
}

export type { AccessReason };
export { EngagementAccessDialog };
