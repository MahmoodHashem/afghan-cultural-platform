import {
  AcademicCapIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  BuildingStorefrontIcon,
  CakeIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  MapPinIcon,
  PaintBrushIcon,
  PlusIcon,
  PuzzlePieceIcon,
  SparklesIcon,
  TagIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHero } from "@/components/common/page-hero";
import { SectionHead } from "@/components/common/section-head";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getProvinceImage } from "@/lib/images/province-images";
import { cn } from "@/lib/utils";
import { formatPersianNumber } from "@/lib/utils/formatters";
import type { EntryListResponse, TaxonomyItem } from "../types/public-entry";
import type { EntryBreadcrumbContext } from "../utils/entry-breadcrumb";
import { taxonomyItemHref } from "../utils/taxonomy-route";
import type { FilterTabItem } from "./filter-tabs";
import { FilterableEntryResults } from "./filterable-entry-results";
import { type DistrictLinkItem, ProvinceDistrictBrowser } from "./province-district-browser";
import { ProvinceSearchGrid } from "./province-search-grid";

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
  provinceEntryCount: number;
  districts: DistrictLinkItem[];
  categoryFilters: TaxonomyFilterItem[];
  allCategoriesHref: string;
  allDistrictsHref: string;
  isAllCategoriesActive: boolean;
  selectedDistrictName?: string;
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
  "languages-and-expressions":
    "زبان‌ها، گویش‌ها، اصطلاحات و تعبیرهای رایج در مناطق مختلف افغانستان.",
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

/** Persian-tile colourways used to tint topic tiles in turn. */
const tileColourways = [
  "from-lapis to-lapis-deep",
  "from-turquoise to-turquoise-deep",
  "from-saffron to-saffron-deep",
  "from-anar to-anar-deep",
] as const;

function ProvinceIndexContent({ provinces, isUnavailable }: ProvinceIndexContentProps) {
  return (
    <main className="min-h-screen bg-paper">
      <PageHero
        breadcrumb={
          <PageBreadcrumb
            tone="onDark"
            items={[{ label: "خانه", href: "/" }, { label: "ولایت‌ها" }]}
          />
        }
        eyebrow="ولایت‌ها"
        title="فرهنگ افغانستان بر اساس ولایت"
        description="با فرهنگ و میراث ولایت‌های افغانستان آشنا شوید. هر ولایت روایت‌های خودش را دارد؛ اگر از ولایت خود چیزی می‌دانید، آن را برای دیگران ثبت کنید."
        word="سرزمین"
        actions={<ContributeLink label="نوشتن درباره‌ی ولایت من" />}
      />

      <section className="content-container py-10 sm:py-12">
        {isUnavailable ? <ApiNotice /> : null}

        {provinces.length > 0 ? (
          <ProvinceSearchGrid provinces={provinces} />
        ) : (
          <EmptyState
            title="نمایش ولایت‌ها ممکن نشد"
            description="کمی بعد دوباره تلاش کنید."
            action={
              <Link href="/" className={buttonVariants({ variant: "pill" })}>
                بازگشت به خانه
              </Link>
            }
          />
        )}
      </section>
    </main>
  );
}

