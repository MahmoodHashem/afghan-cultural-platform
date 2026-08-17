import {
  AcademicCapIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  BuildingLibraryIcon,
  BuildingStorefrontIcon,
  CakeIcon,
  ChatBubbleLeftRightIcon,
  PaintBrushIcon,
  PuzzlePieceIcon,
  SparklesIcon,
  TagIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EntryListResponse, TaxonomyItem } from "../types/public-entry";
import type { EntryBreadcrumbContext } from "../utils/entry-breadcrumb";
import { getProvinceImage } from "../utils/province-images";
import { AnimatedEntryGrid } from "./animated-entry-grid";
import { FilterTabs } from "./filter-tabs";
import { ProvinceSearchGrid } from "./province-search-grid";
import { formatPersianNumber } from "./public-entry-card";

type CountedTaxonomyItem = TaxonomyItem & {
  entryCount: number;
};

type TaxonomyFilterItem = CountedTaxonomyItem & {
  href: string;
  isActive: boolean;
};

type SortOption = {
  label: string;
  value: "newest" | "oldest" | "recentlyUpdated";
  href: string;
  isActive: boolean;
};

type ProvinceIndexContentProps = {
  provinces: CountedTaxonomyItem[];
  isUnavailable: boolean;
};

type ProvinceDetailContentProps = {
  province: TaxonomyItem;
  entries: EntryListResponse;
  categoryFilters: TaxonomyFilterItem[];
  allCategoriesHref: string;
  isAllCategoriesActive: boolean;
  createPageHref: (page: number) => string;
  isUnavailable: boolean;
};

type CategoriesIndexContentProps = {
  categories: CountedTaxonomyItem[];
  isUnavailable: boolean;
};

type CategoryDetailContentProps = {
  category: CountedTaxonomyItem;
  entries: EntryListResponse;
  provinceFilters: TaxonomyFilterItem[];
  allAfghanistanHref: string;
  nationalHref: string;
  isAllAfghanistanActive: boolean;
  isNationalActive: boolean;
  nationalCount: number;
  sortOptions: SortOption[];
  createPageHref: (page: number) => string;
  isUnavailable: boolean;
};

const categoryDescriptions: Record<string, string> = {
  "historical-places": "بناها، شهرها، آرامگاه‌ها و دیگر مکان‌های تاریخی افغانستان.",
  "traditions-and-customs": "رسم‌ها، آیین‌ها و شیوه‌های زندگی در بخش‌های مختلف افغانستان.",
  food: "خوراک‌های محلی، شیوه‌های پخت و رسم‌های مربوط به غذا و سفره.",
  clothing: "پوشاک محلی، شیوه‌های دوخت و هنرهای وابسته به لباس.",
  handicrafts: "هنرها و مهارت‌های دستی رایج در بخش‌های مختلف افغانستان.",
  music: "سازها، آوازها و موسیقی محلی و شهری افغانستان.",
  "poetry-and-literature": "شاعران، نویسندگان، آثار ادبی و ادبیات زبان‌های مختلف افغانستان.",
  "oral-stories": "قصه‌ها، خاطره‌ها و روایت‌هایی که سینه‌به‌سینه نقل شده‌اند.",
  "festivals-and-ceremonies": "جشن‌ها، مراسم و آیین‌های جمعی در بخش‌های مختلف افغانستان.",
  "languages-and-expressions": "زبان‌ها، گویش‌ها، اصطلاحات و تعبیرهای رایج در مناطق مختلف افغانستان.",
  architecture: "سبک‌های معماری، شیوه‌های ساخت و جزئیات بناهای بومی و تاریخی.",
  "cultural-objects": "اشیا و ابزارهایی که در زندگی و فرهنگ مردم کاربرد یا معنای ویژه دارند.",
  "local-games": "بازی‌ها و سرگرمی‌های محلی در مناطق مختلف افغانستان.",
  "traditional-occupations": "پیشه‌ها و مهارت‌های سنتی که بخشی از زندگی و اقتصاد محلی بوده‌اند.",
};

