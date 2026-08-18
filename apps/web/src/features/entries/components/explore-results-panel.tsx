"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { geographicScopeOptions, sortOptions } from "../constants/explore-options";
import type { EntryListResponse, TaxonomyItem } from "../types/public-entry";
import type { EntryBreadcrumbContext } from "../utils/entry-breadcrumb";
import { createExploreHref, type NormalizedExploreQuery } from "../utils/explore-query";
import { ExploreFilterForm } from "./explore-filter-form";
import { ExploreFilterSheet } from "./explore-filter-sheet";
import { PublicEntryCardView } from "./public-entry-card";

type ExploreResultsPanelProps = {
  entries: EntryListResponse["data"];
  total: number;
  taxonomy: {
    provinces: TaxonomyItem[];
    categories: TaxonomyItem[];
    contentTypes: TaxonomyItem[];
    tags: TaxonomyItem[];
  };
  query: NormalizedExploreQuery;
  breadcrumbParent: EntryBreadcrumbContext;
};

function ExploreResultsPanel({
  entries,
  total,
  taxonomy,
  query,
  breadcrumbParent,
}: ExploreResultsPanelProps) {
  const [searchValue, setSearchValue] = useState("");
  const normalizedSearch = normalizeSearch(searchValue);
  const filteredEntries = useMemo(
    () =>
      normalizedSearch
        ? entries.filter((entry) => entryMatchesSearch(entry, normalizedSearch))
        : entries,
    [entries, normalizedSearch],
  );

  return (
    <div className="space-y-5">
      <ExploreSearchBar
        query={query}
        searchValue={searchValue}
        taxonomy={taxonomy}
        onSearchChange={setSearchValue}
      />
      <div className="sticky top-20 z-30 hidden md:block">
        <div className="bg-background/90 py-2 backdrop-blur-md supports-backdrop-filter:bg-background/80">
          <ExploreFilterForm
            taxonomy={taxonomy}
            query={query}
            variant="bar"
            autoApply
          />
        </div>
      </div>

      <ExploreToolbar
        filteredCount={filteredEntries.length}
        isSearching={Boolean(normalizedSearch)}
        query={query}
        taxonomy={taxonomy}
        total={total}
      />

      {filteredEntries.length > 0 ? (
        <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <PublicEntryCardView
                  entry={entry}
                  imageIndex={index}
                  breadcrumbParent={breadcrumbParent}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <EmptySearchState isSearching={Boolean(normalizedSearch)} />
      )}
    </div>
  );
}

function ExploreSearchBar({
  query,
  searchValue,
  taxonomy,
  onSearchChange,
}: {
  query: NormalizedExploreQuery;
  searchValue: string;
  taxonomy: ExploreResultsPanelProps["taxonomy"];
  onSearchChange: (value: string) => void;
}) {
  const searchInputId = "explore-result-search";

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor={searchInputId}
        className="group flex min-h-12 flex-1 items-center gap-3 rounded-xl border border-border bg-card px-4 transition-colors focus-within:border-primary focus-within:ring-3 focus-within:ring-ring/35"
      >
        <MagnifyingGlassIcon
          className="size-5 shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary"
          aria-hidden="true"
        />
        <span className="sr-only">جست‌وجو در نتایج</span>
        <Input
          id={searchInputId}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="جست‌وجوی مکان، شخصیت، رسم یا موضوع..."
          className="h-10 border-0 bg-transparent px-0 text-[14px] shadow-none focus-visible:border-transparent focus-visible:ring-0"
        />
      </label>
      <div className="md:hidden">
        <ExploreFilterSheet taxonomy={taxonomy} query={query} />
      </div>
    </div>
  );
}

function ExploreToolbar({
  filteredCount,
  isSearching,
  query,
  taxonomy,
  total,
}: {
  filteredCount: number;
  isSearching: boolean;
  query: NormalizedExploreQuery;
  taxonomy: ExploreResultsPanelProps["taxonomy"];
  total: number;
}) {
  return (
    <div className="
    flex flex-col gap-3
    border-b border-border
    px-1 pb-3 pt-1
    lg:flex-row lg:items-center lg:justify-between
  ">
      <div className="flex items-center gap-3">
        <SortSelect query={query} />
        <ActiveFilterChips query={query} taxonomy={taxonomy} />
        <ClearFiltersLink query={query} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[15px] font-bold text-foreground">
          {isSearching
            ? `${formatNumber(filteredCount)} از ${formatNumber(total)} مطلب`
            : `${formatNumber(total)} مطلب`}
        </p>

      </div>
    </div>
  );
}

