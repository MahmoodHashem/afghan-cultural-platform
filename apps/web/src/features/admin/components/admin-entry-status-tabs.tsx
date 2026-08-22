"use client";

import { motion, useReducedMotion } from "motion/react";

import {
  adminEntryStatusMeta,
  adminEntryStatusOrder,
} from "@/features/admin/constants/admin-entry-meta";
import type { AdminEntryStatusCount } from "@/features/admin/types/admin-entries";
import type { AdminEntryStatus } from "@/features/admin/types/admin-users";
import { cn } from "@/lib/utils";
import { formatPersianNumber } from "@/lib/utils/formatters";

function AdminEntryStatusTabs({
  value,
  counts,
  disabled,
  onChange,
}: {
  value?: AdminEntryStatus;
  counts: AdminEntryStatusCount[];
  disabled: boolean;
  onChange: (value: AdminEntryStatus | undefined) => void;
}) {
  const reducedMotion = useReducedMotion();
  const countMap = new Map(counts.map((item) => [item.status, item.count]));
  const total = counts.reduce((sum, item) => sum + item.count, 0);
  const items: Array<{ value?: AdminEntryStatus; label: string; count: number }> = [
    { label: "همه", count: total },
    ...adminEntryStatusOrder.map((status) => ({
      value: status,
      label: adminEntryStatusMeta[status].shortLabel,
      count: countMap.get(status) ?? 0,
    })),
  ];

  return (
    <div
      className="flex gap-1 overflow-x-auto border-b border-border px-3 [scrollbar-width:thin]"
      role="tablist"
      aria-label="وضعیت مطالب"
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value ?? "ALL"}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(item.value)}
            className={cn(
              "relative flex h-12 shrink-0 items-center gap-2 px-3 text-[12px] font-medium text-muted-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              active && "text-primary",
            )}
          >
            <span className="relative z-10">{item.label}</span>
            <span className="relative z-10 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {formatPersianNumber(item.count)}
            </span>
            {active ? (
              <motion.span
                layoutId="admin-entry-status-indicator"
                className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary"
                transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export { AdminEntryStatusTabs };
