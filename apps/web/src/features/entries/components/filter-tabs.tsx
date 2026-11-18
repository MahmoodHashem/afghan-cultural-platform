"use client";

import { motion } from "motion/react";
import Link from "next/link";

import { Tabs, TabsList } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatPersianNumber } from "@/lib/utils/formatters";

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
  className?: string;
};

function FilterTabs({ ariaLabel, items, className }: FilterTabsProps) {
  const activeValue = items.find((item) => item.isActive)?.value ?? items[0]?.value ?? "";

  return (
    <Tabs
      value={activeValue}
      className={cn("-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0", className)}
    >
      <TabsList
        variant="default"
        className="relative h-auto min-h-11 w-max justify-start gap-1 rounded-full border border-line bg-paper p-1"
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
              "relative inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-[13px] font-bold outline-none transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              item.isActive
                ? "text-primary-foreground"
                : "text-copy hover:text-brand-ink",
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
                  "relative z-10 rounded-full px-2 text-[11px] leading-[1.9] font-bold",
                  item.isActive ? "bg-black/18 text-white" : "bg-line-soft text-faint",
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
