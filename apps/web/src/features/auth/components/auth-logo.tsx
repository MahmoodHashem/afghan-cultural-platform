import Image from "next/image";
import Link from "next/link";
import { AUTH_LOGO_SRC } from "@/features/auth/constants/auth-assets";
import { cn } from "@/lib/utils";

type AuthLogoProps = {
  className?: string;
  priority?: boolean;
};

function AuthLogo({ className, priority = false }: AuthLogoProps) {
  return (
    <Link
      href="/"
      className="rounded-control outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <Image
        src={AUTH_LOGO_SRC}
        alt="میراث افغانستان"
        width={300}
        height={98}
        priority={priority}
        className={cn("h-12 w-auto object-contain sm:h-14 dark:brightness-0 dark:invert", className)}
      />
    </Link>
  );
}

export { AuthLogo };
