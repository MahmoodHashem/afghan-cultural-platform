import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatusPageProps = {
  /** Large handwritten mark, e.g. a Persian numeral code. */
  code?: string;
  eyebrow?: string;
  title: string;
  description: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  /** Calligraphic word written large behind the content (decorative). */
  word?: string;
  className?: string;
};

/**
 * Full-height navy band for 404 and error states: an arched niche with a lamp, a short message
 * and a few clear ways forward.
 */
function StatusPage({
  code,
  eyebrow,
  title,
  description,
  actions,
  children,
  word,
  className,
}: StatusPageProps) {
  return (
    <section
      className={cn(
        "relative isolate flex min-h-[78svh] items-center overflow-hidden bg-linear-155 from-hero-navy to-hero-navy-deep pt-[calc(4.125rem+3rem)] pb-16 text-white",
        className,
      )}
    >
      {word ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -end-[0.04em] -bottom-[0.3em] -z-10 font-calli text-[200px] leading-none whitespace-nowrap text-white opacity-[0.07] select-none max-lg:text-[120px]"
        >
          {word}
        </span>
      ) : null}

      <div className="content-container grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)]">
        <div className="max-w-2xl space-y-5">
          {eyebrow ? <p className="font-hand text-[20px] text-gold">{eyebrow}</p> : null}
          <h1 className="text-[30px] leading-[1.5] font-bold sm:text-[40px]">{title}</h1>
          <div className="max-w-[56ch] text-[15px] leading-[2.1] text-white/80">{description}</div>
          {actions ? <div className="flex flex-wrap items-center gap-3 pt-2">{actions}</div> : null}
          {children}
        </div>

        <div className="relative mx-auto hidden w-full max-w-xs lg:block" aria-hidden="true">
          <NicheLamp />
          {code ? (
            <span className="absolute inset-x-0 bottom-10 text-center font-hand text-[64px] leading-none text-gold/90">
              {code}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** Line drawing of an arched niche (mihrab-like alcove) with a hanging lamp. */
function NicheLamp() {
  return (
    <svg
      viewBox="0 0 240 320"
      className="w-full text-white/30"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 310 V140 C20 70 70 20 120 20 C170 20 220 70 220 140 V310" strokeWidth="1.5" />
      <path d="M40 310 V146 C40 88 80 44 120 44 C160 44 200 88 200 146 V310" strokeWidth="1" />
      <path d="M8 310 H232" strokeWidth="1.5" />
      <path d="M120 44 V96" strokeWidth="1" />
      <path
        d="M104 96 H136 L130 124 C128 132 112 132 110 124 Z"
        className="text-gold"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="120" cy="112" r="4" className="fill-gold/60" stroke="none" />
      <path d="M100 150 C110 140 130 140 140 150" className="text-gold/50" stroke="currentColor" />
    </svg>
  );
}

export { StatusPage };
