import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

          <Pagination meta={entries.meta} query={query} />
        </div>
      </section>
    </main>
  );
}

function Pagination({
  meta,
  query,
}: {
  meta: EntryListResponse["meta"];
  query: ExploreContentProps["query"];
}) {
  if (meta.totalPages <= 1) {
    return null;
  }

  const previousPage = Math.max(1, meta.page - 1);
  const nextPage = Math.min(meta.totalPages, meta.page + 1);

  return (
    <nav
      className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between"
      aria-label="صفحه‌بندی"
    >
      <p className="text-[14px] text-muted-foreground">
        صفحه {formatNumber(meta.page)} از {formatNumber(meta.totalPages)}
      </p>
      <div className="flex gap-3">
        <Link
          href={createExploreHref(query, { page: previousPage })}
          scroll={false}
          aria-disabled={meta.page <= 1}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "rounded-full",
            meta.page <= 1 && "pointer-events-none opacity-50",
          )}
        >
          <ArrowRightIcon className="size-4" aria-hidden="true" />
          قبلی
        </Link>
        <Link
          href={createExploreHref(query, { page: nextPage })}
          scroll={false}
          aria-disabled={meta.page >= meta.totalPages}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "rounded-full",
            meta.page >= meta.totalPages && "pointer-events-none opacity-50",
          )}
        >
          بعدی
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </nav>
  );
}

function ApiNotice() {
  return (
    <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-[14px] leading-7 text-warning">
      فعلاً بخشی از مطالب در دسترس نیست. کمی بعد دوباره تلاش کنید.
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-AF").format(value);
}

export { ExploreContent };
