"use client";

import {
  ArrowRightIcon,
  Bars3Icon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menubar } from "@/components/ui/menubar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLogout } from "@/features/auth/hooks/use-auth-mutations";
import { cn } from "@/lib/utils";
import { type SafeUser, useAuthStore } from "@/stores/auth-store";

type PublicHeaderProps = {
  variant?: "hero" | "solid";
};

type HeaderContext = {
  title: string;
  backHref: string;
  backLabel: string;
  visible: boolean;
};

const PUBLIC_HEADER_CONTEXT_EVENT = "afghan-culture:public-header-context";

const navigationItems = [
  { label: "خانه", href: "/" },
  { label: "مطالب", href: "/explore" },
  { label: "ولایت‌ها", href: "/provinces" },
  { label: "دسته‌بندی‌ها", href: "/categories" },
];

function PublicHeader({ variant = "solid" }: PublicHeaderProps) {
  const pathname = usePathname();
  const [isHeaderCompact, setIsHeaderCompact] = useState(variant === "solid");
  const [headerContext, setHeaderContext] = useState<HeaderContext | null>(null);
  const isCompact = variant === "solid" || isHeaderCompact;
  const shouldShowHeaderContext = variant === "solid" && Boolean(headerContext?.visible);

  useEffect(() => {
    if (variant === "solid") {
      setIsHeaderCompact(true);
      return;
    }

    let animationFrameId = 0;

    const updateHeaderState = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(() => {
        setIsHeaderCompact(window.scrollY > 120);
      });
    };

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", updateHeaderState);
    };
  }, [variant]);

  useEffect(() => {
    const updateHeaderContext = (event: Event) => {
      if (event instanceof CustomEvent && isHeaderContext(event.detail)) {
        setHeaderContext(event.detail);
      }
    };

    window.addEventListener(PUBLIC_HEADER_CONTEXT_EVENT, updateHeaderContext);

    return () => {
      window.removeEventListener(PUBLIC_HEADER_CONTEXT_EVENT, updateHeaderContext);
    };
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-30 flex justify-center px-4 sm:top-5">
      <nav
        className={cn(
          "pointer-events-auto flex items-center rounded-full transition-all duration-500 ease-out",
          isCompact
            ? "w-full max-w-260 gap-2 border border-border bg-card px-3 py-1.5 text-foreground shadow-[0_12px_32px_rgba(31,41,55,0.1)]"
            : "w-full max-w-310 gap-3 border border-transparent bg-transparent px-0 py-0 text-white drop-shadow-[0_3px_18px_rgba(0,0,0,0.34)]",
        )}
        aria-label="ناوبری اصلی"
      >
        <div className="relative grid min-w-0 flex-1">
          <div
            className={cn(
              "col-start-1 row-start-1 flex min-w-0 items-center gap-2 transition-all duration-300 ease-out",
              shouldShowHeaderContext
                ? "pointer-events-none -translate-y-1 opacity-0"
                : "translate-y-0 opacity-100",
            )}
            aria-hidden={shouldShowHeaderContext}
            inert={shouldShowHeaderContext}
          >
            <Link
              href="/"
              className={cn(
                "flex shrink-0 items-center rounded-full font-bold tracking-normal outline-none transition-all duration-500 focus-visible:ring-3",
                isCompact
                  ? "gap-2 px-2 py-1.5 text-[16px] text-foreground hover:text-primary focus-visible:ring-ring/40"
                  : "gap-3 px-2 py-2 text-[18px] text-white hover:text-white/88 focus-visible:ring-white/35",
              )}
            >
              <Image
                src="/images/small-logo.png"
                alt=""
                width={42}
                height={48}
                sizes="42px"
                className={cn("w-auto", isCompact ? "h-8" : "h-10 brightness-0 invert")}
              />
              <span className="hidden sm:inline">میراث افغانستان</span>
            </Link>

            <Menubar
              className={cn(
                "hidden h-auto border-0 bg-transparent p-0 shadow-none transition-all duration-500 lg:flex",
                isCompact ? "gap-0" : "gap-4 xl:gap-6",
              )}
            >
              {navigationItems.map((item) => {
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative h-auto rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3",
                      isCompact
                        ? "px-3 py-1.5 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring/40"
                        : "px-3 py-2 text-[14px] text-white/84 hover:bg-transparent hover:text-white focus-visible:ring-white/35",
                      isActive && isCompact ? "bg-muted text-foreground" : null,
                    )}
                  >
                    {item.label}
                    {isActive && !isCompact ? (
                      <span className="absolute inset-x-5 -bottom-1 h-0.5 rounded-full bg-white/72" />
                    ) : null}
                  </Link>
                );
              })}
            </Menubar>

            <HeaderSearch
              isCompact={isCompact}
              className="hidden lg:flex"
              inputClassName={cn(
                isCompact
                  ? "text-[13px] text-foreground placeholder:text-foreground"
                  : "text-[14px] text-background placeholder:text-background",
              )}
            />

            <HeaderSearch
              isCompact
              placeholder="جست‌وجو..."
              className="flex min-w-0 flex-1 lg:hidden"
              inputClassName="text-[13px] text-foreground placeholder:text-muted-foreground"
            />

            <div className="ms-auto hidden lg:block">
              <HeaderAuthControls isCompact={isCompact} />
            </div>
            <MobileNavigation isCompact={isCompact} />
          </div>

          <div
            className={cn(
              "col-start-1 row-start-1 flex min-w-0 items-center transition-all duration-300 ease-out",
              shouldShowHeaderContext
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-1 opacity-0",
            )}
            aria-hidden={!shouldShowHeaderContext}
            inert={!shouldShowHeaderContext}
          >
            {headerContext ? <HeaderContextContent context={headerContext} /> : null}
          </div>
        </div>
      </nav>
    </header>
  );
}

