import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SectionHeadProps = {
  title: ReactNode;
  /** One evocative word written behind the title in calligraphy (decorative, hidden from assistive tech). */
  word?: string;
  /** Optional "see all" link shown at the inline-end. */
  action?: { href: string; label: string };
  /** Heading level; sections on a page are h2 by default. */
  as?: "h1" | "h2" | "h3";
  /** `band` renders white on the red feature band. */
  tone?: "default" | "band";
  /** `prose` is the smaller heading used inside articles and profiles. */
  size?: "section" | "prose";
  id?: string;
  className?: string;
};

/**
 * Section header from the reference design: a red pill bar, the title, a calligraphic watermark
 * word behind it and an optional "see all" pill.
 */
function SectionHead({
  title,
  word,
  action,
  as: Heading = "h2",
  tone = "default",
  size = "section",
  id,
  className,
}: SectionHeadProps) {
  const isBand = tone === "band";
  const isProse = size === "prose";

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-4", className)}>
      <Heading
        id={id}
        className={cn(
          "bar-reveal relative isolate font-bold before:absolute before:inset-s-0 before:rounded-full",
          isProse
            ? "ps-4 text-[19px] leading-[2] before:top-[calc(50%-10px)] before:h-5 before:w-[5px]"
            : "ps-5 text-section-title before:top-[calc(50%-13px)] before:h-6.5 before:w-2",
          isBand ? "text-white before:bg-white" : "text-ink before:bg-brand",
        )}
      >
        {word ? (
          <span
            aria-hidden="true"
            className={cn(
              "calli-reveal pointer-events-none absolute top-1/2 -z-10 -translate-y-1/2 font-calli leading-none font-normal whitespace-nowrap select-none",
              isProse ? "inset-s-7 text-[40px]" : "inset-s-9 text-[54px] max-sm:text-[42px]",
              isBand ? "text-white opacity-[0.12]" : "text-ink opacity-[0.07]",
            )}
          >
            {word}
          </span>
        ) : null}
        {title}
      </Heading>

      {action ? (
        <Link
          href={action.href}
          className={cn(
            buttonVariants({ variant: "more", size: "sm" }),
            "h-9 px-4 text-[13px]",
            isBand &&
              "border-white/40 bg-transparent text-white hover:border-white hover:bg-white/12",
          )}
        >
          {action.label}
          <ChevronLeftIcon data-icon="inline-end" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

export { SectionHead };
