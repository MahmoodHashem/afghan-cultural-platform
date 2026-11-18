import Link from "next/link";

import { Logo } from "@/components/brand/mirasaf-logo";
import { cn } from "@/lib/utils";

type AuthLogoProps = {
  className?: string;
  /** Kept for API compatibility; the logo is an inline SVG and needs no preloading. */
  priority?: boolean;
};

function AuthLogo({ className }: AuthLogoProps) {
  return (
    <Link
      href="/"
      aria-label="میراث افغانستان، رفتن به خانه"
      className={cn(
        "rounded-control outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
        className,
      )}
    >
      <Logo size="lg" />
    </Link>
  );
}

export { AuthLogo };