function SortSelect({ query }: { query: NormalizedExploreQuery }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
      <Select
        items={sortOptions}
        value={query.sort}
        disabled={isPending}
        onValueChange={(value) => {
          if (!value || value === query.sort) {
            return;
          }

          startTransition(() => {
            router.push(createExploreHref(query, { page: 1, sort: value }), { scroll: false });
          });
        }}
      >
        <SelectTrigger className="h-9 rounded-full border-border bg-background px-3">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end" alignItemWithTrigger={false}>
          <SelectGroup>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

type ActiveFilterKey =
  | "provinceSlug"
  | "categorySlug"
  | "contentTypeSlug"
  | "tagSlug";

type ActiveFilter = {
  key: ActiveFilterKey;
  value: string;
};

function ActiveFilterChips({
  query,
  taxonomy,
}: {
  query: NormalizedExploreQuery;
  taxonomy: ExploreResultsPanelProps["taxonomy"];
}) {
  const activeFilters = getActiveFilters(taxonomy, query);

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <>
      {activeFilters.map((filter) => (
        <Link
          key={filter.key}
          href={getRemoveFilterHref(query, filter.key)}
          scroll={false}
          aria-label={`حذف فیلتر ${filter.value}`}
          className="group inline-flex rounded-full focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <Badge
            variant="outline"
            className="
              cursor-pointer gap-1.5 rounded-full border-border
              bg-background px-2.5 py-1 text-[12px] font-medium
              text-foreground transition-colors
              group-hover:border-primary/30
              group-hover:bg-primary-light/35
              group-hover:text-primary
            "
          >
            <span>{filter.value}</span>

            <XMarkIcon
              className="
                size-3.5 shrink-0 text-muted-foreground
                transition-colors group-hover:text-primary
              "
              aria-hidden="true"
            />
          </Badge>
        </Link>
      ))}
    </>
  );
}

function getRemoveFilterHref(
  query: NormalizedExploreQuery,
  key: ActiveFilterKey,
) {
  switch (key) {

    case "provinceSlug":
      return createExploreHref(query, {
        page: 1,
        provinceSlug: undefined,
      });

    case "categorySlug":
      return createExploreHref(query, {
        page: 1,
        categorySlug: undefined,
      });

    case "contentTypeSlug":
      return createExploreHref(query, {
        page: 1,
        contentTypeSlug: undefined,
      });

    case "tagSlug":
      return createExploreHref(query, {
        page: 1,
        tagSlug: undefined,
      });
  }
}

function ClearFiltersLink({ query }: { query: NormalizedExploreQuery }) {
  const hasFilters = Boolean(
    query.provinceSlug ||
    query.categorySlug ||
    query.contentTypeSlug ||
    query.tagSlug ||
    query.geographicScope ||
    query.sort !== "newest",
  );

  if (!hasFilters) {
    return null;
  }

  return (
    <Link
      href="/explore"
      scroll={false}
      className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary transition-colors hover:text-primary-hover"
    >
      <XMarkIcon className="size-4" aria-hidden="true" />
      حذف همه
    </Link>
  );
}

function EmptySearchState({ isSearching }: { isSearching: boolean }) {
  return (
    <div className="rounded-[26px] border border-dashed border-border bg-card p-8 text-center">
      <p className="text-[20px] font-bold text-foreground">نتیجه‌ای پیدا نشد</p>
      <p className="mx-auto mt-3 max-w-xl text-[15px] leading-8 text-muted-foreground">
        {isSearching
          ? "در نتایج فعلی چیزی با این جست‌وجو پیدا نشد."
          : "با این فیلترها چیزی پیدا نشد. فیلترها را تغییر دهید."}
      </p>
      <Link
        href="/explore"
        scroll={false}
        className={cn(buttonVariants({ variant: "outline" }), "mt-5 rounded-full")}
      >
        نمایش همه مطالب
      </Link>
    </div>
  );
}

function entryMatchesSearch(
  entry: ExploreResultsPanelProps["entries"][number],
  normalizedSearch: string,
) {
  const searchableText = [
    entry.title,
    entry.summary,
    entry.province?.name,
    entry.category.name,
    entry.contentType.name,
    ...entry.tags.map((tag) => tag.name),
  ]
    .filter(Boolean)
    .join(" ");

  return normalizeSearch(searchableText).includes(normalizedSearch);
}

function normalizeSearch(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("fa-AF")
    .replaceAll("ي", "ی")
    .replaceAll("ك", "ک")
    .replace(/\s+/g, " ");
}

function getActiveFilters(
  taxonomy: ExploreResultsPanelProps["taxonomy"],
  query: NormalizedExploreQuery,
) {
  const filters: ActiveFilter[] = [];

  addActiveFilter(filters, "provinceSlug", query.provinceSlug, (value) =>
    findTaxonomyName(taxonomy.provinces, value),
  );
  addActiveFilter(filters, "categorySlug", query.categorySlug, (value) =>
    findTaxonomyName(taxonomy.categories, value),
  );
  addActiveFilter(filters, "contentTypeSlug", query.contentTypeSlug, (value) =>
    findTaxonomyName(taxonomy.contentTypes, value),
  );
  addActiveFilter(filters, "tagSlug", query.tagSlug, (value) =>
    findTaxonomyName(taxonomy.tags, value),
  );

  return filters;
}

function addActiveFilter(
  filters: ActiveFilter[],
  key: ActiveFilterKey,
  rawValue: string | undefined,
  getLabel: (value: string) => string | undefined,
) {
  if (!rawValue) {
    return;
  }

  filters.push({
    key,
    value: getLabel(rawValue) ?? rawValue,
  });
}

function findTaxonomyName(items: TaxonomyItem[], slug: string) {
  return items.find((item) => item.slug === slug)?.name;
}

function findOptionLabel(options: Array<{ label: string; value: string }>, value: string) {
  return options.find((option) => option.value === value)?.label;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-AF").format(value);
}

export { ExploreResultsPanel };
