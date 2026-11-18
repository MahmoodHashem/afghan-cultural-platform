/**
 * Semantic tones for status chips, icon wells and dots. They replace raw Tailwind palette classes
 * (emerald-50, amber-700 …) so every status follows the design tokens in light and dark themes.
 */
type StatusTone = "neutral" | "info" | "warning" | "success" | "danger" | "muted";

/** Soft chip: tinted fill, matching border, readable text (AA in both themes). */
const statusToneClasses: Record<StatusTone, string> = {
  neutral: "border-line bg-line-soft text-copy",
  info: "border-lapis/20 bg-tint-navy text-lapis dark:text-copy",
  warning: "border-gold/40 bg-tint-sand text-saffron-deep dark:text-gold",
  success: "border-ok/25 bg-ok-soft text-ok",
  danger: "border-brand/25 bg-brand-soft text-brand-ink",
  muted: "border-line bg-paper text-faint",
};

/** Text-only tone for inline labels and icons. */
const statusToneTextClasses: Record<StatusTone, string> = {
  neutral: "text-copy",
  info: "text-lapis dark:text-copy",
  warning: "text-saffron-deep dark:text-gold",
  success: "text-ok",
  danger: "text-brand-ink",
  muted: "text-faint",
};

/** Solid marker for timeline dots and small indicators. */
const statusToneDotClasses: Record<StatusTone, string> = {
  neutral: "bg-faint",
  info: "bg-lapis dark:bg-copy",
  warning: "bg-gold",
  success: "bg-ok",
  danger: "bg-brand",
  muted: "bg-line",
};

export type { StatusTone };
export { statusToneClasses, statusToneDotClasses, statusToneTextClasses };
