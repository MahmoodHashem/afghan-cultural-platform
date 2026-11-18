import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { ReactNode } from "react";

import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";

type AuthLayoutProps = {
  backgroundSrc: string;
  variant: "login" | "register";
  children: ReactNode;
};

/**
 * Sign-in and sign-up shell: one large speech-bubble card split into the form (start side) and an
 * illustrated panel (end side, from 1024px). Below that width the form stands alone on paper.
 */
function AuthLayout({ backgroundSrc, variant, children }: AuthLayoutProps) {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-paper">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -start-[0.05em] -bottom-[0.3em] -z-10 hidden font-calli text-[260px] leading-none text-ink opacity-[0.04] select-none lg:block"
      >
        میراث
      </span>

      <div className="mx-auto flex min-h-dvh w-full max-w-290 flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8 lg:py-10">
        <Link
          href="/"
          className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full px-1 py-1 text-[13px] font-bold text-copy transition-colors hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-ring"
        >
          <ArrowRightIcon className="size-4" aria-hidden="true" />
          بازگشت به خانه
        </Link>

        <div className="grid flex-1 items-stretch overflow-hidden sm:rounded-[32px_32px_32px_10px] sm:border sm:border-line-soft sm:bg-surface sm:shadow-lift lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <section className="flex min-w-0 items-start justify-center overflow-y-auto overscroll-contain py-2 sm:items-center sm:px-8 sm:py-10 lg:px-12">
            {children}
          </section>
          <AuthBrandPanel backgroundSrc={backgroundSrc} variant={variant} />
        </div>
      </div>
    </main>
  );
}

export { AuthLayout };
