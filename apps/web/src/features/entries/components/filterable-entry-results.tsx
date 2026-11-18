"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizePersianSearch } from "@/lib/utils/persian";
import type { EntryListResponse } from "../types/public-entry";
import type { EntryBreadcrumbContext } from "../utils/entry-breadcrumb";
import { AnimatedEntryGrid } from "./animated-entry-grid";
import { type FilterTabItem, FilterTabs } from "./filter-tabs";

type FilterableEntryResultsProps = {
  tabsAriaLabel: string;
  tabs: FilterTabItem[];
  entries: EntryListResponse["data"];
  emptyState: {
    title: string;
    description: string;
    actionHref: string;
    actionLabel: string;
  };
  breadcrumbParent: EntryBreadcrumbContext;
  pagination: ReactNode;
};

function FilterableEntryResults({
  tabsAriaLabel,
  tabs,
  entries,
  emptyState,
  breadcrumbParent,
  pagination,
}: FilterableEntryResultsProps) {
  const [search, setSearch] = useState("");
  const normalizedSearch = normalizePersianSearch(search);
  const filteredEntries = useMemo(() => {
    if (!normalizedSearch) {
      return entries;
    }

    return entries.filter((entry) => normalizeEntrySearchText(entry).includes(normalizedSearch));
  }, [entries, normalizedSearch]);

  if (entries.length === 0) {
    return <EntryResultsEmptyState {...emptyState} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs ariaLabel={tabsAriaLabel} items={tabs} className="min-w-0 lg:flex-1" />
        <label htmlFor="entry-filter-search" className="relative block w-full lg:w-72">
          <span className="sr-only">جست‌وجو در نتایج</span>
          <MagnifyingGlassIcon
            className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-faint"
            aria-hidden="true"
          />
          <Input
            id="entry-filter-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جست‌وجو در نتایج..."
            className="h-11 pr-10 md:text-[13px]"
          />
        </label>
      </div>

      {filteredEntries.length > 0 ? (
        <AnimatedEntryGrid entries={filteredEntries} breadcrumbParent={breadcrumbParent} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-card border-[1.5px] border-dashed border-line p-8 text-center"
        >
          <p className="text-card-title text-ink">مطلبی پیدا نشد</p>
          <p className="mx-auto mt-2 max-w-xl text-[14px] leading-8 text-copy">
            با این جست‌وجو نتیجه‌ای در فهرست فعلی پیدا نشد.
          </p>
        </motion.div>
      )}

      {normalizedSearch ? null : pagination}
    </div>
  );
}

function EntryResultsEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: FilterableEntryResultsProps["emptyState"]) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={
        <Link href={actionHref} className={buttonVariants({ variant: "pill" })}>
          {actionLabel}
        </Link>
      }
    />
  );
}

function normalizeEntrySearchText(entry: EntryListResponse["data"][number]) {
  return normalizePersianSearch(
    [
      entry.title,
      entry.summary,
      entry.province?.name,
      entry.category.name,
      entry.contentType.name,
      ...entry.tags.map((tag) => tag.name),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export { FilterableEntryResults };
