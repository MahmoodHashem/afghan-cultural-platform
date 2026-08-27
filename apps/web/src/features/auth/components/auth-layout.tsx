import type { ReactNode } from "react";

import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";

type AuthLayoutProps = {
  backgroundSrc: string;
  variant: "login" | "register";
  children: ReactNode;
};

function AuthLayout({ backgroundSrc, variant, children }: AuthLayoutProps) {
  return (
    <main className="min-h-dvh bg-background">
      <div className="grid min-h-dvh w-full items-stretch lg:grid-cols-[minmax(0,0.95fr)_minmax(520px,1.05fr)] lg:[direction:ltr]">
        <AuthBrandPanel
          backgroundSrc={backgroundSrc}
          variant={variant}
          className="min-h-svh rounded-none [direction:rtl]"
        />
        <section className="flex min-h-dvh min-w-0 items-start justify-center overflow-y-auto overscroll-contain px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] [direction:rtl] sm:items-center sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          {children}
        </section>
      </div>
    </main>
  );
}

export { AuthLayout };
