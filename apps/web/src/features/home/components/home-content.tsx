import {
  ArrowLeftIcon,
  BuildingLibraryIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckBadgeIcon,
  GlobeAsiaAustraliaIcon,
  MapPinIcon,
  PaintBrushIcon,
  PencilSquareIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { SectionHead } from "@/components/common/section-head";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EngagementAccessProvider } from "@/features/engagement/components/engagement-access-provider";
import { PublicEntryCardView } from "@/features/entries/components/public-entry-card";
import type { PublicEntryCard, TaxonomyItem } from "@/features/entries/types/public-entry";
import { createEntryHref } from "@/features/entries/utils/entry-breadcrumb";
import { getEntryLocationLabel } from "@/features/entries/utils/geography";
import { taxonomyItemHref } from "@/features/entries/utils/taxonomy-route";
import { getProvinceImage } from "@/lib/images/province-images";
import { cn } from "@/lib/utils";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";
import type { HomeData } from "../api/home-api";
import { ScrollReveal } from "./scroll-reveal";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

const fallbackImages = [
  "/images/HERAT02.jpg",
  "/images/bamyan.jpg",
  "/images/menaras.jpg",
  "/images/mazar.jpg",
] as const;

/** Persian-tile colourways, shared with the topic tiles. */
const tileColourways = [
  "from-lapis to-lapis-deep",
  "from-turquoise to-turquoise-deep",
  "from-saffron to-saffron-deep",
  "from-anar to-anar-deep",
] as const;

/** The kinds of everyday knowledge a visitor may hold, each phrased as a question to them. */
const knowledgeKinds: { title: string; prompt: string; icon: HeroIcon }[] = [
  {
    title: "قصه‌ها و روایت‌ها",
    prompt: "متل، داستان یا خاطره‌ای که از پدر و مادر و بزرگان محل شنیده‌اید.",
    icon: ChatBubbleBottomCenterTextIcon,
  },
  {
    title: "رسم‌ها و آیین‌ها",
    prompt: "عروسی، نوروز، شب یلدا، بازی‌های محلی و رسم‌هایی که هنوز در ده و شهرتان زنده است.",
    icon: SparklesIcon,
  },
  {
    title: "جاها و بناها",
    prompt: "قلعه، مسجد، کاروان‌سرا، زیارتگاه یا چشم‌اندازی که تاریخ و نام و نشانی دارد.",
    icon: BuildingLibraryIcon,
  },
  {
    title: "هنرها و پیشه‌ها",
    prompt: "قالین‌بافی، کاشی‌کاری، سفال‌گری، آشپزی و دانش دستی‌ای که باید به نسل بعد برسد.",
    icon: PaintBrushIcon,
  },
];

const contributionSteps: { title: string; description: string; icon: HeroIcon }[] = [
  {
    title: "بنویسید",
    description:
      "آنچه می‌دانید را به زبان ساده بنویسید؛ اگر عکس، منبع یا نام راوی دارید، اضافه کنید.",
    icon: PencilSquareIcon,
  },
  {
    title: "بازبینی می‌شود",
    description:
      "گردانندگان مطلب را با دقت و احترام می‌خوانند و اگر لازم باشد برای کامل‌ترشدن با شما هماهنگ می‌کنند.",
    icon: CheckBadgeIcon,
  },
  {
    title: "ماندگار می‌شود",
    description:
      "مطلب منتشر می‌شود، دیگران می‌خوانند و کامل‌ترش می‌کنند و برای نسل‌های بعد می‌ماند.",
    icon: GlobeAsiaAustraliaIcon,
  },
];

