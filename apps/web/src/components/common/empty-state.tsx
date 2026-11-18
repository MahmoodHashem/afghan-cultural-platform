import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title?: ReactNode;
  description: ReactNode;
  /** One clear way out, usually a pill button that resets the filter. */
  action?: ReactNode;
  /** `niche` = arched alcove with a lamp (nothing here yet); `none` hides the drawing. */
  illustration?: "niche" | "none";
  size?: "default" | "compact";
  className?: string;
};

/**
 * Dashed placeholder for empty lists and searches. The line drawing is an arched niche
 * (mihrab-like alcove) with a hanging lamp, echoing the architecture featured on the site.
 */
function EmptyState({
  title,
  description,
  action,
  illustration = "niche",
  size = "default",
  className,
}: EmptyStateProps) {
  const isCompact = size === "compact";

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-card border-[1.5px] border-dashed border-line text-center text-copy",
        isCompact ? "px-5 py-7 text-[13px]" : "px-6 py-12 text-[14px]",
        className,
      )}
    >
      {illustration === "niche" ? <NicheDrawing compact={isCompact} /> : null}
      {title ? <p className="text-card-title text-ink">{title}</p> : null}
      <div className="max-w-[48ch] leading-[2]">{description}</div>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}

function NicheDrawing({ compact }: { compact: boolean }) {
  return (
    <svg
      viewBox="0 0 120 88"
      aria-hidden="true"
      className={cn("text-faint", compact ? "h-14 w-20" : "h-20 w-28")}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M30 80V40c0-17 13-30 30-30s30 13 30 30v40" strokeWidth="1.2" />
      <path d="M38 80V42c0-12 10-22 22-22s22 10 22 22v38" strokeWidth="0.9" opacity="0.6" />
      <path d="M18 80h84" strokeWidth="1.2" />
      <path d="M24 84h72" strokeWidth="0.8" strokeDasharray="1 4" opacity="0.6" />
      <path d="M60 22v20" strokeWidth="0.9" className="text-gold" stroke="currentColor" />
      <path
        d="M54 48c0-4 3-6 6-6s6 2 6 6l-2 6h-8z"
        strokeWidth="1"
        className="text-gold"
        stroke="currentColor"
      />
      <path d="M60 58v3" strokeWidth="1" className="text-gold" stroke="currentColor" />
    </svg>
  );
}

export { EmptyState };
