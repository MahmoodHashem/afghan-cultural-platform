"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

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
import { formatPersianNumber } from "@/lib/utils/formatters";
import { normalizePersianSearch } from "@/lib/utils/persian";
import { sortOptions } from "../constants/explore-options";
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
  const isSearching = Boolean(query.search);

  return (
    <div className="space-y-5">
      <ExploreSearchBar query={query} />
      <div className="hidden md:block">
        <div className="py-2">
          <ExploreFilterForm taxonomy={taxonomy} query={query} variant="bar" autoApply />
        </div>
      </div>

      <ExploreToolbar query={query} taxonomy={taxonomy} total={total} />

      {entries.length > 0 ? (
        <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {entries.map((entry, index) => (
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
        <EmptySearchState isSearching={isSearching} />
      )}
    </div>
  );
}

function ExploreSearchBar({ query }: { query: NormalizedExploreQuery }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(query.search ?? "");
  const lastNavigationSearch = useRef(normalizePersianSearch(query.search ?? ""));
  const searchInputId = "explore-result-search";
  const normalizedQuerySearch = normalizePersianSearch(query.search ?? "");

  useEffect(() => {
    if (normalizedQuerySearch === lastNavigationSearch.current) {
      return;
    }

    lastNavigationSearch.current = normalizedQuerySearch;
    setSearchValue(query.search ?? "");
  }, [normalizedQuerySearch, query.search]);

  useEffect(() => {
    const normalizedSearch = normalizePersianSearch(searchValue);

    if (normalizedSearch === normalizedQuerySearch) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      lastNavigationSearch.current = normalizedSearch;
      startTransition(() => {
        router.replace(
          createExploreHref(query, {
            page: 1,
            search: normalizedSearch || undefined,
          }),
          { scroll: false },
        );
      });
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [normalizedQuerySearch, query, router, searchValue]);

  return (
    <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-30 -mx-1 flex items-center bg-background/95 px-1 py-2 backdrop-blur-xl md:top-20 md:mx-0 md:px-0">
      <label
        htmlFor={searchInputId}
        aria-busy={isPending}
        className="group flex min-h-12 flex-1 items-center gap-3 rounded-xl border border-border bg-card px-4 transition-colors focus-within:border-primary focus-within:ring-3 focus-within:ring-ring/35"
      >
        <MagnifyingGlassIcon
          className="size-5 shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary"
          aria-hidden="true"
        />
        <span className="sr-only">جست‌وجو در نتایج</span>
        <Input
          id={searchInputId}
          type="search"
          maxLength={120}
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="جست‌وجوی مکان، مشاهیر، رسم یا موضوع..."
          className="h-10 border-0 bg-transparent px-0 text-[14px] shadow-none focus-visible:border-transparent focus-visible:ring-0"
        />
        {searchValue ? (
          <button
            type="button"
            onClick={() => setSearchValue("")}
            className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            aria-label="پاک کردن جست‌وجو"
          >
            <XMarkIcon className="size-4" aria-hidden="true" />
          </button>
        ) : null}
        {isPending ? <span className="sr-only">در حال جست‌وجو</span> : null}
      </label>
    </div>
  );
}

function ExploreToolbar({
  query,
  taxonomy,
  total,
}: {
  query: NormalizedExploreQuery;
  taxonomy: ExploreResultsPanelProps["taxonomy"];
  total: number;
}) {
  return (
    <div className="border-b border-border px-1 pt-1 pb-3">
      <div className="flex items-center justify-between gap-3 md:hidden">
        <p className="shrink-0 text-[14px] font-bold text-foreground">
          {formatPersianNumber(total)} مطلب
        </p>
        <div className="flex min-w-0 items-center gap-2">
          <SortSelect query={query} />
          <ExploreFilterSheet taxonomy={taxonomy} query={query} showTrigger={false} />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden">
        <ActiveFilterChips query={query} taxonomy={taxonomy} />
        <ClearFiltersLink query={query} />
      </div>

      <div className="hidden items-center justify-between gap-3 md:flex">
        <div className="flex items-center gap-3">
          <SortSelect query={query} />
          <ActiveFilterChips query={query} taxonomy={taxonomy} />
          <ClearFiltersLink query={query} />
        </div>
        <p className="text-[15px] font-bold text-foreground">{formatPersianNumber(total)} مطلب</p>
      </div>
    </div>
  );
}

function SortSelect({ query }: { query: NormalizedExploreQuery }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div>
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
        <SelectTrigger className="h-10 min-w-0 rounded-lg px-3 text-[12px] sm:text-[13px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start" alignItemWithTrigger={false}>
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

type ActiveFilterKey = "provinceSlug" | "categorySlug" | "contentTypeSlug" | "tagSlug";

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

function getRemoveFilterHref(query: NormalizedExploreQuery, key: ActiveFilterKey) {
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
      query.search ||
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
          ? "برای این جست‌وجو مطلبی پیدا نشد. عبارت دیگری را امتحان کنید."
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

export { ExploreResultsPanel };
