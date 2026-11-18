import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeroProps = {
  title: ReactNode;
  /** Small line above the title (e.g. the archive or section name). */
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** Breadcrumb or back link rendered above everything. */
  breadcrumb?: ReactNode;
  /** Giant calligraphic word bleeding off the inline-end edge (decorative). */
  word?: string;
  /** Buttons, meta or search under the description. */
  actions?: ReactNode;
  /** Opposite column: an image, a picker or stats. Stacks above 1024px only. */
  aside?: ReactNode;
  /** Extra bottom padding when content (e.g. a matted figure) overlaps the hero. */
  overlap?: boolean;
  as?: "h1" | "h2";
  className?: string;
  children?: ReactNode;
};

const motifWords = ["فرهنگ", "میراث", "تاریخ", "سرزمین", "شعر"] as const;

/**
 * Navy page band used at the top of every inner page: breadcrumb, title, description and
 * actions in white, with calligraphy scattered faintly behind.
 */
function PageHero({
  title,
  eyebrow,
  description,
  breadcrumb,
  word,
  actions,
  aside,
  overlap = false,
  as: Heading = "h1",
  className,
  children,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden bg-linear-155 from-hero-navy to-hero-navy-deep text-white",
        // Page tops sit under the fixed site header (66px), so the band starts with that offset.
        "pt-[calc(4.125rem+2.5rem)] sm:pt-[calc(4.125rem+3rem)]",
        overlap ? "pb-60 sm:pb-64" : "pb-10 sm:pb-14",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 font-calli text-white opacity-[0.05] select-none"
      >
        <span className="absolute top-6 start-[8%] text-[72px] leading-none">
          {motifWords[0]}
        </span>
        <span className="absolute top-[40%] start-[38%] text-[56px] leading-none">
          {motifWords[1]}
        </span>
        <span className="absolute bottom-6 start-[22%] text-[64px] leading-none">
          {motifWords[2]}
        </span>
        <span className="absolute top-10 end-[30%] text-[48px] leading-none">{motifWords[3]}</span>
        <span className="absolute bottom-10 end-[48%] text-[44px] leading-none">
          {motifWords[4]}
        </span>
      </div>

      {word ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -end-[0.04em] -bottom-[0.25em] -z-10 font-calli text-[180px] leading-none whitespace-nowrap text-white opacity-[0.1] select-none max-lg:text-[120px]"
        >
          {word}
        </span>
      ) : null}

      <div className="content-container">
        {breadcrumb ? <div className="mb-6 text-white/60">{breadcrumb}</div> : null}

        <div
          className={cn(
            "grid items-center gap-8",
            aside ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]" : null,
          )}
        >
          <div className="max-w-3xl space-y-4">
            {eyebrow ? <div className="font-hand text-[20px] text-gold">{eyebrow}</div> : null}
            <Heading className="max-w-[26ch] text-display text-white">{title}</Heading>
            {description ? (
              <div className="max-w-[60ch] text-[15px] leading-[2] text-white/80">
                {description}
              </div>
            ) : null}
            {actions ? (
              <div className="flex flex-wrap items-center gap-3 pt-2">{actions}</div>
            ) : null}
          </div>
          {aside ? <div className="max-lg:order-first lg:justify-self-end">{aside}</div> : null}
        </div>

        {children}
      </div>
    </section>
  );
}

export { PageHero };
