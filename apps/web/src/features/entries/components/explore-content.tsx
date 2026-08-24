import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
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

  return (
    <main className="min-h-screen bg-background ">
      <section className="border-b border-border bg-card pt-22 pb-7 sm:pt-26 sm:pb-8">
        <div className="content-container">
          <div className="max-w-3xl space-y-4">
            <PageBreadcrumb items={[{ label: "خانه", href: "/" }, { label: "مطالب" }]} />
          </div>
        </div>
      </section>

      <section className="content-container  gap-6 py-6 sm:py-7">
        <div className="space-y-6">
          {isEntriesUnavailable || taxonomy.isUnavailable ? <ApiNotice /> : null}
          <ExploreResultsPanel
            entries={entries.data}
            total={entries.meta.total}
            taxonomy={taxonomy}
            query={query}
            breadcrumbParent={breadcrumbParent}
          />

          <ExplorePagination meta={entries.meta} query={query} />
        </div>
      </section>
    </main>
  );
}

function ExplorePagination({
  meta,
  query,
}: {
  meta: EntryListResponse["meta"];
  query: ExploreContentProps["query"];
}) {
  if (meta.totalPages <= 1) {
    return null;
  }

  const paginationItems = createPaginationItems(meta.page, meta.totalPages);

  return (
    <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-[14px] text-muted-foreground sm:text-start">
        صفحه {formatPersianNumber(meta.page)} از {formatPersianNumber(meta.totalPages)}
      </p>

      <Pagination className="mx-0 w-auto sm:justify-end">
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
    <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-[14px] leading-7 text-warning">
      فعلاً بخشی از مطالب در دسترس نیست. کمی بعد دوباره تلاش کنید.
    </div>
  );
}

export { ExploreContent };
