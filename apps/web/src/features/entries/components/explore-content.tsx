import {
  AdjustmentsHorizontalIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  GeographicScope,
  PublicEntryListQuery,
  PublicEntrySort,
} from "../api/public-entries-api";
import type { EntryListResponse, PublicEntryCard, TaxonomyItem } from "../types/public-entry";

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

const fallbackImages = [
  "/images/HERAT02.jpg",
  "/images/bamyan.jpg",
  "/images/menaras.jpg",
  "/images/mazar.jpg",
] as const;

const sortOptions: Array<{ label: string; value: PublicEntrySort }> = [
  { label: "تازه‌ترین", value: "newest" },
  { label: "قدیمی‌ترین", value: "oldest" },
  { label: "اخیراً به‌روزرسانی‌شده", value: "recentlyUpdated" },
];

const geographicScopeOptions: Array<{ label: string; value: GeographicScope }> = [
  { label: "ولایت مشخص", value: "PROVINCE" },
  { label: "سراسر افغانستان", value: "NATIONAL" },
  { label: "بدون وابستگی جغرافیایی", value: "NONE" },
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
                <p className="text-[14px] font-bold text-primary">کاوش محتوا</p>
                <h1 className="text-[36px] font-bold leading-[1.35] text-foreground sm:text-[44px]">
                  کتابخانه عمومی میراث افغانستان
                </h1>
                <p className="max-w-3xl text-[16px] leading-8 text-muted-foreground">
                  مدخل‌های منتشرشده و تأییدشده را بر پایه ولایت، دسته‌بندی، نوع محتوا، برچسب و گستره
                  جغرافیایی مرور کنید.
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
              {formatNumber(entries.meta.total)} مدخل منتشرشده پیدا شد.
            </p>
            <ActiveFilterSummary query={query} />
          </div>

          {entries.data.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {entries.data.map((entry, index) => (
                <ExploreEntryCard key={entry.id} entry={entry} imageIndex={index} />
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
          <p className="text-[13px] text-muted-foreground">نتایج را دقیق‌تر کنید.</p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <NativeSelect label="ترتیب نمایش" name="sort" value={query.sort} options={sortOptions} />
        <NativeSelect
          label="گستره جغرافیایی"
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
          اعمال فیلتر
        </button>
        <Link
          href="/explore"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
        >
          پاک کردن فیلترها
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

function ExploreEntryCard({ entry, imageIndex }: { entry: PublicEntryCard; imageIndex: number }) {
  console.log("Entry ", entry);
  console.log("Publish date ", formatDate(entry.publishedAt))
  return (
    <Card className="group overflow-hidden rounded-2xl border-border bg-card p-0 shadow-[0_2px_10px_rgba(0,0,0,.04)]">
      <Link
        href={`/entries/${encodeURIComponent(entry.slug)}`}
        className="block outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <div className="relative aspect-4/3 overflow-hidden bg-muted">
          <Image
            src={
              entry.coverImage?.thumbnailUrl ??
              entry.coverImage?.secureUrl ??
              fallbackImages[imageIndex % fallbackImages.length]
            }
            alt={entry.coverImage?.altText ?? entry.title}
            fill
            sizes="(min-width: 1280px) 28vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full text-[12px]">
              {entry.category.name}
            </Badge>
            <Badge className="rounded-full bg-primary-light text-primary">
              {entry.contentType.name}
            </Badge>
          </div>
          <h2 className="line-clamp-2 text-[20px] font-bold leading-8 text-foreground">
            {entry.title}
          </h2>
          <p className="line-clamp-3 text-[14px] leading-7 text-muted-foreground">
            {entry.summary}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3 text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPinIcon className="size-4" aria-hidden="true" />
              {locationLabel(entry)}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDaysIcon className="size-4" aria-hidden="true" />
              {formatDate(entry.publishedAt)}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
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
      بخشی از داده‌های عمومی در دسترس نیست. لطفاً وضعیت API را بررسی کنید.
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[28px] border border-dashed border-border bg-card p-8 text-center">
      <p className="text-[20px] font-bold text-foreground">نتیجه‌ای پیدا نشد</p>
      <p className="mx-auto mt-3 max-w-xl text-[15px] leading-8 text-muted-foreground">
        فیلترها را تغییر دهید یا بعداً دوباره بررسی کنید؛ فقط مدخل‌های منتشرشده در این صفحه نمایش داده
        می‌شوند.
      </p>
      <Link
        href="/explore"
        className={cn(buttonVariants({ variant: "outline" }), "mt-5 rounded-full")}
      >
        نمایش همه محتوا
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

function locationLabel(entry: PublicEntryCard) {
  if (entry.geographicScope === "NATIONAL") {
    return "سراسر افغانستان";
  }

  if (entry.geographicScope === "NONE") {
    return "بدون وابستگی جغرافیایی";
  }

  return entry.province?.name ?? "ولایت مشخص";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-AF", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-AF").format(value);
}

export { ExploreContent };
