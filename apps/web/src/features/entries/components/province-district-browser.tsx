"use client";

import { ChevronDownIcon, MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type MouseEvent, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatPersianNumber } from "@/lib/utils/formatters";
import { normalizePersianSearch } from "@/lib/utils/persian";

type DistrictLinkItem = {
  href: string;
  id: string;
  isActive: boolean;
  name: string;
  slug: string;
};

type ProvinceDistrictBrowserProps = {
  allDistrictsHref: string;
  districts: DistrictLinkItem[];
  provinceName: string;
};

const MOBILE_VISIBLE_DISTRICTS = 8;

function ProvinceDistrictBrowser({
  allDistrictsHref,
  districts,
  provinceName,
}: ProvinceDistrictBrowserProps) {
  const router = useRouter();
  const reducedMotion = Boolean(useReducedMotion());
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);
  const normalizedSearch = normalizePersianSearch(search);
  const filteredDistricts = useMemo(() => {
    if (!normalizedSearch) return districts;

    return districts.filter((district) =>
      normalizePersianSearch(district.name).includes(normalizedSearch),
    );
  }, [districts, normalizedSearch]);

  function handleDistrictNavigation(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    router.push(href, { scroll: false });
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("province-entries")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <section
      className="rounded-card border border-line-soft bg-surface px-5 py-6 shadow-card sm:px-7 sm:py-7"
      aria-labelledby="districts-title"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="size-5 text-brand" aria-hidden="true" />
            <h2
              id="districts-title"
              className="text-[19px] leading-[2] font-bold text-ink"
            >
              ولسوالی‌های {provinceName}
            </h2>
          </div>
          <p className="mt-1 text-[12.5px] leading-6 text-faint">
            {formatPersianNumber(districts.length)} ولسوالی ثبت شده است.
          </p>
        </div>

        {districts.length > 10 ? (
          <label htmlFor="district-search" className="relative block w-full sm:w-72">
            <span className="sr-only">جست‌وجوی ولسوالی</span>
            <MagnifyingGlassIcon
              className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-faint"
              aria-hidden="true"
            />
            <Input
              id="district-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="نام ولسوالی..."
              className="h-10 pr-10 md:text-[13px]"
            />
          </label>
        ) : null}
      </div>

      <motion.div
        layout
        className="mt-5 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3 lg:grid-cols-4"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {!normalizedSearch ? (
            <DistrictLink
              key="all-districts"
              href={allDistrictsHref}
              isActive={districts.every((district) => !district.isActive)}
              onNavigate={handleDistrictNavigation}
              reducedMotion={reducedMotion}
            >
              همه ولسوالی‌ها
            </DistrictLink>
          ) : null}

          {filteredDistricts.map((district, index) => (
            <DistrictLink
              key={district.id}
              href={district.href}
              isActive={district.isActive}
              onNavigate={handleDistrictNavigation}
              reducedMotion={reducedMotion}
              className={cn(
                !normalizedSearch &&
                  !expanded &&
                  !district.isActive &&
                  index >= MOBILE_VISIBLE_DISTRICTS &&
                  "hidden sm:block",
              )}
            >
              {district.name}
            </DistrictLink>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence initial={false}>
        {filteredDistricts.length === 0 ? (
          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: reducedMotion ? 0 : 0.18, ease: "easeOut" }}
            className="mt-5 rounded-bubble-sm border-[1.5px] border-dashed border-line px-4 py-5 text-center text-[13px] text-copy"
          >
            ولسوالی‌ای با این نام پیدا نشد.
          </motion.p>
        ) : null}
      </AnimatePresence>

      {!normalizedSearch && districts.length > MOBILE_VISIBLE_DISTRICTS ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-4 inline-flex min-h-10 items-center gap-1.5 rounded-full text-[13px] font-bold text-brand-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:hidden"
          aria-expanded={expanded}
        >
          {expanded ? "نمایش کمتر" : "نمایش همه ولسوالی‌ها"}
          <ChevronDownIcon
            className={cn("size-4 transition-transform", expanded && "rotate-180")}
            aria-hidden="true"
          />
        </button>
      ) : null}
    </section>
  );
}

function DistrictLink({
  href,
  isActive,
  onNavigate,
  reducedMotion,
  className,
  children,
}: {
  href: string;
  isActive: boolean;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
  reducedMotion: boolean;
  className?: string;
  children: string;
}) {
  return (
    <motion.div
      layout
      initial={reducedMotion ? false : { opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reducedMotion ? undefined : { opacity: 0, scale: 0.97 }}
      transition={{ duration: reducedMotion ? 0 : 0.18, ease: "easeOut" }}
      className={className}
    >
      <Link
        href={href}
        scroll={false}
        onClick={(event) => onNavigate(event, href)}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex min-h-11 w-full items-center rounded-bubble-sm border px-3 py-2 text-[13px] font-medium transition-colors duration-200 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          isActive
            ? "border-brand bg-brand-soft font-bold text-brand-ink"
            : "border-line bg-paper text-copy hover:border-brand hover:bg-brand-soft hover:text-brand-ink",
        )}
      >
        <span className="truncate">{children}</span>
      </Link>
    </motion.div>
  );
}

export type { DistrictLinkItem };
export { ProvinceDistrictBrowser };