const categoryIconBySlug: Record<string, ComponentType<{ className?: string }>> = {
  "historical-places": BuildingLibraryIcon,
  "traditions-and-customs": ChatBubbleLeftRightIcon,
  food: CakeIcon,
  clothing: SparklesIcon,
  handicrafts: PaintBrushIcon,
  music: AcademicCapIcon,
  "poetry-and-literature": BookOpenIcon,
  "oral-stories": ChatBubbleLeftRightIcon,
  "festivals-and-ceremonies": UserGroupIcon,
  "languages-and-expressions": BookOpenIcon,
  architecture: BuildingStorefrontIcon,
  "cultural-objects": SparklesIcon,
  "local-games": PuzzlePieceIcon,
  "traditional-occupations": WrenchScrewdriverIcon,
};

const categoryToneClasses = [
  "bg-primary-light text-primary",
  "bg-[#F8EEE8] text-terracotta",
  "bg-[#FFF7E6] text-[#8A6117]",
  "bg-[#EEF2F0] text-[#55746A]",
] as const;

function ProvinceIndexContent({ provinces, isUnavailable }: ProvinceIndexContentProps) {
  return (
    <main className="min-h-screen bg-background">
      <section className="content-container relative overflow-hidden pt-32 pb-16 sm:pt-36">
        <DecorativeMark className="-start-10 top-24" />
        <PageBreadcrumb
          className="relative z-10 mb-8"
          items={[{ label: "خانه", href: "/" }, { label: "ولایت‌ها" }]}
        />
        <PageIntro
          eyebrow="ولایت‌ها"
          title="فرهنگ افغانستان بر اساس ولایت"
          subtitle="با فرهنگ و میراث ولایت‌های افغانستان آشنا شوید."
        />

        {isUnavailable ? <ApiNotice /> : null}

        {provinces.length > 0 ? (
          <ProvinceSearchGrid provinces={provinces} />
        ) : (
          <EmptyState
            title="نمایش ولایت‌ها ممکن نشد"
            description="کمی بعد دوباره تلاش کنید."
            actionHref="/"
            actionLabel="بازگشت به خانه"
          />
        )}
      </section>
    </main>
  );
}

function ProvinceDetailContent({
  province,
  entries,
  categoryFilters,
  allCategoriesHref,
  isAllCategoriesActive,
  createPageHref,
  isUnavailable,
}: ProvinceDetailContentProps) {
  const provinceHref = taxonomyItemHref("/provinces", province);

  return (
    <main className="min-h-screen bg-background">
      <section className="content-container pt-30 pb-16 sm:pt-34">
        <PageBreadcrumb
          items={[
            { label: "خانه", href: "/" },
            { label: "ولایت‌ها", href: "/provinces" },
            { label: province.name },
          ]}
        />

        <div className="mt-7 grid gap-7 rounded-[28px] border border-border bg-card p-5 shadow-[0_2px_10px_rgba(0,0,0,.04)] sm:p-7 lg:grid-cols-[1fr_420px] lg:items-center">
          <div className="space-y-5">
            <div className="space-y-3">
              <h1 className="text-[38px] font-bold leading-[1.35] text-primary sm:text-[44px]">
                {province.name}
              </h1>
              <p className="max-w-2xl text-[16px] leading-8 text-muted-foreground">
                مطالب مربوط به {province.name} را ببینید.
              </p>
            </div>
            <StatsCards
              items={[
                { label: "مطلب", value: entries.meta.total },
                { label: "موضوع فعال", value: categoryFilters.length },
              ]}
            />
          </div>

          <ProvinceHeroImage province={province} />
        </div>

        <section className="mt-10 space-y-6">
          <div className="text-center">
            <h2 className="text-[24px] font-bold text-foreground sm:text-[28px]">
              فرهنگ و میراث {province.name}
            </h2>
          </div>

          <FilterTabs
            ariaLabel="فیلتر موضوع‌های ولایت"
            items={[
              {
                value: "all",
                href: allCategoriesHref,
                isActive: isAllCategoriesActive,
                label: "همه",
              },
              ...categoryFilters.map((category) => ({
                value: category.slug,
                href: category.href,
                isActive: category.isActive,
                label: category.name,
                count: category.entryCount,
              })),
            ]}
          />

          {isUnavailable ? <ApiNotice /> : null}

          <EntryGrid
            entries={entries}
            emptyKind="province"
            createPageHref={createPageHref}
            breadcrumbParent={[
              { label: "ولایت‌ها", href: "/provinces" },
              { label: province.name, href: provinceHref },
            ]}
          />
        </section>
      </section>
    </main>
  );
}