function HomeContent({ data }: { data: HomeData }) {
  const featuredEntry = data.latestEntries[0] ?? null;
  const secondaryEntries = data.latestEntries.slice(1, 5);

  return (
    <section className="relative z-10 bg-paper pb-20 sm:pb-24">
      <ImpactStrip data={data} />

      <div className="space-y-20 pt-14 sm:space-y-24 sm:pt-16">
        {data.isApiUnavailable ? <ApiUnavailableNotice /> : null}

        <KnowledgeMattersSection />

        <ScrollReveal as="section" className="content-container" aria-labelledby="home-latest">
          <SectionHead
            id="home-latest"
            title="تازه‌ترین روایت‌های ثبت‌شده"
            word="روایت"
            action={{ href: "/explore", label: "همه‌ی مطالب" }}
          />
          <p className="mt-3 max-w-[60ch] text-[14.5px] leading-[2] text-copy">
            هر کدام از این مطالب را کسی نوشته که چیزی از فرهنگ سرزمینش می‌دانست و نخواست فراموش
            شود.
          </p>

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

        <HowItWorksSection />

        <ProvincesSection provinces={data.provinces} />

        <NationalScopeSection entries={data.nationalEntries} />

        <TopicsSection categories={data.categories} />

        <LatestEntriesSection entries={data.recentlyUpdatedEntries} />

        <ContributionCallout contentTypes={data.contentTypes} />
      </div>
    </section>
  );
}

/** Live totals, framed as what the community has built together so far. */
function ImpactStrip({ data }: { data: HomeData }) {
  const stats = [
    { label: "مطلب منتشرشده", value: data.stats.publishedEntries },
    { label: "ولایت", value: data.stats.provinces },
    { label: "موضوع فرهنگی", value: data.stats.categories },
  ];

  return (
    <div className="content-container relative z-10 pt-6 md:-mt-10 md:pt-0">
      <div className="grid gap-4 rounded-bubble border border-line-soft bg-surface p-4 shadow-lift sm:p-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-6">
        <p className="text-[13.5px] leading-[1.9] font-bold text-ink md:max-w-[11rem]">
          تا امروز، با همراهی مردم:
        </p>
        <dl className="grid grid-cols-3 divide-x divide-line-soft divide-x-reverse">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse items-center gap-0.5 px-2">
              <dt className="text-[11.5px] whitespace-nowrap text-faint sm:text-[12px]">
                {stat.label}
              </dt>
              <dd className="text-[24px] leading-none font-bold text-ink sm:text-[28px]">
                {formatPersianNumber(stat.value)}
              </dd>
            </div>
          ))}
        </dl>
        <Link
          href="/entries/new"
          className={cn(buttonVariants({ variant: "pill" }), "justify-center")}
        >
          <PencilSquareIcon className="size-4.5" aria-hidden="true" />
          روایت بعدی از شما
        </Link>
      </div>
    </div>
  );
}

