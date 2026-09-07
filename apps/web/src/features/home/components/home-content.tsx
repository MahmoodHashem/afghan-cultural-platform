import { ArrowLeftIcon, BookOpenIcon, MapPinIcon, SparklesIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EngagementAccessProvider } from "@/features/engagement/components/engagement-access-provider";
import { PublicEntryCardView } from "@/features/entries/components/public-entry-card";
import type { PublicEntryCard, TaxonomyItem } from "@/features/entries/types/public-entry";
import { createEntryHref } from "@/features/entries/utils/entry-breadcrumb";
import { getEntryLocationLabel } from "@/features/entries/utils/geography";
import { cn } from "@/lib/utils";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";
import type { HomeData } from "../api/home-api";
import { ScrollReveal } from "./scroll-reveal";

const fallbackImages = [
  "/images/HERAT02.jpg",
  "/images/bamyan.jpg",
  "/images/menaras.jpg",
  "/images/mazar.jpg",
] as const;

function HomeContent({ data }: { data: HomeData }) {
  const featuredEntry = data.latestEntries[0] ?? null;
  const secondaryEntries = data.latestEntries.slice(1, 5);

  return (
    <section className="relative z-10 bg-background pt-16 shadow-[0_-24px_80px_rgba(250,248,243,0.55)] ">
      <div className="space-y-20 pb-16 sm:space-y-24 sm:pb-20">
        {data.isApiUnavailable ? <ApiUnavailableNotice /> : null}

        <ScrollReveal as="section" className="content-container">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <SectionIntro
              eyebrow="فرهنگ افغانستان"
              title="تازه‌ترین نوشته‌های فرهنگی از گوشه‌وکنار افغانستان"
              description="تازه‌ترین مطالب منتشرشده را اینجا ببینید."
            />
            <StatsStrip data={data} />
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            {featuredEntry ? <FeaturedEntryCard entry={featuredEntry} /> : <FeaturedEmptyState />}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {secondaryEntries.length > 0 ? (
                secondaryEntries.map((entry, index) => (
                  <ScrollReveal key={entry.id} delay={0.08 + index * 0.04}>
                    <CompactEntryCard entry={entry} imageIndex={index + 1} />
                  </ScrollReveal>
                ))
              ) : (
                <SideEmptyState />
              )}
            </div>
          </div>
        </ScrollReveal>

        <ExploreTaxonomySection
          title="فرهنگ افغانستان بر اساس ولایت"
          description="فرهنگ افغانستان را ولایت به ولایت ببینید."
          items={data.provinces}
          basePath="/explore"
          queryName="provinceSlug"
          icon={<MapPinIcon className="size-5" aria-hidden="true" />}
        />

        <LatestEntriesSection entries={data.recentlyUpdatedEntries} />

        <ExploreTaxonomySection
          title="موضوع‌های فرهنگی"
          description="از ادبیات و مشاهیر تا بناهای تاریخی و آیین‌ها، مطالب را بر اساس موضوع دنبال کنید."
          items={data.categories}
          basePath="/explore"
          queryName="categorySlug"
          icon={<BookOpenIcon className="size-5" aria-hidden="true" />}
        />

        <NationalScopeSection entries={data.nationalEntries} contentTypes={data.contentTypes} />

        <ContributionCallout />
      </div>
    </section>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl space-y-4">
      <p className="text-[14px] font-bold text-primary">{eyebrow}</p>
      <h1 className="text-lg font-bold leading-[1.35] text-foreground sm:text-[38px]">{title}</h1>
      <p className="max-w-2xl text-[16px] leading-8 text-muted-foreground">{description}</p>
    </div>
  );
}

