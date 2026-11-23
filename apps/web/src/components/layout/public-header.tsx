"use client";

import {
  ArrowRightIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  ChevronDownIcon,
  ClipboardDocumentCheckIcon,
  MoonIcon,
  Squares2X2Icon,
  PlusIcon as StaticPlusIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { type SubmitEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/mirasaf-logo";
import { ArrowRightStartOnRectangleIcon as AnimatedLogoutIcon } from "@/components/icons/animated/arrow-right-start-on-rectangle";
import { ClipboardDocumentCheckIcon as AnimatedClipboardDocumentCheckIcon } from "@/components/icons/animated/clipboard-document-check";
import { MagnifyingGlassIcon } from "@/components/icons/animated/magnifying-glass";
import { PlusIcon } from "@/components/icons/animated/plus";
import { Squares2X2Icon as AnimatedSquares2X2Icon } from "@/components/icons/animated/squares-2x2";
import {
  UserCircleIcon as AnimatedUserCircleIcon,
  UserCircleIcon,
} from "@/components/icons/animated/user-circle";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLogout } from "@/features/auth/hooks/use-auth-mutations";
import { useAnimatedIcon } from "@/hooks/use-animated-icon";
import { cn } from "@/lib/utils";
import { normalizePersianSearch } from "@/lib/utils/persian";
import { createUserInitials, getUserAvatarColorClass } from "@/lib/utils/user";
import { type SafeUser, useAuthStore } from "@/stores/auth-store";

type PublicHeaderProps = {
  variant?: "hero" | "solid";
};

type HeaderContext = {
  title: string;
  backHref: string;
  backLabel: string;
  visible: boolean;
  hasTableOfContents?: boolean;
};

const PUBLIC_HEADER_CONTEXT_EVENT = "afghan-culture:public-header-context";

const navigationItems = [
  { label: "خانه", href: "/" },
  { label: "مطالب", href: "/explore" },
  { label: "ولایت‌ها", href: "/provinces" },
  { label: "موضوع‌ها", href: "/categories" },
];

function PublicHeader({ variant = "solid" }: PublicHeaderProps) {
  const pathname = usePathname();
  const [isHeaderCompact, setIsHeaderCompact] = useState(variant === "solid");
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerContext, setHeaderContext] = useState<HeaderContext | null>(null);
  const isCompact = variant === "solid" || isHeaderCompact;
  const shouldShowHeaderContext = variant === "solid" && Boolean(headerContext?.visible);

  useEffect(() => {
    let animationFrameId = 0;

    const updateHeaderState = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 8);
        if (variant !== "solid") {
          setIsHeaderCompact(window.scrollY > 120);
        }
      });
    };

    if (variant === "solid") {
      setIsHeaderCompact(true);
    }

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
    <header
      data-public-header
      data-scrolled={isScrolled ? "" : undefined}
      className={cn(
        "fixed inset-x-0 top-0 z-30 border-b transition-[background-color,border-color,box-shadow,color] duration-300 ease-expo",
        isCompact
          ? "border-line bg-header text-ink backdrop-blur-md supports-backdrop-filter:bg-header"
          : "border-transparent bg-transparent text-white",
        isCompact && isScrolled ? "border-transparent shadow-header" : null,
      )}
    >
      <nav className="content-container relative grid h-16.5 items-center" aria-label="ناوبری اصلی">
        <div
          className={cn(
            "col-start-1 row-start-1 flex min-w-0 items-center gap-6 transition-all duration-300 ease-out",
            shouldShowHeaderContext
              ? "pointer-events-none -translate-y-1 opacity-0"
              : "translate-y-0 opacity-100",
          )}
          aria-hidden={shouldShowHeaderContext}
          inert={shouldShowHeaderContext}
        >
          <Link
            href="/"
            aria-label="میراث افغانستان، رفتن به خانه"
            className="flex shrink-0 items-center gap-2.5 rounded-bubble-xs outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <Logo tone={isCompact ? "color" : "onDark"} wordmarkClassName="hidden sm:flex" />
          </Link>

          <Menubar className="hidden h-auto gap-0.5 border-0 bg-transparent p-0 shadow-none lg:flex">
            {navigationItems.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative rounded-bubble-xs px-2.5 py-1.5 text-[14px] leading-[2] transition-colors duration-200 outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
                    isCompact
                      ? "text-copy hover:bg-line-soft hover:text-ink focus-visible:outline-ring"
                      : "text-white/85 hover:bg-white/10 hover:text-white focus-visible:outline-white",
                    isActive ? "font-bold" : "font-medium",
                    isActive && isCompact ? "text-ink" : null,
                    isActive && !isCompact ? "text-white" : null,
                  )}
                >
                  {item.label}
                  {isActive ? (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0.5 left-1/2 h-0.5 w-4.5 -translate-x-1/2 rounded-full bg-gold"
                    />
                  ) : null}
                </Link>
              );
            })}
          </Menubar>

          <div className="ms-auto flex min-w-0 items-center gap-2.5">
            <HeaderSearch isCompact={isCompact} className="hidden w-60 xl:w-72 lg:flex" />
            <HeaderThemeToggle isCompact={isCompact} />
            <div className="hidden lg:block">
              <HeaderAuthControls isCompact={isCompact} />
            </div>
            <MobileNavigation isCompact={isCompact} />
          </div>
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
      </nav>
      {isCompact ? <span aria-hidden="true" className="read-progress" /> : null}
    </header>
  );
}

