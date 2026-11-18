import { PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import { PageHero } from "@/components/common/page-hero";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formatPersianNumber } from "@/lib/utils/formatters";
import type { PublicEntryListQuery } from "../api/public-entries-api";
import type { EntryListResponse, TaxonomyItem } from "../types/public-entry";
import { createExploreHref } from "../utils/explore-query";
import { ExploreResultsPanel } from "./explore-results-panel";

type ExploreContentProps = {
  entries: EntryListResponse;
  taxonomy: {
    provinces: TaxonomyItem[];
    categories: TaxonomyItem[];
    contentTypes: TaxonomyItem[];
    tags: TaxonomyItem[];
    isUnavailable: boolean;
  };
  query: Required<Pick<PublicEntryListQuery, "page" | "limit" | "sort">> &
    Omit<PublicEntryListQuery, "page" | "limit" | "sort">;
  isEntriesUnavailable: boolean;
};

function ExploreContent({ entries, taxonomy, query, isEntriesUnavailable }: ExploreContentProps) {
  const breadcrumbParent = {
    label: "مطالب",
    href: createExploreHref(query, {}),
  };

  const rangeStart = entries.meta.total === 0 ? 0 : (entries.meta.page - 1) * query.limit + 1;
  const rangeEnd = Math.min(entries.meta.page * query.limit, entries.meta.total);

  return (
    <main className="min-h-screen bg-paper">
      <PageHero
        breadcrumb={
          <PageBreadcrumb
            tone="onDark"
            items={[{ label: "خانه", href: "/" }, { label: "مطالب" }]}
          />
        }
        eyebrow="بایگانی میراث"
        title="مطالب فرهنگی افغانستان"
        description="نوشته‌هایی درباره‌ی ولایت‌ها، مشاهیر، بناهای تاریخی، آیین‌ها و دانش محلی؛ با جست‌وجو و فیلترها آنچه را می‌خواهید پیدا کنید، یا روایت خودتان را بیفزایید."
        word="مطالب"
        actions={
          <>
            <Link href="/entries/new" className={buttonVariants({ variant: "pill", size: "lg" })}>
              <PlusIcon data-icon="inline-start" aria-hidden="true" />
              افزودن مطلب تازه
            </Link>
            <span className="text-[13px] text-white/70">
              {formatPersianNumber(entries.meta.total)} مطلب در بایگانی
            </span>
          </>
        }
      />

      <section className="content-container py-8 sm:py-10">
        <div className="space-y-6">
          {isEntriesUnavailable || taxonomy.isUnavailable ? <ApiNotice /> : null}
          <ExploreResultsPanel
            entries={entries.data}
            total={entries.meta.total}
            taxonomy={taxonomy}
            query={query}
            breadcrumbParent={breadcrumbParent}
          />

          <ExplorePagination
            meta={entries.meta}
            query={query}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
          />
        </div>
      </section>
    </main>
  );
}

function ExplorePagination({
  meta,
  query,
  rangeStart,
  rangeEnd,
}: {
  meta: EntryListResponse["meta"];
  query: ExploreContentProps["query"];
  rangeStart: number;
  rangeEnd: number;
}) {
  if (meta.totalPages <= 1) {
    return null;
  }

  const paginationItems = createPaginationItems(meta.page, meta.totalPages);

  return (
    <div className="flex flex-col gap-4 pt-4 sm:flex-row-reverse sm:items-center sm:justify-between">
      <p className="text-center text-[12px] text-faint sm:text-start">
        نمایش {formatPersianNumber(rangeStart)}–{formatPersianNumber(rangeEnd)} از{" "}
        {formatPersianNumber(meta.total)} مطلب
      </p>

      <Pagination className="mx-0 w-auto justify-start">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={createExploreHref(query, { page: Math.max(1, meta.page - 1) })}
              scroll
              aria-disabled={meta.page <= 1}
              tabIndex={meta.page <= 1 ? -1 : undefined}
              className={meta.page <= 1 ? "pointer-events-none opacity-50" : undefined}
            />
          </PaginationItem>

          {paginationItems.map((item) =>
            typeof item === "number" ? (
              <PaginationItem key={item}>
                <PaginationLink
                  href={createExploreHref(query, { page: item })}
                  scroll
                  isActive={item === meta.page}
                  aria-label={`صفحه ${formatPersianNumber(item)}`}
                >
                  {formatPersianNumber(item)}
                </PaginationLink>
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationEllipsis />
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              href={createExploreHref(query, {
                page: Math.min(meta.totalPages, meta.page + 1),
              })}
              scroll
              aria-disabled={meta.page >= meta.totalPages}
              tabIndex={meta.page >= meta.totalPages ? -1 : undefined}
              className={
                meta.page >= meta.totalPages ? "pointer-events-none opacity-50" : undefined
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

function createPaginationItems(currentPage: number, totalPages: number) {
  const visiblePages = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages])]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
  const items: Array<number | string> = [];

  for (const page of visiblePages) {
    const previousPage = items.at(-1);

    if (typeof previousPage === "number" && page - previousPage === 2) {
      items.push(previousPage + 1);
    } else if (typeof previousPage === "number" && page - previousPage > 2) {
      items.push(`ellipsis-${previousPage}-${page}`);
    }

    items.push(page);
  }

  return items;
}

function ApiNotice() {
  return (
    <div className="rounded-bubble-sm border border-saffron/30 bg-tint-sand px-4 py-3 text-[13.5px] leading-7 text-saffron-deep dark:text-gold">
      فعلاً بخشی از مطالب در دسترس نیست. کمی بعد دوباره تلاش کنید.
    </div>
  );
}

export { ExploreContent };
