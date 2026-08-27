import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { AuthLogo } from "@/features/auth/components/auth-logo";
import { cn } from "@/lib/utils";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

function AuthCard({ title, description, children, className }: AuthCardProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-160 gap-0 border-0 bg-card px-2 py-5 shadow-none ring-0 sm:rounded-xl sm:px-10 sm:py-10 sm:shadow-[0_2px_10px_rgba(0,0,0,.05)] sm:ring-1 sm:ring-border lg:px-14 lg:py-14",
        className,
      )}
    >
      <div className="mb-5 flex justify-center sm:mb-8">
        <AuthLogo priority className="" />
      </div>
      <header className="mb-6 space-y-2 text-center sm:mb-8 sm:space-y-3">
        <h1 className="text-[28px] font-bold leading-[1.45] text-foreground sm:text-[40px]">
          {title}
        </h1>
        <p className="text-[14px] leading-7 text-muted-foreground sm:text-base sm:leading-8">
          {description}
        </p>
      </header>
      {children}
    </Card>
  );
}

export { AuthCard };
