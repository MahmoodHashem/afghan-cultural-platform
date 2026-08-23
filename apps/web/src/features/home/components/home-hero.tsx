"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { PublicHeader } from "@/components/layout/public-header";
import { cn } from "@/lib/utils";

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
    <section className="relative min-h-[90svh] overflow-hidden bg-foreground text-white">
      <HeroCarousel activeSlide={activeSlide} />
      <div className="absolute inset-0 bg-linear-to-b from-black/45 via-black/20 to-black/65" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_42%,rgba(214,168,75,0.22),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.56),transparent_62%)]" />
    
      <PublicHeader variant="hero" />

      <div className="relative z-10 flex min-h-[76svh] items-end">
        <div className="mx-auto w-full max-w-7xl px-5 pt-32 pb-14 sm:px-8 sm:pb-16 lg:px-10 lg:pb-20">
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

export { HomeHero };