function HeaderContextContent({ context }: { context: HeaderContext }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <Link
        href={context.backHref}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary-light focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        aria-label={context.backLabel}
      >
        <ArrowRightIcon className="size-4" aria-hidden="true" />
      </Link>
      <p className="min-w-0 truncate text-[14px] font-bold text-foreground sm:text-[15px]">
        {context.title}
      </p>
    </div>
  );
}

function HeaderSearch({
  isCompact,
  placeholder = "جست‌وجوی فرهنگ، مکان، روایت...",
  className,
  inputClassName,
}: {
  isCompact: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}) {
  return (
    <label
      className={cn(
        "relative items-center gap-2.5 rounded-full border text-foreground shadow-[0_8px_24px_rgba(31,41,55,0.12)] transition-all duration-500 focus-within:border-primary focus-within:ring-3 focus-within:ring-ring/35",
        isCompact
          ? "h-9 min-w-0 border-border bg-card"
          : "h-11 min-w-65 flex-1 max-w-95 border-white/70",
        className,
      )}
    >
      <MagnifyingGlassIcon
        className={cn(
          "absolute right-2 size-5",
          isCompact ? "text-muted-foreground" : "text-background",
        )}
        aria-hidden="true"
      />
      <span className="sr-only">جست‌وجو</span>
      <input
        type="search"
        placeholder={placeholder}
        className={cn(
          "h-full min-w-0 flex-1 rounded-full bg-transparent ps-8 outline-none",
          inputClassName,
        )}
      />
    </label>
  );
}

function MobileNavigation({ isCompact }: { isCompact: boolean }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();
  const isAuthenticated = status === "authenticated" && Boolean(user);

  const closeMenu = () => setIsOpen(false);
  const confirmLogout = () => {
    logoutMutation.mutate(undefined, {
      onError: () => {
        toast.error("خروج انجام نشد. دوباره تلاش کنید.");
      },
      onSettled: () => {
        closeMenu();
        setIsLogoutDialogOpen(false);
      },
    });
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-foreground shadow-[0_8px_24px_rgba(31,41,55,0.14)] outline-none transition-colors hover:bg-background/90 focus-visible:ring-3 lg:hidden",
            isCompact ? "focus-visible:ring-ring/40" : "focus-visible:ring-white/35",
          )}
          aria-label="باز کردن منوی ناوبری"
        >
          <Bars3Icon className="size-5" aria-hidden="true" />
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-[min(86vw,22rem)] gap-0 border-border bg-background p-0 text-foreground"
        >
          <SheetHeader className="border-b border-border px-5 py-5 text-start">
            <SheetTitle className="flex items-center gap-3 text-[18px] font-bold text-primary">
              <Image
                src="/images/small-logo.png"
                alt=""
                width={34}
                height={39}
                className="h-9 w-auto"
              />
              میراث افغانستان
            </SheetTitle>
            <SheetDescription className="text-[13px] leading-6">
              راهی ساده برای دیدن فرهنگ افغانستان
            </SheetDescription>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6">
            <nav className="space-y-2" aria-label="ناوبری موبایل">
              {navigationItems.map((item) => {
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center rounded-xl border px-3 text-[15px] font-semibold text-foreground transition-colors hover:bg-card hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35",
                      isActive ? "border-primary/30 bg-primary-light text-primary" : null,
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-border pt-5">
              {status === "initializing" ? (
                <div className="h-10 animate-pulse rounded-full bg-muted" aria-hidden="true" />
              ) : isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-card p-3">
                    <Avatar size="default" className="size-9 bg-primary-light">
                      <AvatarFallback className="bg-primary-light text-[12px] font-bold text-primary">
                        {createInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold text-foreground">
                        {user.displayName}
                      </p>
                      <p className="truncate text-[12px] text-muted-foreground" dir="ltr">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/entries/new"
                    onClick={closeMenu}
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "h-11 w-full rounded-full",
                    )}
                  >
                    افزودن مطلب
                  </Link>
                  <Link
                    href="/account"
                    onClick={closeMenu}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-11 w-full rounded-full",
                    )}
                  >
                    حساب کاربری
                  </Link>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={logoutMutation.isPending}
                    onClick={() => setIsLogoutDialogOpen(true)}
                    className="h-11 w-full rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    {logoutMutation.isPending ? "در حال خروج..." : "خروج"}
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-11 w-full rounded-full text-foreground",
                    )}
                  >
                    ورود
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "h-11 w-full rounded-full",
                    )}
                  >
                    ثبت‌نام
                  </Link>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <LogoutConfirmationDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        onConfirm={confirmLogout}
        isPending={logoutMutation.isPending}
      />
    </>
  );
}

