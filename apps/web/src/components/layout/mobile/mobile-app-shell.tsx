"use client";

import {
  AdjustmentsHorizontalIcon,
  ArrowRightIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  getMobileRouteContext,
  isMobileNavItemActive,
  type MobileNavItem,
  mobileNavigation,
} from "@/components/layout/mobile/mobile-navigation";
import {
  MobileShellAuthDrawer,
  type ShellAuthReason,
} from "@/components/layout/mobile/mobile-shell-auth-drawer";
import {
  MOBILE_CHROME_VISIBILITY_EVENT,
  OPEN_ENTRY_CONTENTS_EVENT,
  OPEN_EXPLORE_FILTERS_EVENT,
} from "@/components/layout/mobile/mobile-shell-events";
import { useMobileChromeVisibility } from "@/components/layout/mobile/use-mobile-chrome-visibility";
import { ProfileMenu, PUBLIC_HEADER_CONTEXT_EVENT } from "@/components/layout/public-header";
import { cn } from "@/lib/utils";
import { type AuthSession, type SafeUser, useAuthStore } from "@/stores/auth-store";

type HeaderContext = {
  title: string;
  backHref: string;
  backLabel: string;
  visible: boolean;
  hasTableOfContents?: boolean;
};

const CLOSE_ANIMATION_MS = 500;

function MobileAppShell() {
  const pathname = usePathname();
  const router = useRouter();
  const routeContext = getMobileRouteContext(pathname);
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const [headerContext, setHeaderContext] = useState<HeaderContext | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [pendingItem, setPendingItem] = useState<MobileNavItem | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const openFrameRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const mobileChromeHidden = useMobileChromeVisibility(
    routeContext?.kind === "entry" || routeContext?.kind === "profile",
  );

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(MOBILE_CHROME_VISIBILITY_EVENT, {
        detail: { hidden: mobileChromeHidden },
      }),
    );
  }, [mobileChromeHidden]);

  useEffect(() => {
    if (routeContext?.kind !== "home") {
      setScrolled(true);
      return;
    }

    const update = () => setScrolled(window.scrollY > 72);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [routeContext?.kind]);

  useEffect(() => {
    const updateContext = (event: Event) => {
      if (event instanceof CustomEvent && isHeaderContext(event.detail)) {
        setHeaderContext(event.detail);
      }
    };

    window.addEventListener(PUBLIC_HEADER_CONTEXT_EVENT, updateContext);
    return () => window.removeEventListener(PUBLIC_HEADER_CONTEXT_EVENT, updateContext);
  }, []);

  const closeAuth = useCallback(() => {
    if (openFrameRef.current !== null) window.cancelAnimationFrame(openFrameRef.current);
    setAuthOpen(false);
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setPendingItem(null);
      closeTimerRef.current = null;
    }, CLOSE_ANIMATION_MS);
  }, []);

  useEffect(
    () => () => {
      if (openFrameRef.current !== null) window.cancelAnimationFrame(openFrameRef.current);
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    },
    [],
  );

  if (!routeContext) return null;

  const transparent = routeContext.kind === "home" && !scrolled;

  function openAuth(item: MobileNavItem) {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    if (openFrameRef.current !== null) window.cancelAnimationFrame(openFrameRef.current);
    setPendingItem(item);
    setAuthOpen(false);
    openFrameRef.current = window.requestAnimationFrame(() => {
      setAuthOpen(true);
      openFrameRef.current = null;
    });
  }

  function handleProtectedNavigation(event: MouseEvent<HTMLAnchorElement>, item: MobileNavItem) {
    if (!item.protected) return;
    if (status === "initializing") {
      event.preventDefault();
      return;
    }

    const canCreate = user?.status === "ACTIVE" && Boolean(user.emailVerified);
    if (
      status === "authenticated" &&
      user?.status === "ACTIVE" &&
      (item.key !== "create" || canCreate)
    ) {
      return;
    }

    event.preventDefault();
    openAuth(item);
  }

  function handleAuthenticated(session: AuthSession) {
    if (!pendingItem) return;
    if (pendingItem.key === "create" && !session.user.emailVerified) return;
    const destination = pendingItem.href;
    closeAuth();
    router.push(destination);
  }

  const authReason: ShellAuthReason =
    status !== "authenticated" || !user
      ? "unauthenticated"
      : user.status === "SUSPENDED"
        ? "suspended"
        : "unverified";

  return (
    <div data-mobile-app-shell data-mobile-route={routeContext.kind} className="lg:hidden">
      <style>{`@media (max-width: 1023px) { body:has([data-mobile-app-shell]) footer, body:has([data-mobile-app-shell]) [data-public-header] { display: none; } }`}</style>
      <MobileTopBar
        routeContext={routeContext}
        headerContext={headerContext}
        transparent={transparent}
        hidden={mobileChromeHidden}
        user={user}
      />
      <MobileBottomNavigation
        pathname={pathname}
        status={status}
        hidden={mobileChromeHidden}
        onProtectedNavigation={handleProtectedNavigation}
      />
      <div className="h-[calc(4.75rem+env(safe-area-inset-bottom))]" aria-hidden="true" />

      {pendingItem ? (
        <MobileShellAuthDrawer
          open={authOpen}
          onOpenChange={(open) => {
            if (open) setAuthOpen(true);
            else closeAuth();
          }}
          title={pendingItem.label}
          description={getProtectedDestinationDescription(pendingItem.key, authReason)}
          returnPath={pendingItem.href}
          reason={authReason}
          user={user}
          onAuthenticated={handleAuthenticated}
        />
      ) : null}
    </div>
  );
}

