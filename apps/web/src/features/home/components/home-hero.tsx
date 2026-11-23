"use client";

import { ArrowLeftIcon, MapPinIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { PublicHeader } from "@/components/layout/public-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeroSlide = {
  src: string;
  alt: string;
  eyebrow: string;
};

/** Compressed hero photos (~2400px). Credits for each are in public/images/hero/CREDITS.md. */
const heroSlides: HeroSlide[] = [
  {
    src: "/images/hero/kabul-turquoise-domes.jpg",
    alt: "گنبدهای فیروزه‌ای مسجدی در میان خانه‌های کوهپایه‌ای کابل",
    eyebrow: "گنبدهای فیروزه‌ای و زندگی شهری",
  },
  {
    src: "/images/hero/band-e-amir.jpg",
    alt: "آب لاجوردی بند امیر و دیواره‌های صخره‌ای کرانه آن",
    eyebrow: "بند امیر، بامیان",
  },
  {
    src: "/images/hero/istalif-pottery.jpg",
    alt: "دکانی پر از کاسه‌ها و کوزه‌های سفالی فیروزه‌ای و سبز در استالف",
    eyebrow: "سفال فیروزه‌ای استالف",
  },
  {
    src: "/images/hero/bamyan-cliffs.jpg",
    alt: "صخره‌ها و جایگاه‌های تاریخی بودا در بامیان با کشتزارهای سبز در پیش‌زمینه",
    eyebrow: "چشم‌انداز تاریخی بامیان",
  },
  {
    src: "/images/hero/buzkashi.jpg",
    alt: "گروهی از چاپندازها بر اسب در کشاکش بزکشی",
    eyebrow: "بزکشی؛ بازی چاپندازها",
  },
  {
    src: "/images/provinces/nuristan.jpg",
    alt: "خانه‌های پلکانی روستای چیتراس بر دامنهٔ کوه در میان کشتزارهای سبز نورستان",
    eyebrow: "روستاهای پلکانی نورستان",
  },
  {
    src: "/images/hero/mazar-blue-mosque.jpg",
    alt: "زیارتگاه فیروزه‌ای روضه شریف در مزار شریف با مردم در صحن",
    eyebrow: "مزار شریف و روضه شریف",
  },
];

/** Everyday knowledge people carry without thinking of it as "heritage". Each opens the form. */
const contributionPrompts = [
  "قصه یا متلی که از بزرگان خانواده شنیده‌اید",
  "رسم عروسی، نوروز یا جشنی که در محل‌تان زنده است",
  "بنا، قلعه یا زیارتگاه قدیمی نزدیک خانه‌تان",
  "هنر یا پیشه‌ای دستی که کم‌کم فراموش می‌شود",
] as const;

const reassurances = ["به زبان ساده و خودتان", "بدون نیاز به تخصص", "بازبینی پیش از انتشار"];

/**
 * Home hero: a slow photo carousel of Afghan landmarks under a navy wash, with a message that
 * invites visitors to add what they know, not only to read.
 */
function HomeHero() {
  const [activeSlide, setActiveSlide] = useState(0);

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

  return (
    <>
      {/* Outside the isolated hero so its z-index competes with the page, not the hero. */}
      <PublicHeader variant="hero" />
      <section
        aria-labelledby="home-hero-title"
        className="relative isolate overflow-hidden bg-hero-navy-deep text-white"
      >
        <HeroCarousel activeSlide={activeSlide} />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-l from-hero-navy-deep/92 via-hero-navy-deep/70 to-hero-navy-deep/25"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-t from-hero-navy-deep/85 via-transparent to-hero-navy-deep/40"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[0.3em] -start-[0.05em] -z-10 font-calli text-[220px] leading-none whitespace-nowrap text-white opacity-[0.07] select-none max-lg:text-[140px]"
        >
          میراث
        </span>

        <div className="content-container relative grid min-h-[78svh] content-end gap-10 pt-24 pb-28 sm:min-h-[84svh] sm:pt-32 md:pb-32 lg:min-h-[88svh] lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:items-end lg:pb-36">
          <div className="max-w-2xl space-y-5">
            <p className="font-hand text-[20px] text-gold sm:text-[22px]">
              حافظه‌ی مشترک ما، به دست همه‌ی ما
            </p>
            <h1
              id="home-hero-title"
              className="text-[32px] leading-[1.45] font-bold text-white sm:text-[44px] lg:text-[50px]"
            >
              میراث افغانستان را با هم ثبت کنیم و زنده نگه داریم
            </h1>
            <p className="max-w-[56ch] text-[15px] leading-[2.1] text-white/82 sm:text-[16.5px]">
              هر قصه‌ای که از بزرگان شنیده‌اید، هر رسمی که در محل‌تان زنده است و هر جایی که می‌شناسید،
              تکه‌ای از حافظه‌ی مردم ماست. آن را بنویسید تا برای نسل‌های بعد بماند.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/entries/new"
                className={cn(buttonVariants({ variant: "pill" }), "h-12 px-6 text-[14.5px]")}
              >
                <PencilSquareIcon className="size-5" aria-hidden="true" />
                دانسته‌ی خود را ثبت کنید
              </Link>
              <Link href="/explore" className={cn(buttonVariants({ variant: "glass" }), "h-12")}>
                گشتی در بایگانی
                <ArrowLeftIcon className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <ul className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-[12.5px] text-white/70">
              {reassurances.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <PromptCard />
        </div>

        <div className="absolute inset-x-0 bottom-0">
          <div className="content-container flex items-center justify-between gap-4 pb-12 md:pb-16">
            <p className="flex min-w-0 items-center gap-1.5 truncate text-[12px] text-white/70">
              <MapPinIcon className="size-4 shrink-0 text-gold" aria-hidden="true" />
              {heroSlides[activeSlide]?.eyebrow}
            </p>
            <fieldset className="flex shrink-0 items-center gap-2">
              <legend className="sr-only">تصاویر شاخص</legend>
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.src}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={cn(
                    "h-1.5 rounded-full bg-white/35 transition-[width,background-color] duration-300 ease-expo outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                    activeSlide === index ? "w-9 bg-gold" : "w-4 hover:bg-white/70",
                  )}
                  aria-label={`نمایش تصویر ${index + 1}`}
                  aria-current={activeSlide === index}
                />
              ))}
            </fieldset>
          </div>
        </div>
      </section>
    </>
  );
}

/** Glass card of concrete prompts, so visitors see that what they already know counts. */
function PromptCard() {
  return (
    <div className="hidden rounded-bubble border border-white/16 bg-white/10 p-5 backdrop-blur-md lg:block">
      <p className="text-[15px] font-bold text-white">امروز چه چیزی را ثبت می‌کنید؟</p>
      <p className="mt-1 text-[12.5px] leading-[1.9] text-white/65">
        لازم نیست کتاب بنویسید؛ همین‌ها هم میراث‌اند:
      </p>
      <ul className="mt-4 space-y-2">
        {contributionPrompts.map((prompt) => (
          <li key={prompt}>
            <Link
              href="/entries/new"
              className="group flex items-center justify-between gap-3 rounded-[12px_12px_12px_4px] bg-white/8 px-3.5 py-2.5 text-[13px] leading-[1.8] text-white/88 outline-none transition-colors duration-200 hover:bg-white/16 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
            >
              {prompt}
              <ArrowLeftIcon
                className="size-4 shrink-0 text-gold transition-transform duration-200 group-hover:-translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HeroCarousel({ activeSlide }: { activeSlide: number }) {
  return (
    <div className="absolute inset-0 -z-20">
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

export { HomeHero };
