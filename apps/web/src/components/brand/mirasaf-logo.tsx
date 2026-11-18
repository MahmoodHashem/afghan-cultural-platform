import { cn } from "@/lib/utils";

type LogoTone = "color" | "onDark" | "mono";

/**
 * "Four voices, one tile": four speech bubbles (each with one sharp corner) in the Persian-tile
 * colourways meet at a shared centre and together read as one tile. Many people's stories,
 * one heritage.
 */
const BUBBLE_PATH = "M26 7H31Q47 7 47 23V47H23Q7 47 7 31V26Q7 7 26 7Z";

/** Fills per tone: lapis, turquoise, red, gold, centre dot. `color` follows dark mode. */
const toneFills: Record<LogoTone, [string, string, string, string, string]> = {
  color: [
    "fill-[#27477e] dark:fill-[#6b8fd0]",
    "fill-[#0f6f66] dark:fill-[#2bb3a3]",
    "fill-[#e0253c] dark:fill-[#ef4257]",
    "fill-[#dfa63e] dark:fill-[#e7b458]",
    "fill-ink",
  ],
  onDark: ["fill-[#6b8fd0]", "fill-[#2bb3a3]", "fill-[#ef4257]", "fill-[#e7b458]", "fill-white"],
  mono: ["fill-current", "fill-current", "fill-current", "fill-current", "fill-current"],
};

type LogoMarkProps = {
  tone?: LogoTone;
  className?: string;
};

/** Decorative mark; give the surrounding link or element the accessible name. */
function LogoMark({ tone = "color", className }: LogoMarkProps) {
  const [lapis, turquoise, red, gold, centre] = toneFills[tone];

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("size-9 shrink-0", className)}
      aria-hidden="true"
      focusable="false"
    >
      <path d={BUBBLE_PATH} className={lapis} />
      <path d={BUBBLE_PATH} className={turquoise} transform="rotate(90 50 50)" />
      <path d={BUBBLE_PATH} className={red} transform="rotate(180 50 50)" />
      <path d={BUBBLE_PATH} className={gold} transform="rotate(270 50 50)" />
      <circle cx="50" cy="50" r="4.5" className={centre} />
    </svg>
  );
}

type LogoProps = {
  tone?: Exclude<LogoTone, "mono">;
  /** Hide the tagline (small sizes). */
  withTagline?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Hide the words below this breakpoint, keeping only the mark. */
  wordmarkClassName?: string;
};

const LOGO_TAGLINE = "روایت‌های ما، میراث ما";

const sizeStyles = {
  sm: { mark: "size-8", name: "text-[15px]", tagline: "text-[10px]" },
  md: { mark: "size-9.5", name: "text-[17px]", tagline: "text-[10.5px]" },
  lg: { mark: "size-14", name: "text-[24px]", tagline: "text-[13px]" },
} as const;

/** Mark + Persian wordmark (+ tagline). Text uses the site font so it matches the UI. */
function Logo({
  tone = "color",
  withTagline = true,
  size = "md",
  className,
  wordmarkClassName,
}: LogoProps) {
  const styles = sizeStyles[size];
  const onDark = tone === "onDark";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark tone={tone} className={styles.mark} />
      <span className={cn("flex flex-col leading-none", wordmarkClassName)}>
        <span className={cn("font-bold", styles.name, onDark ? "text-white" : "text-ink")}>
          میراث افغانستان
        </span>
        {withTagline ? (
          <span
            className={cn(
              "mt-1.5 font-medium",
              styles.tagline,
              onDark ? "text-gold" : "text-saffron dark:text-gold",
            )}
          >
            {LOGO_TAGLINE}
          </span>
        ) : null}
      </span>
    </span>
  );
}

export { BUBBLE_PATH, LOGO_TAGLINE, Logo, LogoMark };