function CategoriesIndexContent({ categories, isUnavailable }: CategoriesIndexContentProps) {
  return (
    <main className="min-h-screen bg-background">
      <section className="content-container relative overflow-hidden pt-32 pb-16 sm:pt-36">
        <DecorativeMark className="-end-10 top-24" />
        <PageBreadcrumb
          className="relative z-10 mb-8"
          items={[{ label: "خانه", href: "/" }, { label: "موضوع‌ها" }]}
        />
        <PageIntro
          eyebrow="موضوع‌ها"
          title="مطالب بر اساس موضوع"
          subtitle="مطالب فرهنگی افغانستان را بر اساس موضوع ببینید."
        />

        {isUnavailable ? <ApiNotice /> : null}

        {categories.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => (
              <CategoryCard key={category.id} category={category} toneIndex={index} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="هنوز موضوعی برای نمایش در دسترس نیست."
            description="کمی بعد دوباره تلاش کنید."
            actionHref="/explore"
            actionLabel="دیدن مطالب"
          />
        )}
      </section>
    </main>
  );
}

function CategoryDetailContent({
  category,
  entries,
  provinceFilters,
  allAfghanistanHref,
  nationalHref,
  isAllAfghanistanActive,
  isNationalActive,
  nationalCount,
  sortOptions,
  createPageHref,
  isUnavailable,
}: CategoryDetailContentProps) {
  const categoryHref = taxonomyItemHref("/categories", category);

  return (
    <main className="min-h-screen bg-background">
      <section className="content-container pt-30 pb-16 sm:pt-34">
        <PageBreadcrumb
          items={[
            { label: "خانه", href: "/" },
            { label: "موضوع‌ها", href: "/categories" },
            { label: category.name },
          ]}
        />

        <div className="mt-7 grid gap-7 rounded-[28px] border border-border bg-card p-5 shadow-[0_2px_10px_rgba(0,0,0,.04)] sm:p-7 lg:grid-cols-[1fr_320px] lg:items-center">
          <div className="space-y-4">
            <div className="space-y-3">
              <h1 className="text-[36px] font-bold leading-[1.35] text-foreground sm:text-[42px]">
                {category.name}
              </h1>
              <p className="max-w-2xl text-[16px] leading-8 text-muted-foreground">
                {getCategoryDescription(category)}
              </p>
            </div>
            <p className="text-[14px] font-semibold text-primary">
              {formatPersianNumber(category.entryCount)} مطلب
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[24px] border border-border bg-muted p-6">
            <DecorativeMark className="-end-8 -top-8 opacity-[0.08]" />
            <CategoryIcon category={category} toneIndex={0} className="size-7" />
            <p className="mt-5 text-[15px] leading-8 text-muted-foreground">
              مطالب این موضوع از سراسر افغانستان
            </p>
          </div>
        </div>

        <section className="mt-10 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h2 className="text-[22px] font-bold text-foreground">بر اساس ولایت</h2>
              <p className="text-[14px] leading-7 text-muted-foreground">
                «سراسری» شامل مطالبی است که به ولایت خاصی وابسته نیستند.
              </p>
            </div>
            <SortLinks options={sortOptions} />
          </div>

          <FilterTabs
            ariaLabel="فیلتر ولایت‌های موضوع"
            items={[
              {
                value: "all",
                href: allAfghanistanHref,
                isActive: isAllAfghanistanActive,
                label: "همه افغانستان",
              },
              {
                value: "national",
                href: nationalHref,
                isActive: isNationalActive,
                label: "سراسری",
                count: nationalCount,
              },
              ...provinceFilters.map((province) => ({
                value: province.slug,
                href: province.href,
                isActive: province.isActive,
                label: province.name,
                count: province.entryCount,
              })),
            ]}
          />

          {isUnavailable ? <ApiNotice /> : null}

          <EntryGrid
            entries={entries}
            emptyKind="category"
            createPageHref={createPageHref}
            breadcrumbParent={[
              { label: "موضوع‌ها", href: "/categories" },
              { label: category.name, href: categoryHref },
            ]}
          />
        </section>
      </section>
    </main>
  );
}

