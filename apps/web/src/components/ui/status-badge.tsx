import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { type StatusTone, statusToneClasses } from "@/components/ui/status-tone";
import { cn } from "@/lib/utils";

/** Pill status label driven by a semantic tone instead of raw palette colours. */
function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: StatusTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn("font-bold", statusToneClasses[tone], className)}>
      {children}
    </Badge>
  );
}

export { StatusBadge };