function MobileTopBar({
  routeContext,
  headerContext,
  transparent,
  hidden,
  user,
}: {
  routeContext: NonNullable<ReturnType<typeof getMobileRouteContext>>;
  headerContext: HeaderContext | null;
  transparent: boolean;
  hidden: boolean;
  user: SafeUser | null;
}) {
  const reducedMotion = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll();
  const smoothReadingProgress = useSpring(scrollYProgress, {
    stiffness: 240,
    damping: 36,
    mass: 0.72,
    skipInitialAnimation: true,
  });
  const [readingProgress, setReadingProgress] = useState(0);
  const contextual = routeContext.kind === "entry" && Boolean(headerContext?.visible);
  const backHref = contextual && headerContext ? headerContext.backHref : routeContext.backHref;
  const backLabel = contextual && headerContext ? headerContext.backLabel : routeContext.backLabel;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const nextProgress = Math.round(latest * 100);
    setReadingProgress((current) =>
      Math.abs(nextProgress - current) >= 2 || nextProgress === 0 || nextProgress === 100
        ? nextProgress
        : current,
    );
  });

  return (
    <motion.header
      initial={false}
      animate={{ y: hidden ? "-135%" : "0%" }}
      transition={getChromeTransition(reducedMotion)}
      aria-hidden={hidden}
      inert={hidden}
      className={cn(
        "fixed inset-x-0 top-2 z-40 border pt-[env(safe-area-inset-top)] will-change-transform transition-[background-color,border-color,box-shadow,color] duration-300",
        transparent
          ? "border-transparent bg-transparent text-white"
          : "border-border/80 bg-background/95 text-foreground shadow-[0_6px_20px_rgba(31,41,55,0.06)] backdrop-blur-xl rounded-full mx-2",
      )}
    >
      <div className="flex  items-center gap-3 ps-2 transition-all">
        {backHref ? (
          <Link
            href={backHref}
            aria-label={backLabel}
            className="flex size-11 shrink-0 items-center justify-center rounded-full outline-none transition-colors hover:bg-black/5 focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <ArrowRightIcon className="size-5" aria-hidden="true" />
          </Link>
        ) : routeContext.kind === "home" ? (
          <Link href="/" className="flex min-w-0 items-center gap-2 font-bold">
            <Image
              src="/images/small-logo.png"
              alt=""
              width={32}
              height={36}
              className={cn("h-8 w-auto", transparent && "brightness-0 invert")}
            />
            <span className="truncate text-[15px]">میراث افغانستان</span>
          </Link>
        ) : (
          <p className="min-w-0 flex-1 truncate text-[16px] font-bold">{routeContext.title}</p>
        )}

        {backHref ? (
          <p className="min-w-0 flex-1 truncate text-[14px] font-bold">
            {contextual && headerContext ? headerContext.title : routeContext.title}
          </p>
        ) : null}

        {routeContext.kind === "profile" && user ? (
          <ProfileMenu user={user} mobile />
        ) : routeContext.kind === "explore" ? (
          <button
            type="button"
            aria-label="باز کردن فیلترهای مطالب"
            onClick={() => window.dispatchEvent(new Event(OPEN_EXPLORE_FILTERS_EVENT))}
            className="ms-auto flex size-11 shrink-0 items-center justify-center rounded-full outline-none transition-colors hover:bg-black/5 focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <AdjustmentsHorizontalIcon className="size-5" aria-hidden="true" />
          </button>
        ) : routeContext.kind === "entry" && headerContext?.hasTableOfContents ? (
          <button
            type="button"
            aria-label="باز کردن فهرست مطالب"
            onClick={() => window.dispatchEvent(new Event(OPEN_ENTRY_CONTENTS_EVENT))}
            className="ms-auto flex size-11 shrink-0 items-center justify-center rounded-full outline-none transition-colors hover:bg-black/5 focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <ListBulletIcon className="size-5" aria-hidden="true" />
          </button>
        ) : (
          <Link
            href="/explore"
            aria-label="جست‌وجوی مطالب"
            className="ms-auto flex size-11 shrink-0 items-center justify-center rounded-full outline-none transition-colors hover:bg-black/5 focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <MagnifyingGlassIcon className="size-5" aria-hidden="true" />
          </Link>
        )}
      </div>
      {routeContext.kind === "entry" ? (
        <div
          className="absolute inset-x-5 bottom-0 h-0.5 overflow-hidden rounded-full bg-border/55"
          role="progressbar"
          aria-label="پیشرفت مطالعه"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={readingProgress}
        >
          <motion.div
            className="h-full origin-right rounded-full bg-primary"
            style={{ scaleX: reducedMotion ? scrollYProgress : smoothReadingProgress }}
          />
        </div>
      ) : null}
    </motion.header>
  );
}