function KnowledgeMattersSection() {
  return (
    <ScrollReveal as="section" className="content-container" aria-labelledby="home-knowledge">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
        <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <SectionHead id="home-knowledge" title="آنچه شما می‌دانید، میراث است" word="دانش" />
          <p className="text-[15px] leading-[2.1] text-copy">
            بخش بزرگی از فرهنگ افغانستان در کتاب‌ها نیست؛ در یاد مردم است. در قصه‌های مادربزرگ‌ها،
            در دست‌های یک استاد قالین‌باف و در نام کوچه‌ها و قلعه‌های هر ده. اگر نوشته نشود، با
            رفتن هر نسل کم‌رنگ‌تر می‌شود.
          </p>
          <p className="text-[15px] leading-[2.1] text-copy">
            میراث تنها جایی برای خواندن نیست؛ جایی است که هر کس، از هر ولایت، می‌تواند سهمی از این
            حافظه را بنویسد.
          </p>
          <Link href="/entries/new" className={cn(buttonVariants({ variant: "cta" }), "mt-2")}>
            نخستین مطلب خود را بنویسید
            <ArrowLeftIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {knowledgeKinds.map((kind, index) => {
            const Icon = kind.icon;

            return (
              <li key={kind.title}>
                <Link
                  href="/entries/new"
                  className={cn(
                    "group relative isolate flex h-full min-h-56 flex-col gap-3 overflow-hidden rounded-bubble bg-linear-150 p-6 text-white shadow-card outline-none transition-[translate,box-shadow] duration-300 ease-expo hover:-translate-y-1 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring",
                    tileColourways[index % tileColourways.length],
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-[7px] rounded-[16px_16px_16px_3px] border border-white/16"
                  />
                  <Image
                    src="/images/star-icon.png"
                    alt=""
                    width={140}
                    height={140}
                    sizes="140px"
                    className="pointer-events-none absolute -end-8 -top-8 size-32 opacity-[0.12] brightness-0 invert transition-transform duration-500 ease-expo group-hover:-translate-x-1.5 group-hover:translate-y-1"
                  />
                  <span className="relative grid size-11.5 place-items-center rounded-[14px_14px_14px_4px] border border-white/20 bg-white/14">
                    <Icon className="size-5.5" aria-hidden="true" />
                  </span>
                  <h3 className="relative text-[17px] leading-[1.8] font-bold">{kind.title}</h3>
                  <p className="relative text-[13px] leading-[2] text-white/82">{kind.prompt}</p>
                  <span className="relative mt-auto inline-flex items-center gap-1.5 pt-2 text-[12.5px] font-bold text-white/90">
                    این را می‌دانم و ثبت می‌کنم
                    <ArrowLeftIcon
                      className="size-4 transition-transform duration-200 group-hover:-translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </ScrollReveal>
  );
}

function HowItWorksSection() {
  return (
    <ScrollReveal as="section" className="bg-tint-sand py-16 sm:py-20" aria-labelledby="home-steps">
      <div className="content-container">
        <SectionHead id="home-steps" title="از دانسته تا میراث ماندگار، در سه گام" word="ماندگار" />

        <ol className="relative mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
          <span
            aria-hidden="true"
            className="absolute inset-x-[16%] top-9 hidden border-t-2 border-dashed border-saffron/35 md:block"
          />
          {contributionSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <li
                key={step.title}
                className="relative rounded-bubble border border-line-soft bg-surface p-6 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-[16px_16px_16px_5px] bg-brand-soft text-brand-ink">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span
                    className="font-hand text-[34px] leading-none text-saffron"
                    aria-hidden="true"
                  >
                    {formatPersianNumber(index + 1)}
                  </span>
                </div>
                <h3 className="mt-5 text-card-title text-ink">
                  <span className="sr-only">گام {formatPersianNumber(index + 1)}: </span>
                  {step.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-[2] text-copy">{step.description}</p>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/entries/new" className={buttonVariants({ variant: "default", size: "lg" })}>
            شروع نوشتن
          </Link>
          <Link href="/about" className={buttonVariants({ variant: "outline", size: "lg" })}>
            بیشتر درباره‌ی میراث
          </Link>
        </div>
      </div>
    </ScrollReveal>
  );
}

function FeaturedEntryCard({ entry }: { entry: PublicEntryCard }) {
  return (
    <article className="group h-full overflow-hidden rounded-bubble bg-media-ph shadow-card transition-shadow duration-300 hover:shadow-lift">
      <Link
        href={createEntryHref(entry)}
        className="block h-full rounded-[inherit] outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
      >
        <div className="relative h-full min-h-105 overflow-hidden md:min-h-130">
          <EntryImage
            entry={entry}
            fallbackIndex={0}
            className="object-cover transition-transform duration-700 ease-expo group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 58vw, 100vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 space-y-4 p-6 text-white sm:p-8">
            <div className="flex flex-wrap gap-2">
              <Badge variant="glass">{entry.category.name}</Badge>
              <Badge variant="glass">
                <MapPinIcon className="size-3.5" aria-hidden="true" />
                {getEntryLocationLabel(entry)}
              </Badge>
            </div>
            <div className="max-w-2xl space-y-3">
              <h3 className="text-[24px] leading-[1.6] font-bold sm:text-[30px]">{entry.title}</h3>
              <p className="line-clamp-2 text-[14.5px] leading-[2] text-white/82">
                {entry.summary}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-white/90">
              خواندن روایت
              <ArrowLeftIcon
                className="size-4 transition-transform group-hover:-translate-x-1"
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function CompactEntryCard({ entry, imageIndex }: { entry: PublicEntryCard; imageIndex: number }) {
  return (
    <article className="group h-full rounded-card border border-line-soft bg-surface p-3 shadow-card transition-[translate,box-shadow,border-color] duration-300 ease-expo hover:-translate-y-0.5 hover:border-line hover:shadow-lift">
      <Link
        href={createEntryHref(entry)}
        className="grid gap-4 rounded-[inherit] outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:grid-cols-[120px_1fr] lg:grid-cols-[132px_1fr]"
      >
        <div className="relative aspect-4/3 overflow-hidden rounded-[14px_14px_14px_4px] bg-media-ph">
          <EntryImage
            entry={entry}
            fallbackIndex={imageIndex}
            className="object-cover transition-transform duration-500 ease-expo group-hover:scale-[1.05]"
            sizes="160px"
          />
        </div>
        <div className="min-w-0 py-0.5">
          <p className="text-[11.5px] font-bold text-brand-ink">{entry.contentType.name}</p>
          <h3 className="mt-1.5 line-clamp-2 text-[15px] leading-[1.8] font-bold text-ink group-hover:text-brand-ink">
            {entry.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-[13px] leading-[1.9] text-copy">{entry.summary}</p>
          <p className="mt-2 text-[11.5px] text-faint">{formatPersianDate(entry.publishedAt)}</p>
        </div>
      </Link>
    </article>
  );
}

/** Province arches: invites people to see their own province, and to fill the gaps in it. */
function ProvincesSection({ provinces }: { provinces: TaxonomyItem[] }) {
  return (
    <ScrollReveal as="section" className="content-container" aria-labelledby="home-provinces">
      <SectionHead
        id="home-provinces"
        title="از هر ولایت، روایتی"
        word="سرزمین"
        action={{ href: "/provinces", label: "همه‌ی ولایت‌ها" }}
      />
      <p className="mt-3 max-w-[62ch] text-[14.5px] leading-[2] text-copy">
        فرهنگ افغانستان را ولایت به ولایت ببینید. ولایت شما هنوز کم‌روایت است؟ نخستین روایت آن را
        شما بنویسید.
      </p>

      {provinces.length > 0 ? (
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {provinces.slice(0, 8).map((province) => {
            const image = getProvinceImage(province, "thumbnail");

            return (
              <li key={province.id}>
                <Link
                  href={taxonomyItemHref("/provinces", province)}
                  className="group relative block aspect-[6/7] overflow-hidden rounded-arch bg-media-ph shadow-card outline-none transition-[translate,box-shadow] duration-300 ease-expo hover:-translate-y-1.5 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition-transform duration-500 ease-expo group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-linear-to-t from-black/78 via-black/15 to-transparent" />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-1.5 rounded-[999px_999px_8px_3px] border border-white/22 transition-colors duration-300 group-hover:border-white/45"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 text-white sm:p-5">
                    <span className="text-[18px] leading-[1.6] font-bold sm:text-[20px]">
                      {province.name}
                    </span>
                    <ArrowLeftIcon
                      className="mb-1.5 size-4 shrink-0 opacity-70 transition-transform group-hover:-translate-x-1 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          className="mt-8"
          size="compact"
          description="فهرست ولایت‌ها هنوز در دسترس نیست."
        />
      )}
    </ScrollReveal>
  );
}

/** Red feature band: culture shared across the whole country. */
function NationalScopeSection({ entries }: { entries: PublicEntryCard[] }) {
  return (
    <ScrollReveal
      as="section"
      className="relative isolate overflow-hidden bg-linear-155 from-primary to-band-red-deep py-14 text-white sm:py-16"
      aria-labelledby="home-national"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -end-[0.05em] -bottom-[0.3em] -z-10 font-calli text-[180px] leading-none text-white opacity-[0.08] select-none max-lg:text-[110px]"
      >
        افغانستان
      </span>
      <div className="content-container grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-12">
        <div className="space-y-4">
          <SectionHead id="home-national" tone="band" title="فرهنگ مشترک افغانستان" />
          <p className="text-[15px] leading-[2.1] text-white/85">
            بعضی رسم‌ها، چهره‌ها و روایت‌ها از مرز یک ولایت فراتر می‌روند و همه‌ی مردم افغانستان
            آن‌ها را می‌شناسند. این‌ها رشته‌هایی‌اند که ما را به هم وصل می‌کنند.
          </p>
          <Link
            href="/explore?geographicScope=NATIONAL"
            className={cn(buttonVariants({ variant: "glass" }), "h-11")}
          >
            دیدن مطالب سراسری
            <ArrowLeftIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {entries.length > 0 ? (
          <ul className="grid gap-3">
            {entries.map((entry, index) => (
              <li key={entry.id}>
                <Link
                  href={createEntryHref(entry)}
                  className="group flex items-center gap-4 rounded-[18px_18px_18px_6px] border border-white/16 bg-white/10 p-3 outline-none backdrop-blur-sm transition-colors duration-200 hover:bg-white/18 focus-visible:outline-2 focus-visible:outline-white"
                >
                  <span className="relative size-18 shrink-0 overflow-hidden rounded-[14px_14px_14px_4px] bg-white/10">
                    <EntryImage
                      entry={entry}
                      fallbackIndex={index + 2}
                      className="object-cover"
                      sizes="72px"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11.5px] font-bold text-white/70">
                      {entry.category.name}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-[15px] leading-[1.8] font-bold">
                      {entry.title}
                    </span>
                  </span>
                  <ArrowLeftIcon
                    className="size-4 shrink-0 opacity-70 transition-transform group-hover:-translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-[18px_18px_18px_6px] border border-dashed border-white/30 p-6 text-[14px] leading-[2] text-white/85">
            هنوز مطلب سراسری منتشر نشده است. رسمی را می‌شناسید که همه‌ی افغانستان با آن آشناست؟
            نخستین کسی باشید که آن را ثبت می‌کند.
          </p>
        )}
      </div>
    </ScrollReveal>
  );
}

function TopicsSection({ categories }: { categories: TaxonomyItem[] }) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <ScrollReveal as="section" className="content-container" aria-labelledby="home-topics">
      <SectionHead
        id="home-topics"
        title="موضوع‌های فرهنگی"
        word="فرهنگ"
        action={{ href: "/categories", label: "همه‌ی موضوع‌ها" }}
      />
      <ul className="mt-8 flex flex-wrap gap-3">
        {categories.map((category, index) => (
          <li key={category.id}>
            <Link
              href={taxonomyItemHref("/categories", category)}
              className="group inline-flex items-center gap-2.5 rounded-bubble-sm border border-line bg-surface px-4.5 py-3 text-[14px] font-bold text-ink shadow-card outline-none transition-[translate,border-color,color] duration-200 ease-expo hover:-translate-y-0.5 hover:border-brand/40 hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "size-2.5 rotate-45 rounded-[2px] bg-linear-150",
                  tileColourways[index % tileColourways.length],
                )}
              />
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </ScrollReveal>
  );
}

function LatestEntriesSection({ entries }: { entries: PublicEntryCard[] }) {
  return (
    <ScrollReveal as="section" className="content-container" aria-labelledby="home-updated">
      <SectionHead
        id="home-updated"
        title="تازه کامل‌شده‌ها"
        word="تازه"
        action={{ href: "/explore?sort=recentlyUpdated", label: "دیدن همه" }}
      />
      <p className="mt-3 max-w-[62ch] text-[14.5px] leading-[2] text-copy">
        مطالبی که به‌تازگی ویرایش و کامل‌تر شده‌اند. دانش جمعی هیچ‌وقت تمام نمی‌شود؛ هر کسی
        می‌تواند نکته‌ای به آن بیفزاید.
      </p>

      {entries.length > 0 ? (
        <EngagementAccessProvider>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {entries.map((entry, index) => (
              <ScrollReveal key={entry.id} delay={index * 0.04}>
                <PublicEntryCardView entry={entry} imageIndex={index} />
              </ScrollReveal>
            ))}
          </div>
        </EngagementAccessProvider>
      ) : (
        <EmptyState
          className="mt-8"
          description="هنوز مطلبی ویرایش نشده است. با افزودن جزئیات به یک مطلب، آن را کامل‌تر کنید."
        />
      )}
    </ScrollReveal>
  );
}

/** Closing invitation on navy: the main message of the page, with gentle reassurances. */
function ContributionCallout({ contentTypes }: { contentTypes: TaxonomyItem[] }) {
  return (
    <ScrollReveal as="section" className="content-container" aria-labelledby="home-callout">
      <div className="relative isolate overflow-hidden rounded-[32px_32px_32px_10px] bg-linear-155 from-hero-navy to-hero-navy-deep px-6 py-12 text-white shadow-lift sm:px-12 sm:py-16">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -end-[0.05em] -bottom-[0.3em] -z-10 font-calli text-[170px] leading-none text-white opacity-[0.07] select-none max-lg:text-[110px]"
        >
          نسل‌ها
        </span>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center">
          <div className="space-y-5">
            <p className="font-hand text-[20px] text-gold">برای فردا، از امروز</p>
            <h2
              id="home-callout"
              className="max-w-[28ch] text-[26px] leading-[1.6] font-bold sm:text-[34px]"
            >
              حافظه‌ی یک ملت را همه‌ی ما با هم می‌نویسیم
            </h2>
            <p className="max-w-[56ch] text-[15px] leading-[2.1] text-white/80">
              کودکانی که فردا می‌خواهند بدانند پدران و مادران‌شان چگونه زندگی می‌کردند، چه
              می‌خواندند و چه می‌ساختند، پاسخ را در نوشته‌های امروز ما پیدا می‌کنند.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/entries/new"
                className={cn(buttonVariants({ variant: "pill" }), "h-12 px-6 text-[14.5px]")}
              >
                <PencilSquareIcon className="size-5" aria-hidden="true" />
                سهم خود را بنویسید
              </Link>
              <Link href="/register" className={cn(buttonVariants({ variant: "glass" }), "h-12")}>
                به جمع مشارکت‌کنندگان بپیوندید
              </Link>
            </div>
          </div>

          <div className="space-y-5 rounded-bubble border border-white/14 bg-white/6 p-6">
            <ul className="space-y-3 text-[14px] leading-[1.9] text-white/88">
              {[
                "نیازی نیست نویسنده یا پژوهشگر باشید.",
                "به زبان ساده و با لهجه‌ی خودتان بنویسید.",
                "هر مطلب پیش از انتشار با دقت بازبینی می‌شود.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <CheckBadgeIcon className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
            {contentTypes.length > 0 ? (
              <div className="border-t border-white/12 pt-4">
                <p className="text-[12.5px] text-white/65">می‌توانید این‌ها را ثبت کنید:</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {contentTypes.map((contentType) => (
                    <li key={contentType.id}>
                      <Badge variant="glass">{contentType.name}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
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
      <p
        role="status"
        className="rounded-card border border-saffron/30 bg-tint-sand px-4 py-3 text-[14px] leading-[1.9] text-ink"
      >
        ارتباط با سرور برقرار نشد؛ بعضی بخش‌های این صفحه موقتاً خالی نمایش داده می‌شوند.
      </p>
    </div>
  );
}

function FeaturedEmptyState() {
  return (
    <EmptyState
      title="نخستین روایت را شما بنویسید"
      description="هنوز مطلبی منتشر نشده است. هر بایگانی بزرگی با یک نوشته آغاز می‌شود."
      action={
        <Link href="/entries/new" className={buttonVariants({ variant: "pill" })}>
          افزودن مطلب
        </Link>
      }
    />
  );
}

function SideEmptyState() {
  return (
    <EmptyState
      size="compact"
      illustration="none"
      className="sm:col-span-2 lg:col-span-1"
      description="مطالب بیشتر پس از انتشار اینجا دیده می‌شوند."
    />
  );
}

export { HomeContent };