function HeaderContextContent({ context }: { context: HeaderContext }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 text-center">
      <Link
        href={context.backHref}
        className={cn(buttonVariants({ variant: "outline", size: "icon" }), "shrink-0")}
        aria-label={context.backLabel}
      >
        <ArrowRightIcon className="size-4" aria-hidden="true" />
      </Link>
      <p className="w-full truncate text-center text-[14px] font-bold text-ink sm:text-[15px]">
        {context.title}
      </p>
    </div>
  );
}

function HeaderThemeToggle({ isCompact }: { isCompact: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "تغییر به حالت روشن" : "تغییر به حالت تاریک"}
      className={cn(
        "hidden size-9.5 shrink-0 place-items-center rounded-bubble-sm border transition-colors duration-200 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 lg:grid",
        isCompact
          ? "border-line bg-surface text-copy hover:border-brand hover:bg-brand-soft hover:text-brand-ink focus-visible:outline-ring"
          : "border-white/35 bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white",
      )}
    >
      {isDark ? (
        <SunIcon className="size-4.5" aria-hidden="true" />
      ) : (
        <MoonIcon className="size-4.5" aria-hidden="true" />
      )}
    </button>
  );
}

function HeaderSearch({
  isCompact,
  placeholder = "جست‌وجو در فرهنگ افغانستان...",
  className,
}: {
  isCompact: boolean;
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const { iconRef, triggerProps } = useAnimatedIcon();

  function submitSearch(event: SubmitEvent) {
    event.preventDefault();
    const search = normalizePersianSearch(searchValue);

    router.push(search ? `/explore?search=${encodeURIComponent(search)}` : "/explore");
  }

  return (
    <form
      role="search"
      onSubmit={submitSearch}
      {...triggerProps}
      className={cn(
        "relative h-9.5 min-w-0 items-center rounded-full border-[1.5px] transition-[border-color,background-color,box-shadow] duration-200 focus-within:border-ring focus-within:shadow-focus",
        isCompact
          ? "border-line bg-paper text-ink focus-within:bg-surface"
          : "border-white/45 bg-white/10 text-white focus-within:bg-white/15",
        className,
      )}
    >
      <MagnifyingGlassIcon
        ref={iconRef}
        size={18}
        className={cn(
          "pointer-events-none absolute start-3",
          isCompact ? "text-faint" : "text-white/80",
        )}
        aria-hidden="true"
      />
      <label className="sr-only" htmlFor={isCompact ? "header-search-solid" : "header-search-hero"}>
        جست‌وجو
      </label>
      <input
        id={isCompact ? "header-search-solid" : "header-search-hero"}
        type="search"
        placeholder={placeholder}
        className={cn(
          "h-full w-full min-w-0 rounded-full bg-transparent ps-9.5 pe-3 text-[13px] outline-none",
          isCompact ? "placeholder:text-faint" : "placeholder:text-white/75",
        )}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
    </form>
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
            "inline-flex size-9.5 shrink-0 items-center justify-center rounded-bubble-sm border outline-none transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 lg:hidden",
            isCompact
              ? "border-line bg-surface text-copy hover:border-brand hover:bg-brand-soft hover:text-brand-ink focus-visible:outline-ring"
              : "border-white/35 bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white",
          )}
          aria-label="باز کردن منوی ناوبری"
        >
          <Bars3Icon className="size-5" aria-hidden="true" />
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-[min(86vw,22rem)] gap-0 border-line bg-surface p-0 text-ink"
        >
          <SheetHeader className="border-b border-line-soft px-5 py-5 text-start">
            <SheetTitle className="flex items-center gap-3 text-[17px] font-bold text-ink">
              <Logo size="sm" withTagline={false} />
            </SheetTitle>
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
                      "flex min-h-11 items-center rounded-bubble-sm px-3 text-[14px] font-medium text-copy transition-colors duration-200 hover:bg-line-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      isActive ? "bg-brand-soft font-bold text-brand-ink" : null,
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-line-soft pt-5">
              {status === "initializing" ? (
                <div className="h-10 animate-pulse rounded-full bg-line-soft" aria-hidden="true" />
              ) : isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-bubble-sm bg-paper p-3">
                    <Avatar size="default" className="size-9 bg-brand-soft">
                      {user.profileImageUrl ? (
                        <AvatarImage src={user.profileImageUrl} alt="" />
                      ) : null}
                      <AvatarFallback
                        className={cn("text-[12px] font-bold", getUserAvatarColorClass(user.id))}
                      >
                        {createUserInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold text-ink">{user.displayName}</p>
                      <p className="truncate text-[12px] text-faint" dir="ltr">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/entries/new"
                    onClick={closeMenu}
                    className={cn(buttonVariants({ variant: "pill" }), "h-11 w-full")}
                  >
                    <StaticPlusIcon className="size-4" aria-hidden="true" />
                    افزودن مطلب
                  </Link>
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-11 w-full rounded-full",
                    )}
                  >
                    <UserCircleIcon className="size-4" aria-hidden="true" />
                    حساب کاربری
                  </Link>
                  {user.role === "MODERATOR" || user.role === "ADMIN" ? (
                    <Link
                      href="/moderator"
                      onClick={closeMenu}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "h-11 w-full rounded-full",
                      )}
                    >
                      <ClipboardDocumentCheckIcon className="size-4" aria-hidden="true" />
                      بررسی مطالب
                    </Link>
                  ) : null}
                  {user.role === "ADMIN" ? (
                    <Link
                      href="/admin"
                      onClick={closeMenu}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "h-11 w-full rounded-full",
                      )}
                    >
                      <Squares2X2Icon className="size-4" aria-hidden="true" />
                      پنل مدیریت
                    </Link>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={logoutMutation.isPending}
                    onClick={() => setIsLogoutDialogOpen(true)}
                    className="h-11 w-full rounded-full text-brand-ink hover:bg-brand-soft hover:text-brand-ink"
                  >
                    <ArrowRightStartOnRectangleIcon className="size-4" aria-hidden="true" />
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
                      "h-11 w-full rounded-full",
                    )}
                  >
                    ورود
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className={cn(buttonVariants({ variant: "pill" }), "h-11 w-full")}
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
  const { iconRef, triggerProps } = useAnimatedIcon();

  if (status === "initializing") {
    return (
      <div
        className={cn(
          "flex h-9.5 w-36 shrink-0 animate-pulse items-center rounded-bubble-sm",
          isCompact ? "bg-line-soft" : "bg-white/20",
        )}
        aria-hidden="true"
      />
    );
  }

  if (status !== "authenticated" || !user) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: isCompact ? "outline" : "glass" }),
            "h-9.5",
            isCompact ? null : "rounded-bubble-sm",
          )}
        >
          <UserCircleIcon size={16} aria-hidden="true" />
          ورود
        </Link>
        <Link href="/register" className={cn(buttonVariants({ variant: "default" }), "h-9.5")}>
          ثبت‌نام
        </Link>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Link
        href="/entries/new"
        {...triggerProps}
        className={cn(
          buttonVariants({ variant: "pill" }),
          "hidden h-9.5 px-4 md:inline-flex",
          isCompact ? null : "focus-visible:outline-white",
        )}
      >
        <PlusIcon ref={iconRef} size={16} aria-hidden="true" />
        افزودن مطلب
      </Link>
      <ProfileMenu user={user} />
    </div>
  );
}