function PageIntro({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="relative z-10 mx-auto max-w-3xl text-center">
      <p className="text-[14px] font-bold text-primary">{eyebrow}</p>
      <h1 className="mt-3 text-[34px] font-bold leading-[1.35] text-foreground sm:text-[42px]">
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-2xl text-[16px] leading-8 text-muted-foreground">
        {subtitle}
      </p>
    </div>
  );
}

function CategoryCard({
  category,
  toneIndex,
}: {
  category: CountedTaxonomyItem;
  toneIndex: number;
}) {
  return (
    <Card className="group rounded-2xl border-border bg-card shadow-[0_2px_10px_rgba(0,0,0,.04)] transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_14px_34px_rgba(31,41,55,0.08)]">
      <Link
        href={taxonomyItemHref("/categories", category)}
        className="block h-full outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <CardContent className="flex h-full flex-col p-5">
          <CategoryIcon category={category} toneIndex={toneIndex} />
          <h2 className="mt-5 text-[20px] font-bold text-foreground">{category.name}</h2>
          <p className="mt-2 line-clamp-3 text-[14px] leading-7 text-muted-foreground">
            {getCategoryDescription(category)}
          </p>
          <p className="mt-auto pt-5 text-[13px] font-semibold text-primary">
            {formatPersianNumber(category.entryCount)} مطلب
          </p>
        </CardContent>
      </Link>
    </Card>
  );
}

function CategoryIcon({
  category,
  toneIndex,
  className,
}: {
  category: TaxonomyItem;
  toneIndex: number;
  className?: string;
}) {
  const Icon = categoryIconBySlug[category.slug] ?? TagIcon;
  const toneClass = categoryToneClasses[toneIndex % categoryToneClasses.length];

  return (
    <span className={cn("inline-flex size-12 items-center justify-center rounded-2xl", toneClass)}>
      <Icon className={cn("size-6", className)} aria-hidden="true" />
    </span>
  );
}

function ProvinceHeroImage({ province }: { province: TaxonomyItem }) {
  const image = getProvinceImage(province);

  return (
    <div className="relative min-h-[220px] overflow-hidden rounded-[24px] bg-muted lg:min-h-[260px]">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="(min-width: 1024px) 420px, 100vw"
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-linear-to-l from-background/0 via-background/5 to-background/45" />
    </div>
  );
}