function MobileBottomNavigation({
  pathname,
  status,
  hidden,
  onProtectedNavigation,
}: {
  pathname: string;
  status: ReturnType<typeof useAuthStore.getState>["status"];
  hidden: boolean;
  onProtectedNavigation: (event: MouseEvent<HTMLAnchorElement>, item: MobileNavItem) => void;
}) {
  const reducedMotion = Boolean(useReducedMotion());

  return (
    <motion.nav
      initial={false}
      animate={{ y: hidden ? "145%" : "0%" }}
      transition={getChromeTransition(reducedMotion)}
      aria-hidden={hidden}
      inert={hidden}
      className="fixed inset-x-0 bottom-2 rounded-full mx-6 z-40 border-t border-border/80 bg-card/95 px-2 pt-1 pb-[calc(0.3rem+env(safe-area-inset-bottom))] shadow-[0_-8px_28px_rgba(31,41,55,0.08)] backdrop-blur-xl"
      aria-label="ناوبری اصلی موبایل"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 items-end">
        {mobileNavigation.map((item) => {
          const active = isMobileNavItemActive(item.key, pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              aria-disabled={status === "initializing" && item.protected}
              onClick={(event) => onProtectedNavigation(event, item)}
              className={cn(
                "relative flex min-h-12 flex-col items-center justify-end gap-0.5 rounded-xl px-1 text-[11px] font-medium text-muted-foreground outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40",
                active && "text-primary",
                item.prominent && "-mt-5",
              )}
            >
              {active && !item.prominent ? (
                <motion.span
                  layoutId="mobile-navigation-active"
                  className="absolute inset-x-7 bottom-0 h-0.5 rounded-full bg-primary"
                  transition={reducedMotion ? { duration: 0 } : { duration: 0.24 }}
                  aria-hidden="true"
                />
              ) : null}
              <span
                className={cn(
                  "flex size-7 items-center justify-center",
                  item.prominent &&
                    "size-12 rounded-full border-4 border-card bg-primary text-primary-foreground ",
                )}
              >
                <Icon className={item.prominent ? "size-6" : "size-5"} aria-hidden="true" />
              </span>
              <span className={cn(item.prominent && "font-semibold text-primary")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}

function getChromeTransition(reducedMotion: boolean) {
  if (reducedMotion) return { duration: 0 } as const;

  return {
    type: "spring",
    stiffness: 420,
    damping: 42,
    mass: 0.82,
  } as const;
}

function getProtectedDestinationDescription(key: MobileNavItem["key"], reason: ShellAuthReason) {
  if (reason === "suspended") return "در حال حاضر امکان انجام این کار وجود ندارد.";
  if (reason === "unverified" && key === "create") {
    return "برای افزودن مطلب، ابتدا ایمیل خود را تأیید کنید.";
  }
  if (key === "create") return "برای افزودن مطلب وارد حساب خود شوید.";
  return "برای دیدن حساب کاربری خود وارد شوید.";
}

function isHeaderContext(value: unknown): value is HeaderContext {
  if (!value || typeof value !== "object") return false;
  const context = value as Partial<HeaderContext>;
  return (
    typeof context.title === "string" &&
    typeof context.backHref === "string" &&
    context.backHref.startsWith("/") &&
    typeof context.backLabel === "string" &&
    typeof context.visible === "boolean"
  );
}

export { MobileAppShell };
