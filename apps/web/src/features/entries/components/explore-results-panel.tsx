"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { MagnifyingGlassIcon } from "@/components/icons/animated/magnifying-glass";
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
import { EngagementAccessProvider } from "@/features/engagement/components/engagement-access-provider";
import { useAnimatedIcon } from "@/hooks/use-animated-icon";
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
  const hasLeadCard = query.page === 1 && entries.length >= 4;

  return (
    <div className="space-y-5">
      <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-20 -mx-1 flex items-center gap-3 bg-background/92 px-1 py-2 backdrop-blur-md lg:top-16.5">
        <ExploreSearchBar query={query} />
        <SortSegment query={query} />
      </div>

      <div className="hidden md:block">
        <ExploreFilterForm taxonomy={taxonomy} query={query} variant="bar" autoApply />
      </div>

      <ExploreToolbar query={query} taxonomy={taxonomy} total={total} />

      {entries.length > 0 ? (
        <EngagementAccessProvider>
          <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {entries.map((entry, index) => {
                const isLead = hasLeadCard && index === 0;

                return (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className={cn("min-w-0", isLead && "sm:col-span-2")}
                  >
                    <PublicEntryCardView
                      entry={entry}
                      imageIndex={index}
                      breadcrumbParent={breadcrumbParent}
                      variant={isLead ? "lead" : "default"}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </EngagementAccessProvider>
      ) : (
        <EmptySearchState isSearching={isSearching} search={query.search} />
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
  const { iconRef, triggerProps } = useAnimatedIcon();

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
    <div className="min-w-0 flex-1 md:max-w-[420px]">
      <label
        htmlFor={searchInputId}
        aria-busy={isPending}
        {...triggerProps}
        className="group flex h-11.5 flex-1 items-center gap-2.5 rounded-control border-[1.5px] border-line bg-paper px-3.5 transition-[border-color,background-color,box-shadow] duration-200 focus-within:border-ring focus-within:bg-surface focus-within:shadow-focus"
      >
        <MagnifyingGlassIcon
          ref={iconRef}
          size={20}
          className="shrink-0 text-faint transition-colors group-focus-within:text-brand-ink"
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
          className="h-full border-0 bg-transparent px-0 shadow-none focus-visible:border-transparent focus-visible:bg-transparent focus-visible:shadow-none"
        />
        {searchValue ? (
          <button
            type="button"
            onClick={() => setSearchValue("")}
            className="grid size-8 shrink-0 place-items-center rounded-full text-faint transition-colors hover:bg-line-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
    <div className="border-b border-line-soft px-1 pb-3">
      <div className="flex items-center justify-between gap-3 md:hidden">
        <p className="shrink-0 text-[14px] font-bold text-ink">
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

      <div className="hidden min-h-9 items-center justify-between gap-3 md:flex">
        <div className="flex flex-wrap items-center gap-2">
          <ActiveFilterChips query={query} taxonomy={taxonomy} />
          <ClearFiltersLink query={query} />
        </div>
        <p className="shrink-0 text-[13px] text-faint">
          <span className="font-bold text-ink">{formatPersianNumber(total)}</span> مطلب
        </p>
      </div>
    </div>
  );
}

/** Desktop sort as a segmented pill control (reference "pa-sort"); mobile keeps the select. */
function SortSegment({ query }: { query: NormalizedExploreQuery }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <fieldset
      className="hidden shrink-0 items-center gap-1 rounded-full border border-line bg-paper p-1 md:inline-flex"
      aria-busy={isPending}
    >
      <legend className="sr-only">مرتب‌سازی</legend>
      {sortOptions.map((option) => {
        const isActive = option.value === query.sort;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            disabled={isPending}
            onClick={() => {
              if (isActive) return;
              startTransition(() => {
                router.push(createExploreHref(query, { page: 1, sort: option.value }), {
                  scroll: false,
                });
              });
            }}
            className={cn(
              "h-9 rounded-full px-3.5 text-[12.5px] font-bold transition-colors duration-200 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-default",
              isActive ? "bg-primary text-primary-foreground" : "text-copy hover:text-brand-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </fieldset>
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
        <SelectTrigger className="h-10 min-w-0 rounded-full px-3.5 text-[12.5px] font-bold">
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
          className="group inline-flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Badge
            variant="chip"
            className="cursor-pointer gap-1.5 py-1 transition-colors group-hover:bg-brand-soft/70"
          >
            <span>{filter.value}</span>
            <XMarkIcon className="size-3.5 shrink-0" aria-hidden="true" />
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
      className="inline-flex items-center gap-1 rounded-full px-2 text-[12.5px] font-bold text-brand-ink transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <XMarkIcon className="size-4" aria-hidden="true" />
      حذف همه
    </Link>
  );
}

function EmptySearchState({ isSearching, search }: { isSearching: boolean; search?: string }) {
  return (
    <EmptyState
      title="نتیجه‌ای پیدا نشد"
      description={
        isSearching
          ? `مطلبی با «${search ?? ""}» پیدا نشد. واژه‌ی دیگری را بیازمایید، یا اگر درباره‌اش می‌دانید، نخستین نفری باشید که آن را می‌نویسد.`
          : "با این فیلترها چیزی پیدا نشد. فیلترها را تغییر دهید یا همه‌ی مطالب را ببینید."
      }
      action={
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link href="/explore" scroll={false} className={buttonVariants({ variant: "pill" })}>
            نمایش همه‌ی مطالب
          </Link>
          {isSearching ? (
            <Link href="/entries/new" className={buttonVariants({ variant: "outline" })}>
              نوشتن درباره‌ی این موضوع
            </Link>
          ) : null}
        </div>
      }
    />
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