function StatsCards({ items }: { items: Array<{ label: string; value: number }> }) {
  return (
    <dl className="grid max-w-md grid-cols-2 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-border bg-background px-4 py-3 text-center"
        >
          <dt className="text-[12px] font-medium text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 text-[22px] font-bold text-foreground">
            {formatPersianNumber(item.value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function EntryGrid({
  entries,
  emptyKind,
  createPageHref,
  breadcrumbParent,
}: {
  entries: EntryListResponse;
  emptyKind: "province" | "category";
  createPageHref: (page: number) => string;
  breadcrumbParent: EntryBreadcrumbContext;
}) {
  if (entries.data.length === 0) {
    return (
      <EmptyState
        title={
          emptyKind === "province"
            ? "هنوز مطلبی برای این ولایت منتشر نشده است."
            : "هنوز مطلبی در این بخش منتشر نشده است."
        }
        description={
          emptyKind === "province"
            ? "اگر درباره فرهنگ و تاریخ این ولایت چیزی می‌دانید، می‌توانید آن را ثبت کنید."
            : "اگر درباره این موضوع چیزی می‌دانید، می‌توانید آن را ثبت کنید."
        }
        actionHref="/entries/new"
        actionLabel="افزودن مطلب"
      />
    );
  }

  return (
    <>
      <AnimatedEntryGrid entries={entries.data} breadcrumbParent={breadcrumbParent} />
      <Pagination meta={entries.meta} createPageHref={createPageHref} />
    </>
  );
}

function SortLinks({ options }: { options: SortOption[] }) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="مرتب‌سازی">
      {options.map((option) => (
        <Link
          key={option.value}
          href={option.href}
          scroll={false}
          aria-current={option.isActive ? "page" : undefined}
          className={cn(
            "rounded-full border px-3 py-2 text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
            option.isActive
              ? "border-primary bg-primary-light text-primary"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </Link>
      ))}
    </nav>
  );
}

function Pagination({
  meta,
  createPageHref,
}: {
  meta: EntryListResponse["meta"];
  createPageHref: (page: number) => string;
}) {
  if (meta.totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between"
      aria-label="صفحه‌بندی"
    >
      <p className="text-[14px] text-muted-foreground">
        صفحه {formatPersianNumber(meta.page)} از {formatPersianNumber(meta.totalPages)}
      </p>
      <div className="flex gap-3">
        <PageRelativeLink
          href={createPageHref(Math.max(1, meta.page - 1))}
          disabled={meta.page <= 1}
        >
          <ArrowRightIcon className="size-4" aria-hidden="true" />
          قبلی
        </PageRelativeLink>
        <PageRelativeLink
          href={createPageHref(Math.min(meta.totalPages, meta.page + 1))}
          disabled={meta.page >= meta.totalPages}
        >
          بعدی
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
        </PageRelativeLink>
      </div>
    </nav>
  );
}

function PageRelativeLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-disabled={disabled}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "rounded-full",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      {children}
    </Link>
  );
}

function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="mt-8 rounded-[28px] border border-dashed border-border bg-card p-8 text-center">
      <p className="text-[20px] font-bold text-foreground">{title}</p>
      <p className="mx-auto mt-3 max-w-xl text-[15px] leading-8 text-muted-foreground">
        {description}
      </p>
      <Link
        href={actionHref}
        className={cn(buttonVariants({ variant: "default" }), "mt-5 rounded-full")}
      >
        {actionLabel}
      </Link>
    </div>
  );
}

function ApiNotice() {
  return (
    <div className="mt-8 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-[14px] leading-7 text-warning">
      فعلاً بخشی از مطالب در دسترس نیست. کمی بعد دوباره تلاش کنید.
    </div>
  );
}

function DecorativeMark({ className }: { className?: string }) {
  return (
    <Image
      src="/images/star-icon.png"
      alt=""
      width={180}
      height={180}
      sizes="180px"
      className={cn("pointer-events-none absolute opacity-[0.06]", className)}
    />
  );
}

function getCategoryDescription(category: Pick<TaxonomyItem, "name" | "slug">) {
  return categoryDescriptions[category.slug] ?? `مطالب فرهنگی مرتبط با ${category.name}.`;
}

function taxonomyItemHref(basePath: "/provinces" | "/categories", item: TaxonomyItem) {
  return `${basePath}/${encodeURIComponent(createPersianPathSegment(item.name))}`;
}

function createPersianPathSegment(value: string) {
  return value.trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

export {
  CategoriesIndexContent,
  CategoryDetailContent,
  createPersianPathSegment,
  ProvinceDetailContent,
  ProvinceIndexContent,
};
