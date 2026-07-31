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
        "w-full max-w-160 gap-0 border-0  ring-0 sm:rounded-xl bg-card px-4 sm:px-10 py-10 shadow-[0_2px_10px_rgba(0,0,0,.05)] sm:ring-1 sm:ring-border lg:px-14 lg:py-14",
        className,
      )}
    >
      <div className="mb-8 flex justify-center lg:hidden">
        <AuthLogo priority className="w-47.5" />
      </div>
      <header className="mb-8 space-y-3 text-center">
        <h1 className="text-[32px] font-bold leading-[1.45] text-foreground sm:text-[40px]">
          {title}
        </h1>
        <p className="text-[15px] leading-8 text-muted-foreground sm:text-base">{description}</p>
      </header>
      {children}
    </Card>
  );
}

export { AuthCard };
