import Image from "next/image";

import { AUTH_LOGO_SRC } from "@/features/auth/constants/auth-assets";
import { cn } from "@/lib/utils";

type AuthLogoProps = {
  className?: string;
  priority?: boolean;
};

function AuthLogo({ className, priority = false }: AuthLogoProps) {
  return (
    <Image
      src={AUTH_LOGO_SRC}
      alt="میراث افغانستان"
      width={300}
      height={30}
      priority={priority}

      className={cn("object-contain h-14 sm:w-64 lg:w-96", className)}
    />
  );
}

export { AuthLogo };
