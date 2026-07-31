"use client";

import { Button } from "@/components/ui/button";
import { useLogoutAll } from "@/features/auth/hooks/use-auth-mutations";

function LogoutAllButton() {
  const logoutAllMutation = useLogoutAll();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={logoutAllMutation.isPending}
      onClick={() => logoutAllMutation.mutate()}
    >
      خروج از همه دستگاه‌ها
    </Button>
  );
}

export { LogoutAllButton };
