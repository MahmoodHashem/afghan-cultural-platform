"use client";

import { motion } from "motion/react";
import Link from "next/link";

import { Tabs, TabsList } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatPersianNumber } from "./public-entry-card";

type FilterTabItem = {
  value: string;
  label: string;
  href: string;
  isActive: boolean;
  count?: number;
};

type FilterTabsProps = {
  ariaLabel: string;
  items: FilterTabItem[];
};

function FilterTabs({ ariaLabel, items }: FilterTabsProps) {
  const activeValue = items.find((item) => item.isActive)?.value ?? items[0]?.value ?? "";

  return (
    <Tabs value={activeValue} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <TabsList
        variant="default"
        className="relative h-auto min-h-11 w-max justify-start gap-1 rounded-full border border-border bg-card p-1 shadow-[0_2px_10px_rgba(0,0,0,.04)]"
        aria-label={ariaLabel}
      >
        {items.map((item) => (
          <Link
            key={item.value}
            href={item.href}
            scroll={false}
            role="tab"
            aria-selected={item.isActive}
            aria-current={item.isActive ? "page" : undefined}
            className={cn(
              "relative inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-[13px] font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40",
              item.isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.isActive ? (
              <motion.span
                layoutId="taxonomy-filter-active-tab"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                aria-hidden="true"
              />
            ) : null}
            <span className="relative z-10">{item.label}</span>
            {typeof item.count === "number" ? (
              <span
                className={cn(
                  "relative z-10 rounded-full px-2 py-0.5 text-[11px]",
                  item.isActive ? "bg-white/18 text-white" : "bg-muted text-muted-foreground",
                )}
              >
                {formatPersianNumber(item.count)}
              </span>
            ) : null}
          </Link>
        ))}
      </TabsList>
    </Tabs>
  );
}

export type { FilterTabItem };
export { FilterTabs };
