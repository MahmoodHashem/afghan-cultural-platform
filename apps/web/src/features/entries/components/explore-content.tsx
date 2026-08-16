import {
  AdjustmentsHorizontalIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  GeographicScope,
  PublicEntryListQuery,
  PublicEntrySort,
} from "../api/public-entries-api";
import type { EntryListResponse, TaxonomyItem } from "../types/public-entry";
import { PublicEntryCardView } from "./public-entry-card";

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

const sortOptions: Array<{ label: string; value: PublicEntrySort }> = [
  { label: "تازه‌ترین", value: "newest" },
  { label: "قدیمی‌ترین", value: "oldest" },
  { label: "آخرین ویرایش", value: "recentlyUpdated" },
];

const geographicScopeOptions: Array<{ label: string; value: GeographicScope }> = [
  { label: "وابسته به یک ولایت", value: "PROVINCE" },
  { label: "سراسر افغانستان", value: "NATIONAL" },
  { label: "بدون وابستگی به مکان", value: "NONE" },
];

function ExploreContent({ entries, taxonomy, query, isEntriesUnavailable }: ExploreContentProps) {
  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-card pt-24 pb-10 sm:pt-28">
        <div className="content-container">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div className="space-y-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[14px] font-semibold text-primary transition-colors hover:text-primary-hover"
              >
                <ArrowRightIcon className="size-4" aria-hidden="true" />
                بازگشت به خانه
              </Link>
              <div className="space-y-3">
                <p className="text-[14px] font-bold text-primary">مطالب فرهنگی</p>
                <h1 className="text-[36px] font-bold leading-[1.35] text-foreground sm:text-[44px]">
                  فرهنگ افغانستان
                </h1>
                <p className="max-w-3xl text-[16px] leading-8 text-muted-foreground">
                  مطالب را بر اساس ولایت، موضوع و نوع محتوا پیدا کنید.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="content-container grid gap-8 py-10 lg:grid-cols-[320px_1fr] lg:items-start">
        <aside className="lg:sticky lg:top-24">
          <ExploreFilters taxonomy={taxonomy} query={query} />
        </aside>

        <div className="space-y-6">
          {isEntriesUnavailable || taxonomy.isUnavailable ? <ApiNotice /> : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[14px] text-muted-foreground">
              {formatNumber(entries.meta.total)} مطلب
            </p>
            <ActiveFilterSummary query={query} />
          </div>

          {entries.data.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {entries.data.map((entry, index) => (
                <PublicEntryCardView key={entry.id} entry={entry} imageIndex={index} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}

          <Pagination meta={entries.meta} query={query} />
        </div>
      </section>
    </main>
  );
}

function ExploreFilters({
  taxonomy,
  query,
}: {
  taxonomy: ExploreContentProps["taxonomy"];
  query: ExploreContentProps["query"];
}) {
  return (
    <form
      action="/explore"
      className="rounded-[24px] border border-border bg-card p-5 shadow-[0_2px_10px_rgba(0,0,0,.04)]"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary-light text-primary">
          <AdjustmentsHorizontalIcon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-[18px] font-bold text-foreground">فیلترها</h2>
          <p className="text-[13px] text-muted-foreground">
            موضوع، ولایت و نوع محتوا را انتخاب کنید.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <NativeSelect label="ترتیب نمایش" name="sort" value={query.sort} options={sortOptions} />
        <NativeSelect
          label="محدوده جغرافیایی"
          name="geographicScope"
          value={query.geographicScope}
          options={geographicScopeOptions}
          placeholder="همه گستره‌ها"
        />
        <NativeSelect
          label="ولایت"
          name="provinceSlug"
          value={query.provinceSlug}
          options={taxonomy.provinces.map(toOption)}
          placeholder="همه ولایت‌ها"
        />
        <NativeSelect
          label="دسته‌بندی"
          name="categorySlug"
          value={query.categorySlug}
          options={taxonomy.categories.map(toOption)}
          placeholder="همه دسته‌بندی‌ها"
        />
        <NativeSelect
          label="نوع محتوا"
          name="contentTypeSlug"
          value={query.contentTypeSlug}
          options={taxonomy.contentTypes.map(toOption)}
          placeholder="همه انواع محتوا"
        />
        <NativeSelect
          label="برچسب"
          name="tagSlug"
          value={query.tagSlug}
          options={taxonomy.tags.map(toOption)}
          placeholder="همه برچسب‌ها"
        />
      </div>

      <div className="mt-5 grid gap-3">
        <button type="submit" className={cn(buttonVariants(), "rounded-full")}>
          نمایش نتایج
        </button>
        <Link
          href="/explore"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
        >
          حذف همه فیلترها
        </Link>
      </div>
    </form>
  );
}

function NativeSelect({
  label,
  name,
  value,
  options,
  placeholder = "همه",
}: {
  label: string;
  name: string;
  value?: string;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[14px] font-semibold text-foreground">{label}</span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-[14px] text-foreground outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-ring/35"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ActiveFilterSummary({ query }: { query: ExploreContentProps["query"] }) {
  const activeCount = [
    query.provinceSlug,
    query.categorySlug,
    query.contentTypeSlug,
    query.tagSlug,
    query.geographicScope,
  ].filter(Boolean).length;

  if (activeCount === 0) {
    return null;
  }

  return (
    <Badge className="w-fit rounded-full bg-primary-light text-primary">
      {formatNumber(activeCount)} فیلتر فعال
    </Badge>
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

function EmptyState() {
  return (
    <div className="rounded-[28px] border border-dashed border-border bg-card p-8 text-center">
      <p className="text-[20px] font-bold text-foreground">نتیجه‌ای پیدا نشد</p>
      <p className="mx-auto mt-3 max-w-xl text-[15px] leading-8 text-muted-foreground">
        با این فیلترها چیزی پیدا نشد. فیلترها را تغییر دهید.
      </p>
      <Link
        href="/explore"
        className={cn(buttonVariants({ variant: "outline" }), "mt-5 rounded-full")}
      >
        نمایش همه مطالب
      </Link>
    </div>
  );
}

function createExploreHref(
  query: ExploreContentProps["query"],
  updates: Partial<ExploreContentProps["query"]>,
) {
  const nextQuery = { ...query, ...updates };
  const searchParams = new URLSearchParams();

  setParam(searchParams, "page", nextQuery.page > 1 ? String(nextQuery.page) : undefined);
  setParam(searchParams, "sort", nextQuery.sort !== "newest" ? nextQuery.sort : undefined);
  setParam(searchParams, "provinceSlug", nextQuery.provinceSlug);
  setParam(searchParams, "categorySlug", nextQuery.categorySlug);
  setParam(searchParams, "contentTypeSlug", nextQuery.contentTypeSlug);
  setParam(searchParams, "tagSlug", nextQuery.tagSlug);
  setParam(searchParams, "geographicScope", nextQuery.geographicScope);

  const queryString = searchParams.toString();

  return queryString ? `/explore?${queryString}` : "/explore";
}

function setParam(searchParams: URLSearchParams, key: string, value: string | undefined) {
  if (value) {
    searchParams.set(key, value);
  }
}

function toOption(item: TaxonomyItem) {
  return {
    label: item.name,
    value: item.slug,
  };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-AF").format(value);
}

export { ExploreContent };
