import type { ReactNode } from "react";

import { BUBBLE_PATH } from "@/components/brand/mirasaf-logo";
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
  /** `missing` for 404 (one bubble drifted away), `error` for failures (bubbles pulled apart). */
  illustration?: "missing" | "error";
  className?: string;
};

/**
 * Full-height navy band for 404 and error states: the logo's story bubbles told as a small
 * scene, a short message and a few clear ways forward.
 */
function StatusPage({
  code,
  eyebrow,
  title,
  description,
  actions,
  children,
  word,
  illustration = "missing",
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
          <BubbleScene variant={illustration} />
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

/** Bright tile colours of the logo, for use on the navy band. */
const TILE_COLOURS = ["#6b8fd0", "#2bb3a3", "#ef4257", "#e7b458"] as const;

/**
 * The logo's four story bubbles, told as a small scene:
 * - `missing` (404): three bubbles in place, the fourth drifted away, its spot left as an outline.
 * - `error`: all four pulled slightly apart, waiting to come back together.
 */
function BubbleScene({ variant }: { variant: "missing" | "error" }) {
  const spread = variant === "error" ? 9 : 0;
  const offsets = [
    [-spread, -spread],
    [spread, -spread],
    [spread, spread],
    [-spread, spread],
  ] as const;

  return (
    <svg viewBox="0 0 240 300" className="w-full overflow-visible">
      <g transform="translate(36 28) scale(1.68)">
        {TILE_COLOURS.map((colour, index) => {
          const [x, y] = offsets[index];
          const isDrifted = variant === "missing" && index === 3;

          return isDrifted ? (
            <path
              key={colour}
              d={BUBBLE_PATH}
              transform={`rotate(${index * 90} 50 50)`}
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.35"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
          ) : (
            <path
              key={colour}
              d={BUBBLE_PATH}
              fill={colour}
              transform={`translate(${x} ${y}) rotate(${index * 90} 50 50)`}
            />
          );
        })}

        {variant === "missing" ? (
          <g transform="translate(-17 24) rotate(-14 27 73)">
            <path d={BUBBLE_PATH} fill={TILE_COLOURS[3]} transform="rotate(270 50 50)" />
          </g>
        ) : (
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.25"
            strokeWidth="0.8"
            strokeDasharray="2 4"
          />
        )}

        <circle cx="50" cy="50" r="4.5" fill="#ffffff" opacity={variant === "error" ? 0.6 : 1} />
      </g>
    </svg>
  );
}

export { StatusPage };
