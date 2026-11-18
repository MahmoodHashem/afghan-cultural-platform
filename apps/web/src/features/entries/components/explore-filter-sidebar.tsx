"use client";

import {
  ChevronDownIcon,
  GlobeAsiaAustraliaIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PencilSquareIcon,
  RectangleStackIcon,
  Squares2X2Icon,
  TagIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { type ComponentType, type ReactNode, type SVGProps, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { normalizePersianSearch } from "@/lib/utils/persian";
import type { TaxonomyItem } from "../types/public-entry";
import { createExploreHref, type NormalizedExploreQuery } from "../utils/explore-query";

type FilterKey = "provinceSlug" | "categorySlug" | "contentTypeSlug" | "tagSlug";

type ExploreFilterSidebarProps = {
  taxonomy: {
    provinces: TaxonomyItem[];
    categories: TaxonomyItem[];
    contentTypes: TaxonomyItem[];
    tags: TaxonomyItem[];
  };
  query: NormalizedExploreQuery;
};

const TAG_PREVIEW_COUNT = 14;

/** Persian-tile colourways used as small markers beside topics. */
const topicMarkers = ["bg-lapis", "bg-turquoise", "bg-saffron", "bg-anar"] as const;

/**
 * Desktop filter column: every option is a plain link, so filtering works without JavaScript and
 * each state has its own URL. Provinces can be searched; tags collapse after a short preview.
 */
function ExploreFilterSidebar({ taxonomy, query }: ExploreFilterSidebarProps) {
  const filterHref = (key: FilterKey, value: string | undefined) =>
    createExploreHref(query, { page: 1, [key]: value });

  return (
    <aside
      aria-label="فیلتر مطالب"
      className="space-y-3 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:pe-1 lg:[scrollbar-width:thin]"
    >
      <FilterGroup title="گستره" icon={GlobeAsiaAustraliaIcon}>
        <div className="grid grid-cols-2 gap-1 rounded-full bg-paper p-1">
          <ScopeLink query={query} value={undefined} label="همه" />
          <ScopeLink query={query} value="NATIONAL" label="سراسری" />
        </div>
      </FilterGroup>

      <ProvinceGroup
        provinces={taxonomy.provinces}
        selected={query.provinceSlug}
        hrefFor={(value) => filterHref("provinceSlug", value)}
      />

      <FilterGroup title="موضوع" icon={Squares2X2Icon}>
        <ul className="space-y-0.5">
          <li>
            <OptionLink
              href={filterHref("categorySlug", undefined)}
              active={!query.categorySlug}
              label="همه موضوع‌ها"
            />
          </li>
          {taxonomy.categories.map((category, index) => (
            <li key={category.id}>
              <OptionLink
                href={filterHref("categorySlug", category.slug)}
                active={query.categorySlug === category.slug}
                label={category.name}
                marker={topicMarkers[index % topicMarkers.length]}
              />
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="نوع مطلب" icon={RectangleStackIcon}>
        <div className="flex flex-wrap gap-1.5">
          <PillLink
            href={filterHref("contentTypeSlug", undefined)}
            active={!query.contentTypeSlug}
            label="همه"
          />
          {taxonomy.contentTypes.map((type) => (
            <PillLink
              key={type.id}
              href={filterHref("contentTypeSlug", type.slug)}
              active={query.contentTypeSlug === type.slug}
              label={type.name}
            />
          ))}
        </div>
      </FilterGroup>

      {taxonomy.tags.length > 0 ? (
        <TagGroup
          tags={taxonomy.tags}
          selected={query.tagSlug}
          hrefFor={(value) => filterHref("tagSlug", value)}
        />
      ) : null}

      <div className="rounded-card bg-tint-sand p-4">
        <p className="text-[13px] leading-[1.9] text-copy">
          موضوعی را که دنبالش هستید پیدا نکردید؟ شاید وقت نوشتنش رسیده باشد.
        </p>
        <Link
          href="/entries/new"
          className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-ink underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
        >
          <PencilSquareIcon className="size-4" aria-hidden="true" />
          نوشتن مطلب تازه
        </Link>
      </div>
    </aside>
  );
}

function FilterGroup({
  title,
  icon: Icon,
  children,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const heading = (
    <span className="flex items-center gap-2 text-[13.5px] font-bold text-ink">
      <Icon className="size-4.5 text-faint" aria-hidden="true" />
      {title}
    </span>
  );

  return (
    <section className="rounded-card border border-line-soft bg-surface p-4 shadow-card">
      {collapsible ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between rounded-control outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {heading}
          <ChevronDownIcon
            className={cn("size-4 text-faint transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
        </button>
      ) : (
        <h2>{heading}</h2>
      )}
      {open ? <div className="mt-3">{children}</div> : null}
    </section>
  );
}

function ProvinceGroup({
  provinces,
  selected,
  hrefFor,
}: {
  provinces: TaxonomyItem[];
  selected?: string;
  hrefFor: (value: string | undefined) => string;
}) {
  const [search, setSearch] = useState("");
  const visible = useMemo(() => {
    const normalized = normalizePersianSearch(search);
    if (!normalized) return provinces;
    return provinces.filter((province) =>
      normalizePersianSearch(province.name).includes(normalized),
    );
  }, [provinces, search]);

  return (
    <FilterGroup title="ولایت" icon={MapPinIcon} collapsible>
      <label className="flex h-9 items-center gap-2 rounded-full border border-line bg-paper px-3 focus-within:border-ring focus-within:shadow-focus">
        <MagnifyingGlassIcon className="size-4 shrink-0 text-faint" aria-hidden="true" />
        <span className="sr-only">جست‌وجوی ولایت</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="جست‌وجوی ولایت..."
          className="h-full min-w-0 flex-1 bg-transparent text-[12.5px] text-ink outline-none placeholder:text-faint"
        />
      </label>
      <ul className="mt-2 max-h-64 space-y-0.5 overflow-y-auto overscroll-contain pe-1 [scrollbar-width:thin]">
        {!search ? (
          <li>
            <OptionLink href={hrefFor(undefined)} active={!selected} label="همه ولایت‌ها" />
          </li>
        ) : null}
        {visible.map((province) => (
          <li key={province.id}>
            <OptionLink
              href={hrefFor(province.slug)}
              active={selected === province.slug}
              label={province.name}
            />
          </li>
        ))}
        {visible.length === 0 ? (
          <li className="px-2 py-3 text-center text-[12.5px] text-faint">ولایتی پیدا نشد</li>
        ) : null}
      </ul>
    </FilterGroup>
  );
}

function TagGroup({
  tags,
  selected,
  hrefFor,
}: {
  tags: TaxonomyItem[];
  selected?: string;
  hrefFor: (value: string | undefined) => string;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? tags : tags.slice(0, TAG_PREVIEW_COUNT);

  return (
    <FilterGroup title="برچسب" icon={TagIcon} collapsible defaultOpen={Boolean(selected)}>
      <div className="flex flex-wrap gap-1.5">
        {selected ? <PillLink href={hrefFor(undefined)} active={false} label="همه" /> : null}
        {visible.map((tag) => (
          <PillLink
            key={tag.id}
            href={hrefFor(tag.slug)}
            active={selected === tag.slug}
            label={`#${tag.name}`}
          />
        ))}
      </div>
      {tags.length > TAG_PREVIEW_COUNT ? (
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          className="mt-3 text-[12.5px] font-bold text-brand-ink hover:underline"
        >
          {showAll ? "نمایش کمتر" : "نمایش همه‌ی برچسب‌ها"}
        </button>
      ) : null}
    </FilterGroup>
  );
}

function OptionLink({
  href,
  active,
  label,
  marker,
}: {
  href: string;
  active: boolean;
  label: string;
  marker?: string;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-[10px_10px_10px_3px] px-2.5 py-2 text-[13px] text-copy outline-none transition-colors hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-ring",
        active && "bg-brand-soft font-bold text-brand-ink hover:bg-brand-soft hover:text-brand-ink",
      )}
    >
      {marker ? (
        <span aria-hidden="true" className={cn("size-2 rotate-45 rounded-[1px]", marker)} />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            "size-2 rounded-full border border-line",
            active && "border-brand bg-brand",
          )}
        />
      )}
      <span className="truncate">{label}</span>
    </Link>
  );
}

function PillLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-full border px-3 py-1 text-[12px] font-medium outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-line bg-surface text-copy hover:border-brand/40 hover:text-brand-ink",
      )}
    >
      {label}
    </Link>
  );
}

function ScopeLink({
  query,
  value,
  label,
}: {
  query: NormalizedExploreQuery;
  value: "NATIONAL" | undefined;
  label: string;
}) {
  const active = query.geographicScope === value || (!value && !query.geographicScope);

  return (
    <Link
      href={createExploreHref(query, { page: 1, geographicScope: value })}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-full py-1.5 text-center text-[12.5px] font-bold outline-none transition-colors focus-visible:outline-2 focus-visible:outline-ring",
        active ? "bg-surface text-ink shadow-card" : "text-faint hover:text-ink",
      )}
    >
      {label}
    </Link>
  );
}

export { ExploreFilterSidebar };
