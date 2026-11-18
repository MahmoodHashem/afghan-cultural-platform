import type { ReactNode } from "react";

import { AuthLogo } from "@/features/auth/components/auth-logo";
import { cn } from "@/lib/utils";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

/** Form column of the auth card: logo, heading and the form itself. */
function AuthCard({ title, description, children, className }: AuthCardProps) {
  return (
    <div
      data-slot="auth-card"
      className={cn(
        "w-full max-w-120 rounded-[24px_24px_24px_8px] bg-surface px-5 py-7 shadow-card sm:bg-transparent sm:p-0 sm:shadow-none",
        className,
      )}
    >
      <div className="mb-6 flex justify-center sm:mb-8 lg:justify-start">
        <AuthLogo priority />
      </div>
      <header className="mb-7 space-y-2 text-center lg:text-start">
        <h1 className="text-page-title text-ink">{title}</h1>
        <p className="text-[14.5px] leading-[2] text-copy">{description}</p>
      </header>
      {children}
    </div>
  );
}

export { AuthCard };