function HeaderAuthControls({ isCompact }: { isCompact: boolean }) {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  if (status === "initializing") {
    return (
      <div
        className={cn(
          "ms-auto flex shrink-0 items-center gap-3 rounded-full text-[15px] font-semibold",
          isCompact ? "h-9 w-24 bg-muted" : "h-11 w-32 bg-white/75",
        )}
        aria-hidden="true"
      />
    );
  }

  if (status !== "authenticated" || !user) {
    return (
      <div className="ms-auto flex shrink-0 items-center gap-3 text-[15px] font-semibold">
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline" }), "rounded-full text-foreground")}
          >
            ورود
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants({ variant: "default" }), "rounded-full")}
          >
            ثبت‌نام
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ms-auto flex shrink-0 items-center gap-2">
      <Link
        href="/entries/new"
        className={cn(
          "hidden items-center gap-1.5 rounded-full bg-primary font-semibold text-background shadow-[0_12px_30px_rgba(15,118,110,0.22)] transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-3 md:inline-flex",
          isCompact
            ? "h-9 px-3 text-[13px] focus-visible:ring-ring/40"
            : "h-11 px-4 text-[14px] focus-visible:ring-white/35",
        )}
      >
        <PlusIcon className="size-4" aria-hidden="true" />
        افزودن مطلب
      </Link>
      <ProfileMenu user={user} />
    </div>
  );
}

function ProfileMenu({ user }: { user: SafeUser }) {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const logoutMutation = useLogout();
  const confirmLogout = () => {
    logoutMutation.mutate(undefined, {
      onError: () => {
        toast.error("خروج انجام نشد. دوباره تلاش کنید.");
      },
      onSettled: () => {
        setIsLogoutDialogOpen(false);
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-11 items-center gap-1.5 rounded-full bg-background ps-2 pe-3 text-foreground shadow-[0_8px_24px_rgba(31,41,55,0.14)] outline-none transition-colors hover:bg-background/90 focus-visible:ring-3 focus-visible:ring-white/35"
        aria-label="باز کردن منوی حساب"
      >
        <Avatar size="default" className="size-8 bg-primary-light">
          <AvatarFallback className="bg-primary-light text-[12px] font-bold text-primary">
            {createInitials(user.displayName)}
          </AvatarFallback>
        </Avatar>
        <ChevronDownIcon
          className="hidden size-4 text-foreground transition-transform aria-expanded:rotate-180 sm:block"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="w-64 rounded-[24px] border-border bg-card p-2 text-foreground shadow-[0_24px_70px_rgba(31,41,55,0.14)]"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-3">
            <p className="truncate text-[15px] font-bold text-foreground">{user.displayName}</p>
            <p className="mt-1 truncate text-[13px] font-normal text-muted-foreground" dir="ltr">
              {user.email}
            </p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={<Link href="/account" />}
          className="rounded-2xl px-3 py-2 text-[14px] text-muted-foreground hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground"
        >
          حساب کاربری
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={logoutMutation.isPending}
          onClick={() => setIsLogoutDialogOpen(true)}
          className="rounded-2xl px-3 py-2 text-[14px] focus:bg-destructive/10"
        >
          {logoutMutation.isPending ? "در حال خروج..." : "خروج"}
        </DropdownMenuItem>
      </DropdownMenuContent>
      <LogoutConfirmationDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        onConfirm={confirmLogout}
        isPending={logoutMutation.isPending}
      />
    </DropdownMenu>
  );
}

function LogoutConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[24px] border border-border bg-card p-5 text-foreground shadow-[0_24px_70px_rgba(31,41,55,0.16)]">
        <AlertDialogHeader className="place-items-start text-start">
          <AlertDialogTitle className="text-[18px] font-bold text-foreground">
            خروج از حساب کاربری؟
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[14px] leading-7 text-muted-foreground">
            آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="-mx-5 -mb-5 border-border bg-muted/40 px-5 py-4 sm:justify-start">
          <AlertDialogCancel className="rounded-full">انصراف</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "در حال خروج..." : "خروج"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function createInitials(displayName: string) {
  return displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function isHeaderContext(value: unknown): value is HeaderContext {
  return (
    typeof value === "object" &&
    value !== null &&
    "title" in value &&
    "backHref" in value &&
    "backLabel" in value &&
    "visible" in value &&
    typeof value.title === "string" &&
    typeof value.backHref === "string" &&
    typeof value.backLabel === "string" &&
    typeof value.visible === "boolean"
  );
}

export type { HeaderContext };
export { PUBLIC_HEADER_CONTEXT_EVENT, PublicHeader };