function ProfileMenu({ user, mobile = false }: { user: SafeUser; mobile?: boolean }) {
  const { triggerProps } = useAnimatedIcon();

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const logoutMutation = useLogout();
  const profileAnimation = useAnimatedIcon();
  const moderationAnimation = useAnimatedIcon();
  const adminAnimation = useAnimatedIcon();
  const logoutAnimation = useAnimatedIcon();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    <DropdownMenu open={isDropdownOpen} onOpenChange={() => setIsDropdownOpen(!isDropdownOpen)}>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center outline-none transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          mobile
            ? "ms-auto justify-center rounded-full bg-transparent"
            : "h-9.5 gap-1.5 rounded-bubble-sm border border-line bg-surface ps-1 pe-2 text-ink hover:border-brand hover:bg-brand-soft aria-expanded:border-brand aria-expanded:bg-brand-soft",
        )}
        aria-label="باز کردن منوی حساب"
        {...triggerProps}
        aria-expanded={isDropdownOpen}
      >
        <Avatar size="default" className={cn("bg-brand-soft", mobile ? "size-8" : "size-7")}>
          {user.profileImageUrl ? <AvatarImage src={user.profileImageUrl} alt="" /> : null}
          <AvatarFallback className={cn("text-[12px] font-bold", getUserAvatarColorClass(user.id))}>
            {createUserInitials(user.displayName)}
          </AvatarFallback>
        </Avatar>
        {!mobile ? (
          <ChevronDownIcon
            className={cn(
              "hidden size-4 text-faint transition-transform aria-expanded:rotate-180 sm:block",
            )}
            aria-hidden="true"
            aria-expanded={isDropdownOpen}
          />
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={12} className="w-64 p-2">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-3">
            <p className="truncate text-[14px] font-bold text-ink">{user.displayName}</p>
            <p className="mt-1 truncate text-[12px] font-normal text-faint" dir="ltr">
              {user.email}
            </p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {!mobile ? (
          <DropdownMenuItem
            render={<Link href="/profile" {...profileAnimation.triggerProps} />}
            className="px-3 py-2 text-copy"
          >
            <AnimatedUserCircleIcon ref={profileAnimation.iconRef} size={16} aria-hidden="true" />
            حساب کاربری
          </DropdownMenuItem>
        ) : null}
        {user.role === "MODERATOR" || user.role === "ADMIN" ? (
          <DropdownMenuItem
            render={<Link href="/moderator" {...moderationAnimation.triggerProps} />}
            className="px-3 py-2 text-copy"
          >
            <AnimatedClipboardDocumentCheckIcon
              ref={moderationAnimation.iconRef}
              size={16}
              aria-hidden="true"
            />
            بررسی مطالب
          </DropdownMenuItem>
        ) : null}
        {user.role === "ADMIN" ? (
          <DropdownMenuItem
            render={<Link href="/admin" {...adminAnimation.triggerProps} />}
            className="px-3 py-2 text-copy"
          >
            <AnimatedSquares2X2Icon ref={adminAnimation.iconRef} size={16} aria-hidden="true" />
            پنل مدیریت
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={logoutMutation.isPending}
          onClick={() => setIsLogoutDialogOpen(true)}
          {...logoutAnimation.triggerProps}
          className="px-3 py-2"
        >
          <AnimatedLogoutIcon ref={logoutAnimation.iconRef} size={16} aria-hidden="true" />
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
      <AlertDialogContent>
        <AlertDialogHeader className="place-items-start text-start">
          <AlertDialogTitle>از حساب خارج می‌شوید؟</AlertDialogTitle>
          <AlertDialogDescription>هر وقت خواستید می‌توانید دوباره وارد شوید.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-start">
          <AlertDialogCancel>انصراف</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            variant="destructive"
          >
            {isPending ? "در حال خروج..." : "خروج"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
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
export { ProfileMenu, PUBLIC_HEADER_CONTEXT_EVENT, PublicHeader };
