"use client";

import { ChevronDownIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import { cn } from "@/lib/utils";
import { type SafeUser, useAuthStore } from "@/stores/auth-store";

type HeroSlide = {
  src: string;
  alt: string;
  eyebrow: string;
};

const heroSlides: HeroSlide[] = [
  {
    src: "/images/herat-grand-mosque.webp",
    alt: "نمایی از مسجد جامع هرات",
    eyebrow: "معماری و میراث هرات",
  },
  {
    src: "/images/arg.png",
    alt: "نمایی از ارگ تاریخی افغانستان",
    eyebrow: "دژها و روایت‌های تاریخی",
  },
  {
    src: "/images/menar.png",
    alt: "منار تاریخی در چشم‌انداز افغانستان",
    eyebrow: "نشانه‌های ماندگار فرهنگ",
  },
  {
    src: "/images/babur.png",
    alt: "باغ بابر و چشم‌انداز فرهنگی کابل",
    eyebrow: "باغ‌ها، کوه‌ها و خاطره‌ها",
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
    <section className="relative min-h-[76svh] overflow-hidden bg-foreground text-white">
      <HeroCarousel activeSlide={activeSlide} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/65" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_42%,rgba(214,168,75,0.22),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.56),transparent_62%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-background/30 to-background" />

      <LandingHeader isCompact={isHeaderCompact} />

      <div className="relative z-10 flex min-h-[76svh] items-end">
        <div className="mx-auto w-full max-w-[1280px] px-5 pb-14 pt-32 sm:px-8 sm:pb-16 lg:px-10 lg:pb-20">
          <div className="max-w-3xl space-y-6">
            <Badge
              variant="outline"
              className="border-white/20 bg-white/10 px-4 py-2 text-[14px] font-semibold text-white/88 backdrop-blur-md"
            >
              {heroSlides[activeSlide]?.eyebrow}
            </Badge>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-[clamp(2.35rem,6vw,5.4rem)] font-bold leading-[1.08] tracking-normal text-white drop-shadow-[0_3px_28px_rgba(0,0,0,0.35)]">
                میراث افغانستان را زنده، معتبر و دیدنی روایت کنیم
              </h1>
              <p className="max-w-2xl text-[17px] leading-9 text-white/82 sm:text-[19px]">
                جایی برای گردآوری روایت‌ها، بناها، آیین‌ها و دانش فرهنگی افغانستان؛ با نگاهی آرام،
                تصویری و شایسته تاریخ این سرزمین.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/explore"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 rounded-full px-7 shadow-[0_18px_45px_rgba(15,118,110,0.34)]",
                )}
              >
                کاوش میراث
              </Link>
              <Link
                href="#design-preview"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/24 bg-white/10 px-7 text-[15px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/18 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/35"
              >
                دیدن بنیاد طراحی
              </Link>
            </div>
          </div>
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
            ? "w-full max-w-[1040px] gap-2 border border-border bg-card px-3 py-1.5 text-foreground shadow-[0_12px_32px_rgba(31,41,55,0.1)]"
            : "w-full max-w-[1240px] gap-3 border border-transparent bg-transparent px-0 py-0 text-white drop-shadow-[0_3px_18px_rgba(0,0,0,0.34)]",
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
          میراث افغانستان
        </Link>

        <Menubar
          className={cn(
            "hidden h-auto border-0 bg-transparent p-0 shadow-none transition-all duration-500 lg:flex",
            isCompact ? "gap-0" : "gap-4 xl:gap-6",
          )}
        >
          {navigationItems.map((item) => (
            <MenubarMenu key={item.href}>
              <MenubarTrigger
                render={<Link href={item.href} />}
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
              </MenubarTrigger>
            </MenubarMenu>
          ))}
        </Menubar>

        <label
          className={cn(
            "hidden items-center gap-2.5 rounded-full border bg-white ps-4 pe-3 text-foreground shadow-[0_8px_24px_rgba(31,41,55,0.12)] transition-all duration-500 lg:flex",
            isCompact
              ? "h-9 min-w-[240px] max-w-[320px] border-border"
              : "h-11 min-w-[260px] flex-1 max-w-[380px] border-white/70",
          )}
        >
          <MagnifyingGlassIcon className="size-5 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">جست‌وجو</span>
          <input
            type="search"
            placeholder="جست‌وجوی فرهنگ، مکان، روایت..."
            className={cn(
              "h-full min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground",
              isCompact ? "text-[13px]" : "text-[14px]",
            )}
          />
        </label>

        <HeroAuthControls isCompact={isCompact} />
      </nav>
    </header>
  );
}

function HeroAuthControls({ isCompact }: { isCompact: boolean }) {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  if (status === "initializing") {
    return (
      <div
        className={cn(
          "hidden animate-pulse rounded-full sm:block",
          isCompact ? "h-9 w-24 bg-muted" : "h-11 w-32 bg-white/75",
        )}
        aria-hidden="true"
      />
    );
  }

  if (status !== "authenticated" || !user) {
    return (
      <div className="flex shrink-0 items-center gap-3 text-[15px] font-semibold">
        <Link
          href="/login"
          className={cn(
            "inline-flex items-center rounded-xl bg-white text-foreground shadow-[0_8px_24px_rgba(31,41,55,0.14)] transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-3",
            isCompact
              ? "h-9 px-3 text-[13px] focus-visible:ring-ring/40"
              : "h-11 px-4 text-[14px] focus-visible:ring-white/35",
          )}
        >
          ورود / ثبت‌نام
        </Link>
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
        className="flex h-11 items-center gap-1.5 rounded-full bg-background ps-2 pe-3 text-foreground shadow-[0_8px_24px_rgba(31,41,55,0.14)] outline-none transition-colors hover:bg-background/40 focus-visible:ring-3 focus-visible:ring-white/35"
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