function StatsStrip({ data }: { data: HomeData }) {
  const stats = [
    { label: "مطلب منتشرشده", value: data.stats.publishedEntries },
    { label: "ولایت", value: data.stats.provinces },
    { label: "موضوع", value: data.stats.categories },
  ];

  return (
    <dl className="grid grid-cols-3 rounded-2xl border border-border bg-card p-2 shadow-[0_2px_10px_rgba(0,0,0,.04)]">
      {stats.map((stat) => (
        <div key={stat.label} className="px-3 py-4 text-center">
          <dt className="text-[12px] font-medium text-muted-foreground">{stat.label}</dt>
          <dd className="mt-1 text-[22px] font-bold text-foreground">
            {formatPersianNumber(stat.value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function FeaturedEntryCard({ entry }: { entry: PublicEntryCard }) {
  return (
    <article className="group overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_2px_10px_rgba(0,0,0,.05)]">
      <Link
        href={createEntryHref(entry)}
        className="block outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <div className="relative min-h-105 md:min-h-205 overflow-hidden">
          <EntryImage
            entry={entry}
            fallbackIndex={0}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 58vw, 100vw"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/72 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 space-y-4 p-6 text-white sm:p-8">
            <div className="flex flex-wrap gap-2">
              <Badge className="border-white/20 bg-white/16 text-white backdrop-blur-sm">
                {entry.category.name}
              </Badge>
              <Badge className="border-white/20 bg-white/16 text-white backdrop-blur-sm">
                {getEntryLocationLabel(entry)}
              </Badge>
            </div>
            <div className="max-w-2xl space-y-3">
              <h2 className="text-[30px] font-bold leading-[1.35] sm:text-[38px]">{entry.title}</h2>
              <p className="line-clamp-2 text-[16px] leading-8 text-white/84">{entry.summary}</p>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

function CompactEntryCard({ entry, imageIndex }: { entry: PublicEntryCard; imageIndex: number }) {
  return (
    <article className="group rounded-2xl border border-border bg-card p-3 shadow-[0_2px_10px_rgba(0,0,0,.04)] transition-colors hover:border-primary/35">
      <Link
        href={createEntryHref(entry)}
        className="grid gap-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/40 sm:grid-cols-[132px_1fr] lg:grid-cols-[148px_1fr]"
      >
        <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-muted">
          <EntryImage
            entry={entry}
            fallbackIndex={imageIndex}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="180px"
          />
        </div>
        <div className="min-w-0 py-1">
          <p className="text-[12px] font-bold text-primary">{entry.contentType.name}</p>
          <h3 className="mt-2 line-clamp-2 text-[18px] font-bold leading-7 text-foreground">
            {entry.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-[14px] leading-7 text-muted-foreground">
            {entry.summary}
          </p>
          <p className="mt-3 text-[12px] text-muted-foreground">
            {formatPersianDate(entry.publishedAt)}
          </p>
        </div>
      </Link>
    </article>
  );
}

function LatestEntriesSection({ entries }: { entries: PublicEntryCard[] }) {
  return (
    <ScrollReveal as="section" className="content-container space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionIntro
          eyebrow="تازه‌ها"
          title="تازه‌ترین نوشته‌ها"
          description="نگاهی به تازه‌ترین مطالب سایت"
        />
        <Link
          href="/explore?sort=recentlyUpdated"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
        >
          دیدن همه
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
        </Link>
      </div>

      {entries.length > 0 ? (
        <EngagementAccessProvider>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {entries.map((entry, index) => (
              <ScrollReveal key={entry.id} delay={index * 0.04}>
                <PublicEntryCardView entry={entry} imageIndex={index} />
              </ScrollReveal>
            ))}
          </div>
        </EngagementAccessProvider>
      ) : (
        <WideEmptyState />
      )}
    </ScrollReveal>
  );
}

function ExploreTaxonomySection({
  title,
  description,
  items,
  basePath,
  queryName,
  icon,
}: {
  title: string;
  description: string;
  items: TaxonomyItem[];
  basePath: string;
  queryName: string;
  icon: ReactNode;
}) {
  return (
    <ScrollReveal as="section" className="content-container">
      <div className="rounded-[28px] border border-border bg-card p-5 shadow-[0_2px_10px_rgba(0,0,0,.04)] sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="space-y-4">
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary-light text-primary">
              {icon}
            </span>
            <div className="space-y-3">
              <h2 className="text-[28px] font-bold text-foreground">{title}</h2>
              <p className="max-w-xl text-[15px] leading-8 text-muted-foreground">{description}</p>
            </div>
          </div>

          {items.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`${basePath}?${queryName}=${encodeURIComponent(item.slug)}`}
                  className="rounded-full border border-border bg-background px-4 py-2 text-[14px] font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary-light hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-muted px-4 py-5 text-[14px] text-muted-foreground">
              هنوز داده‌ای برای این بخش در دسترس نیست.
            </p>
          )}
        </div>
      </div>
    </ScrollReveal>
  );
}

function NationalScopeSection({
  entries,
  contentTypes,
}: {
  entries: PublicEntryCard[];
  contentTypes: TaxonomyItem[];
}) {
  return (
    <ScrollReveal as="section" className="content-container">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[28px] border border-border bg-foreground p-7 text-white shadow-[0_2px_10px_rgba(0,0,0,.05)]">
          <SparklesIcon className="size-9 text-gold" aria-hidden="true" />
          <h2 className="mt-5 text-[30px] font-bold leading-[1.35]">فرهنگ مشترک افغانستان</h2>
          <p className="mt-4 text-[15px] leading-8 text-white/72">
            بعضی از رسم‌ها، چهره‌ها و روایت‌ها در بخش‌های مختلف افغانستان شناخته شده‌اند.
          </p>
          <Link
            href="/explore?geographicScope=NATIONAL"
            className={cn(buttonVariants(), "mt-6 rounded-full")}
          >
            دیدن مطالب سراسری
          </Link>
        </div>

        <div className="grid gap-4">
          {entries.length > 0 ? (
            entries.map((entry, index) => (
              <CompactEntryCard key={entry.id} entry={entry} imageIndex={index + 2} />
            ))
          ) : (
            <div className="rounded-[28px] border border-border bg-card p-7">
              <h3 className="text-[22px] font-bold text-foreground">موضوع‌های پیشنهادی</h3>
              <div className="mt-5 flex flex-wrap gap-3">
                {contentTypes.map((contentType) => (
                  <Link
                    key={contentType.id}
                    href={`/explore?contentTypeSlug=${encodeURIComponent(contentType.slug)}`}
                    className="rounded-full bg-muted px-4 py-2 text-[14px] font-semibold text-muted-foreground transition-colors hover:bg-primary-light hover:text-primary"
                  >
                    {contentType.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ScrollReveal>
  );
}

function ContributionCallout() {
  return (
    <ScrollReveal as="section" className="content-container">
      <div className="rounded-[28px] border border-border bg-card px-5 py-8 text-center shadow-[0_2px_10px_rgba(0,0,0,.04)] sm:px-8 sm:py-10">
        <p className="text-[14px] font-bold text-primary">مشارکت فرهنگی</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-[30px] font-bold leading-[1.35] text-foreground">
          اگر چیزی از فرهنگ و تاریخ محل‌تان می‌دانید، با دیگران شریک کنید.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-8 text-muted-foreground">
          مطالب پس از ثبت و بررسی، در سایت منتشر می‌شوند.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/entries/new" className={cn(buttonVariants(), "rounded-full")}>
            افزودن مطلب
          </Link>
          <Link
            href="/about"
            className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
          >
            درباره میراث افغانستان
          </Link>
        </div>
      </div>
    </ScrollReveal>
  );
}

function EntryImage({
  entry,
  fallbackIndex,
  className,
  sizes,
  priority = false,
}: {
  entry: PublicEntryCard;
  fallbackIndex: number;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  const image = entry.coverImage;
  const src =
    image?.thumbnailUrl ??
    image?.secureUrl ??
    fallbackImages[fallbackIndex % fallbackImages.length];

  return (
    <Image
      src={src}
      alt={image?.altText ?? entry.title}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}

function ApiUnavailableNotice() {
  return (
    <div className="content-container">
      <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-[14px] leading-7 text-warning">
        ارتباط با API عمومی برقرار نشد. صفحه با حالت خالی و امن نمایش داده می‌شود.
      </div>
    </div>
  );
}

function FeaturedEmptyState() {
  return (
    <div className="rounded-[28px] border border-border bg-card p-8 shadow-[0_2px_10px_rgba(0,0,0,.04)]">
      <p className="text-[14px] font-bold text-primary">کتابخانه در حال آماده‌سازی است</p>
      <h2 className="mt-3 text-[30px] font-bold leading-[1.35] text-foreground">
        هنوز مطلب منتشرشده‌ای برای نمایش در صفحه اصلی وجود ندارد.
      </h2>
      <p className="mt-4 text-[15px] leading-8 text-muted-foreground">
        پس از تأیید و انتشار نخستین مطالب فرهنگی، این بخش به‌صورت خودکار با داده واقعی پر می‌شود.
      </p>
    </div>
  );
}

function SideEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-[14px] leading-7 text-muted-foreground sm:col-span-2 lg:col-span-1">
      مطالب بیشتری پس از انتشار اینجا نمایش داده می‌شوند.
    </div>
  );
}

function WideEmptyState() {
  return (
    <div className="rounded-[28px] border border-dashed border-border bg-card p-8 text-center text-[15px] leading-8 text-muted-foreground">
      هنوز فهرستی برای این بخش وجود ندارد.
    </div>
  );
}

export { HomeContent };