function ProvinceDetailContent({
  province,
  entries,
  provinceEntryCount,
  districts,
  categoryFilters,
  allCategoriesHref,
  allDistrictsHref,
  isAllCategoriesActive,
  selectedDistrictName,
  createPageHref,
  isUnavailable,
}: ProvinceDetailContentProps) {
  const provinceHref = taxonomyItemHref("/provinces", province);

  return (
    <main className="min-h-screen bg-paper">
      <PageHero
        breadcrumb={
          <PageBreadcrumb
            tone="onDark"
            items={[
              { label: "خانه", href: "/" },
              { label: "ولایت‌ها", href: "/provinces" },
              { label: province.name },
            ]}
          />
        }
        eyebrow="ولایت"
        title={province.name}
        description={
          <span className="whitespace-pre-line">
            {province.description || `مطالب مربوط به ${province.name} را ببینید.`}
          </span>
        }
        word={province.name}
        actions={
          <>
            <dl className="flex flex-wrap gap-2">
              <ProvinceStat
                icon={DocumentTextIcon}
                label="مطلب منتشرشده"
                value={provinceEntryCount}
              />
              <ProvinceStat icon={BuildingOffice2Icon} label="ولسوالی" value={districts.length} />
            </dl>
            <ContributeLink label={`نوشتن درباره‌ی ${province.name}`} />
          </>
        }
        aside={<ProvinceHeroImage province={province} />}
      />

      <section className="content-container space-y-12 py-10 sm:py-12">
        {districts.length > 0 ? (
          <ProvinceDistrictBrowser
            provinceName={province.name}
            districts={districts}
            allDistrictsHref={allDistrictsHref}
          />
        ) : null}

        <section id="province-entries" className="scroll-mt-28 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionHead title={`مطالب مربوط به ${province.name}`} word="فرهنگ و میراث" />
            {selectedDistrictName ? (
              <Badge variant="chip" className="gap-1.5">
                <MapPinIcon className="size-4" aria-hidden="true" />
                {selectedDistrictName}
              </Badge>
            ) : null}
          </div>

          {isUnavailable ? <ApiNotice /> : null}

          <EntryResults
            tabsAriaLabel="فیلتر موضوع‌های ولایت"
            tabs={[
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
            entries={entries}
            emptyKind="province"
            emptyStateOverride={
              selectedDistrictName
                ? {
                    title: `هنوز مطلبی درباره ولسوالی ${selectedDistrictName} منتشر نشده است.`,
                    description:
                      `اگر درباره فرهنگ و تاریخ ولسوالی ${selectedDistrictName} چیزی می‌دانید، می‌توانید آن را ثبت کنید.`,
                  }
                : undefined
            }
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
    <main className="min-h-screen bg-paper">
      <PageHero
        breadcrumb={
          <PageBreadcrumb
            tone="onDark"
            items={[{ label: "خانه", href: "/" }, { label: "موضوع‌ها" }]}
          />
        }
        eyebrow="موضوع‌ها"
        title="مطالب بر اساس موضوع"
        description="مطالب فرهنگی افغانستان را بر اساس موضوع ببینید؛ از بناهای تاریخی و موسیقی تا قصه‌های شفاهی، بازی‌های محلی و پیشه‌های سنتی."
        word="موضوع"
        actions={<ContributeLink label="افزودن مطلب تازه" />}
      />

      <section className="content-container py-10 sm:py-12">
        {isUnavailable ? <ApiNotice /> : null}

        {categories.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => (
              <CategoryCard key={category.id} category={category} toneIndex={index} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="هنوز موضوعی برای نمایش در دسترس نیست."
            description="کمی بعد دوباره تلاش کنید."
            action={
              <Link href="/explore" className={buttonVariants({ variant: "pill" })}>
                دیدن مطالب
              </Link>
            }
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
    <main className="min-h-screen bg-paper">
      <PageHero
        breadcrumb={
          <PageBreadcrumb
            tone="onDark"
            items={[
              { label: "خانه", href: "/" },
              { label: "موضوع‌ها", href: "/categories" },
              { label: category.name },
            ]}
          />
        }
        eyebrow="موضوع"
        title={category.name}
        description={getCategoryDescription(category)}
        word={category.name}
        actions={
          <>
            <Badge variant="glass" className="h-9 px-4 text-[13px]">
              {formatPersianNumber(category.entryCount)} مطلب از سراسر افغانستان
            </Badge>
            <ContributeLink label="افزودن مطلب در این موضوع" />
          </>
        }
        aside={<CategoryEmblem category={category} />}
      />

      <section className="content-container space-y-6 py-10 sm:py-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <SectionHead title="بر اساس ولایت" word="سرزمین" />
            <p className="text-[13px] leading-7 text-faint">
              «سراسری» شامل مطالبی است که به ولایت خاصی وابسته نیستند.
            </p>
          </div>
          <SortLinks options={sortOptions} />
        </div>

        {isUnavailable ? <ApiNotice /> : null}

        <EntryResults
          tabsAriaLabel="فیلتر ولایت‌های موضوع"
          tabs={[
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
          entries={entries}
          emptyKind="category"
          createPageHref={createPageHref}
          breadcrumbParent={[
            { label: "موضوع‌ها", href: "/categories" },
            { label: category.name, href: categoryHref },
          ]}
        />
      </section>
    </main>
  );
}

function ContributeLink({ label }: { label: string }) {
  return (
    <Link href="/entries/new" className={buttonVariants({ variant: "pill", size: "lg" })}>
      <PlusIcon data-icon="inline-start" aria-hidden="true" />
      {label}
    </Link>
  );
}

/** Topic tile in one of the four Persian-tile colourways (reference "tile"). */
function CategoryCard({
  category,
  toneIndex,
}: {
  category: CountedTaxonomyItem;
  toneIndex: number;
}) {
  const Icon = categoryIconBySlug[category.slug] ?? TagIcon;
  const colourway = tileColourways[toneIndex % tileColourways.length];

  return (
    <Link
      href={taxonomyItemHref("/categories", category)}
      className={cn(
        "group relative isolate flex min-h-52 flex-col gap-3 overflow-hidden rounded-bubble bg-linear-150 p-6 pb-5 text-white shadow-card outline-none transition-[translate,box-shadow] duration-300 ease-expo hover:-translate-y-1 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring",
        colourway,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[7px] rounded-[16px_16px_16px_3px] border border-white/16"
      />
      <DecorativeMark className="-end-8 -top-8 size-32 opacity-[0.12] brightness-0 invert transition-transform duration-500 ease-expo group-hover:-translate-x-1.5 group-hover:translate-y-1" />
      <span className="absolute top-5 end-6 font-hand text-[20px] text-white/60">
        {formatPersianNumber(toneIndex + 1, { minimumIntegerDigits: 2, useGrouping: false })}
      </span>
      <span className="relative grid size-11.5 place-items-center rounded-[14px_14px_14px_4px] border border-white/20 bg-white/14">
        <Icon className="size-5.5" aria-hidden="true" />
      </span>
      <h2 className="relative text-[16px] leading-[1.8] font-bold">{category.name}</h2>
      <p className="relative line-clamp-3 max-w-[30ch] text-[12.5px] leading-[1.9] text-white/78">
        {getCategoryDescription(category)}
      </p>
      <div className="relative mt-auto flex items-center justify-between pt-2">
        <span className="text-[12px] font-bold text-white/85">
          {formatPersianNumber(category.entryCount)} مطلب
        </span>
        <span className="grid size-7.5 place-items-center rounded-[10px_10px_10px_3px] bg-white/13 opacity-70 transition-[opacity,translate,background-color] duration-250 ease-expo group-hover:-translate-x-1 group-hover:bg-white/22 group-hover:opacity-100">
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

/** Large icon tile shown beside a topic's page title. */
function CategoryEmblem({ category }: { category: TaxonomyItem }) {
  const Icon = categoryIconBySlug[category.slug] ?? TagIcon;

  return (
    <div className="relative grid size-40 place-items-center rounded-bubble border border-white/14 bg-white/8 sm:size-48">
      <span
        aria-hidden="true"
        className="absolute inset-2 rounded-[16px_16px_16px_3px] border border-white/12"
      />
      <DecorativeMark className="inset-0 m-auto size-36 opacity-[0.1] brightness-0 invert" />
      <Icon className="relative size-14 text-gold" aria-hidden="true" />
    </div>
  );
}

/** Province photo in a white mat with a red bookmark ribbon, as the reference article figure. */
function ProvinceHeroImage({ province }: { province: TaxonomyItem }) {
  const image = getProvinceImage(province);

  return (
    <figure className="relative w-full max-w-md rounded-[26px_26px_26px_10px] bg-surface p-2.5 pb-8 shadow-figure lg:w-[420px]">
      <span
        aria-hidden="true"
        className="absolute -top-2 end-8 z-10 h-14 w-3 bg-primary [clip-path:polygon(0_0,100%_0,100%_100%,50%_calc(100%-7px),0_100%)]"
      />
      <div className="relative aspect-[4/3] overflow-hidden rounded-[16px_16px_16px_4px] border border-line bg-media-ph">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 420px, 100vw"
          className="object-cover"
          priority
        />
      </div>
    </figure>
  );
}

function ProvinceStat({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: number;
}) {
  return (
    <div className="inline-flex h-9 items-center gap-2 rounded-full border border-white/26 bg-white/12 px-3.5 text-white backdrop-blur-sm">
      <Icon className="size-4 text-gold" aria-hidden="true" />
      <dt className="text-[12px] text-white/75">{label}</dt>
      <dd className="text-[14px] font-bold">{formatPersianNumber(value)}</dd>
    </div>
  );
}

function EntryResults({
  tabsAriaLabel,
  tabs,
  entries,
  emptyKind,
  createPageHref,
  breadcrumbParent,
  emptyStateOverride,
}: {
  tabsAriaLabel: string;
  tabs: FilterTabItem[];
  entries: EntryListResponse;
  emptyKind: "province" | "category";
  createPageHref: (page: number) => string;
  breadcrumbParent: EntryBreadcrumbContext;
  emptyStateOverride?: {
    title: string;
    description: string;
  };
}) {
  return (
    <FilterableEntryResults
      tabsAriaLabel={tabsAriaLabel}
      tabs={tabs}
      entries={entries.data}
      emptyState={{
        title:
          emptyStateOverride?.title ??
          (emptyKind === "province"
            ? "هنوز مطلبی برای این ولایت منتشر نشده است."
            : "هنوز مطلبی در این بخش منتشر نشده است."),
        description:
          emptyStateOverride?.description ??
          (emptyKind === "province"
            ? "اگر درباره فرهنگ و تاریخ این ولایت چیزی می‌دانید، می‌توانید آن را ثبت کنید."
            : "اگر درباره این موضوع چیزی می‌دانید، می‌توانید آن را ثبت کنید."),
        actionHref: "/entries/new",
        actionLabel: "افزودن مطلب",
      }}
      breadcrumbParent={breadcrumbParent}
      pagination={<Pagination meta={entries.meta} createPageHref={createPageHref} />}
    />
  );
}

function SortLinks({ options }: { options: SortOption[] }) {
  return (
    <nav
      className="inline-flex w-fit flex-wrap gap-1 rounded-full border border-line bg-paper p-1"
      aria-label="مرتب‌سازی"
    >
      {options.map((option) => (
        <Link
          key={option.value}
          href={option.href}
          scroll={false}
          aria-current={option.isActive ? "page" : undefined}
          className={cn(
            "inline-flex h-9 items-center rounded-full px-3.5 text-[12.5px] font-bold transition-colors duration-200 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            option.isActive
              ? "bg-primary text-primary-foreground"
              : "text-copy hover:text-brand-ink",
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
      className="flex flex-col gap-3 pt-4 sm:flex-row-reverse sm:items-center sm:justify-between"
      aria-label="صفحه‌بندی"
    >
      <p className="text-[12px] text-faint">
        صفحه {formatPersianNumber(meta.page)} از {formatPersianNumber(meta.totalPages)}
      </p>
      <div className="flex gap-2">
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
        disabled && "pointer-events-none opacity-40",
      )}
    >
      {children}
    </Link>
  );
}

function ApiNotice() {
  return (
    <div className="mb-8 rounded-bubble-sm border border-saffron/30 bg-tint-sand px-4 py-3 text-[13.5px] leading-7 text-saffron-deep dark:text-gold">
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

export {
  CategoriesIndexContent,
  CategoryDetailContent,
  ProvinceDetailContent,
  ProvinceIndexContent,
};
