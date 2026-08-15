"use client";

import {
  Bars3Icon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { type SafeUser, useAuthStore } from "@/stores/auth-store";

type HeroSlide = {
  src: string;
  alt: string;
  eyebrow: string;
};

const heroSlides: HeroSlide[] = [
  {
    src: "/images/gunbads2.jpg",
    alt: "گنبدهای فیروزه‌ای مسجدی در میان خانه‌های کوهپایه‌ای افغانستان",
    eyebrow: "گنبدهای فیروزه‌ای و زندگی شهری",
  },
  {
    src: "/images/bamyan.jpg",
    alt: "صخره‌ها و جایگاه‌های تاریخی بودا در بامیان با کشتزارهای سبز در پیش‌زمینه",
    eyebrow: "چشم‌انداز تاریخی بامیان",
  },
  {
    src: "/images/gunbad.jpg",
    alt: "نمای نزدیک از گنبد فیروزه‌ای و مناره‌های یک مسجد تاریخی",
    eyebrow: "معماری اسلامی و کاشی‌کاری",
  },
  {
    src: "/images/HERAT02.jpg",
    alt: "حیاط و ایوان کاشی‌کاری‌شده مسجد جامع هرات",
    eyebrow: "مسجد جامع هرات",
  },
  {
    src: "/images/kabul.jpg",
    alt: "نمای مسجدی در کابل با کوه و خانه‌های دامنه‌ای در پس‌زمینه",
    eyebrow: "کابل؛ شهر، کوه و نیایش",
  },
  {
    src: "/images/mazar.jpg",
    alt: "زیارتگاه فیروزه‌ای روضه شریف در مزار شریف با مردم در صحن",
    eyebrow: "مزار شریف و روضه شریف",
  },
  {
    src: "/images/menaras.jpg",
    alt: "مناره‌های تاریخی هرات در چشم‌انداز شهر و کوه‌های پیرامون",
    eyebrow: "مناره‌های تاریخی هرات",
  },
];

const navigationItems = [
  { label: "خانه", href: "/" },
  { label: "کاوش محتوا", href: "/explore" },
  { label: "ولایت‌ها", href: "/provinces" },
  { label: "دسته‌بندی‌ها", href: "/categories" },
];

function HomeHero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6500);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
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
  }, []);

  return (
    <section className="relative min-h-[90svh] overflow-hidden bg-foreground text-white">
      <HeroCarousel activeSlide={activeSlide} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/65" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_42%,rgba(214,168,75,0.22),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.56),transparent_62%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent via-background/30 to-background" />

      <LandingHeader isCompact={isHeaderCompact} />

      <div className="relative z-10 flex min-h-[76svh] items-end">
        <div className="mx-auto w-full max-w-7xl px-5 pb-14 pt-32 sm:px-8 sm:pb-16 lg:px-10 lg:pb-20">
          <fieldset className="mt-10 flex items-center gap-2">
            <legend className="sr-only">تصاویر شاخص</legend>
            {heroSlides.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => setActiveSlide(index)}
                className={cn(
                  "h-1.5 rounded-full bg-white/40 transition-all duration-300 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/35",
                  activeSlide === index ? "w-10 bg-white" : "w-5 hover:bg-white/70",
                )}
                aria-label={`نمایش تصویر ${index + 1}`}
                aria-current={activeSlide === index}
              />
            ))}
          </fieldset>
        </div>
      </div>
    </section>
  );
}

function HeroCarousel({ activeSlide }: { activeSlide: number }) {
  return (
    <div className="absolute inset-0">
      {heroSlides.map((slide, index) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={index === 0}
          sizes="100vw"
          className={cn(
            "object-cover transition-opacity duration-1000 ease-out",
            activeSlide === index ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
    </div>
  );
}

function LandingHeader({ isCompact }: { isCompact: boolean }) {
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
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative h-auto rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3",
                isCompact
                  ? "px-3 py-1.5 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring/40"
                  : "px-3 py-2 text-[14px] text-white/84 hover:bg-transparent hover:text-white focus-visible:ring-white/35",
              )}
            >
              {item.label}
              {item.href === "/" && !isCompact ? (
                <span className="absolute inset-x-5 -bottom-1 h-0.5 rounded-full bg-white/72" />
              ) : null}
            </Link>
          ))}
        </Menubar>

        <HeaderSearch
          isCompact={isCompact}
          className="hidden lg:flex"
          inputClassName={cn(
            isCompact
              ? "text-[13px] placeholder:text-foreground text-foreground"
              : "text-[14px] placeholder:text-background text-background",
          )}
        />

        <HeaderSearch
          isCompact
          placeholder="جست‌وجو..."
          className="flex min-w-0 flex-1 lg:hidden"
          inputClassName="text-[13px] text-foreground placeholder:text-muted-foreground"
        />

        <div className="ms-auto hidden lg:block">
          <HeroAuthControls isCompact={isCompact} />
        </div>
        <MobileNavigation isCompact={isCompact} />
      </nav>
    </header>
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
  const [isOpen, setIsOpen] = useState(false);
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = status === "authenticated" && Boolean(user);

  const closeMenu = () => setIsOpen(false);

  return (
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
            راهنمای سریع برای کاوش میراث فرهنگی افغانستان
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6">
          <nav className="space-y-2" aria-label="ناوبری موبایل">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="flex min-h-11 items-center rounded-xl border px-3 text-[15px] font-semibold text-foreground transition-colors hover:bg-card hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
              >
                {item.label}
              </Link>
            ))}
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
                  className={cn(buttonVariants({ variant: "default" }), "h-11 w-full rounded-full")}
                >
                  ایجاد محتوا
                </Link>
                <Link
                  href="/account"
                  onClick={closeMenu}
                  className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full rounded-full")}
                >
                  حساب کاربری
                </Link>
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
                  className={cn(buttonVariants({ variant: "default" }), "h-11 w-full rounded-full")}
                >
                  ثبت‌نام
                </Link>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function HeroAuthControls({ isCompact }: { isCompact: boolean }) {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  if (status === "initializing") {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center gap-3 text-[15px] font-semibold ms-auto rounded-full",
          isCompact ? "h-9 w-24 bg-muted" : "h-11 w-32 bg-white/75",
        )}
        aria-hidden="true"
      />
    );
  }

  if (status !== "authenticated" || !user) {
    return (
      <div className="flex shrink-0 items-center gap-3 text-[15px] font-semibold ms-auto">
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline" }), "text-foreground rounded-full")}
          >
            ورود
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants({ variant: "default" }), " rounded-full")}
          >
            ثبت‌نام
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2 ms-auto">
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
        ایجاد محتوا
      </Link>
      <ProfileMenu user={user} />
    </div>
  );
}

function ProfileMenu({ user }: { user: SafeUser }) {
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
      </DropdownMenuContent>
    </DropdownMenu>
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

export { HomeHero };
