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
      className="border-y border-border bg-card/55 py-7 px-4 sm:py-9"
      aria-labelledby="districts-title"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="size-5 text-primary" aria-hidden="true" />
            <h2
              id="districts-title"
              className="text-[21px] font-bold text-foreground sm:text-[24px]"
            >
              ولسوالی‌های {provinceName}
            </h2>
          </div>
          <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
            {formatPersianNumber(districts.length)} ولسوالی ثبت شده است.
          </p>
        </div>

        {districts.length > 10 ? (
          <label htmlFor="district-search" className="relative block w-full sm:w-72">
            <span className="sr-only">جست‌وجوی ولسوالی</span>
            <MagnifyingGlassIcon
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="district-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="نام ولسوالی..."
              className="h-10 rounded-lg border-border bg-background pr-10 text-[13px]"
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
            className="mt-5 rounded-lg border border-dashed border-border px-4 py-5 text-center text-[13px] text-muted-foreground"
          >
            ولسوالی‌ای با این نام پیدا نشد.
          </motion.p>
        ) : null}
      </AnimatePresence>

      {!normalizedSearch && districts.length > MOBILE_VISIBLE_DISTRICTS ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-[13px] font-semibold text-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/40 sm:hidden"
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
          "flex min-h-11 w-full items-center rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
          isActive
            ? "border-primary/35 bg-primary-light text-primary"
            : "border-border/80 bg-background text-foreground hover:border-primary/25 hover:bg-primary-light/35",
        )}
      >
        <span className="truncate">{children}</span>
      </Link>
    </motion.div>
  );
}

export type { DistrictLinkItem };
export { ProvinceDistrictBrowser };
