"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowRightStartOnRectangleIcon } from "@/components/icons/animated/arrow-right-start-on-rectangle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/use-auth-mutations";
import { useAnimatedIcon } from "@/hooks/use-animated-icon";
import { cn } from "@/lib/utils";

function ProfileLogoutButton({ className }: { className?: string }) {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const logoutMutation = useLogout();
  const { iconRef, triggerProps } = useAnimatedIcon();

  function confirmLogout() {
    logoutMutation.mutate(undefined, {
      onError: () => toast.error("خروج انجام نشد. دوباره تلاش کنید."),
      onSettled: () => setConfirmationOpen(false),
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={logoutMutation.isPending}
        onClick={() => setConfirmationOpen(true)}
        {...triggerProps}
        className={cn(
          "mt-1 rounded-full text-copy hover:bg-brand-soft hover:text-brand-ink",
          className,
        )}
      >
        <ArrowRightStartOnRectangleIcon ref={iconRef} size={16} aria-hidden="true" />
        {logoutMutation.isPending ? "در حال خروج..." : "خروج از حساب"}
      </Button>

      <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <AlertDialogContent className="p-5">
          <AlertDialogHeader className="place-items-start text-start">
            <AlertDialogTitle>از حساب خارج می‌شوید؟</AlertDialogTitle>
            <AlertDialogDescription className="leading-7">
              هر وقت خواستید می‌توانید دوباره وارد شوید.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-start">
            <AlertDialogCancel className="rounded-full">انصراف</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              disabled={logoutMutation.isPending}
              onClick={confirmLogout}
              variant="destructive"
              className="rounded-full"
            >
              {logoutMutation.isPending ? "در حال خروج..." : "خروج"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { ProfileLogoutButton };
