import type { ReactNode } from "react";

import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";

type AuthLayoutProps = {
  backgroundSrc: string;
  variant: "login" | "register";
  children: ReactNode;
};

function AuthLayout({ backgroundSrc, variant, children }: AuthLayoutProps) {
  return (
    <main className="min-h-svh bg-background">
      <div className="grid min-h-svh w-full items-stretch lg:grid-cols-[minmax(0,0.95fr)_minmax(520px,1.05fr)] lg:[direction:ltr]">
        <AuthBrandPanel
          backgroundSrc={backgroundSrc}
          variant={variant}
          className="min-h-svh rounded-none [direction:rtl]"
        />
        <section className="flex min-w-0 items-center justify-center px-5 py-8 [direction:rtl] sm:px-8 lg:px-10 lg:py-10">
          {children}
        </section>
      </div>
    </main>
  );
}

export { AuthLayout };
