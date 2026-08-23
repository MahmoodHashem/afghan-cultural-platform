"use client";

import { ArrowLeftIcon, MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getProvinceImage } from "@/lib/images/province-images";
import { formatPersianNumber } from "@/lib/utils/formatters";
import { createPersianPathSegment, normalizePersianSearch } from "@/lib/utils/persian";
import type { TaxonomyItem } from "../types/public-entry";

type CountedProvince = TaxonomyItem & {
  entryCount: number;
};

function ProvinceSearchGrid({ provinces }: { provinces: CountedProvince[] }) {
  const [search, setSearch] = useState("");
  const normalizedSearch = normalizePersianSearch(search);
  const filteredProvinces = useMemo(() => {
    if (!normalizedSearch) {
      return provinces;
    }

    return provinces.filter((province) =>
      normalizePersianSearch(`${province.name} ${province.slug}`).includes(normalizedSearch),
    );
  }, [provinces, normalizedSearch]);

  return (
    <div className="mt-10 space-y-6">
      <label htmlFor="province-search" className="relative mx-auto block max-w-xl">
        <span className="sr-only">جست‌وجوی ولایت</span>
        <MagnifyingGlassIcon
          className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="province-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="جست‌وجوی ولایت..."
          className="h-12 rounded-full border-border bg-card pr-12 pl-4 text-center shadow-[0_2px_10px_rgba(0,0,0,.04)] transition-colors focus-visible:border-primary"
        />
      </label>

      <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filteredProvinces.map((province) => (
            <ProvinceCard key={province.id} province={province} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredProvinces.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] border border-dashed border-border bg-card p-8 text-center"
        >
          <p className="text-[20px] font-bold text-foreground">ولایتی پیدا نشد</p>
          <p className="mt-3 text-[15px] leading-8 text-muted-foreground">
            نام ولایت را کوتاه‌تر یا متفاوت‌تر جست‌وجو کنید.
          </p>
        </motion.div>
      ) : null}
    </div>
  );
}

function ProvinceCard({ province }: { province: CountedProvince }) {
  const image = getProvinceImage(province, "thumbnail");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <Card className="group overflow-hidden rounded-2xl border-border bg-card p-0 shadow-[0_2px_10px_rgba(0,0,0,.04)] transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_18px_42px_rgba(31,41,55,0.16)]">
        <Link
          href={`/provinces/${encodeURIComponent(createPersianPathSegment(province.name))}`}
          className="block outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-muted sm:aspect-[5/6] lg:aspect-[4/5]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/78 via-black/20 to-black/10 transition-colors group-hover:from-black/82" />
            <div className="absolute inset-x-0 bottom-0 space-y-4 p-4 text-white sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-full border border-white/20 bg-white/16 text-white shadow-sm backdrop-blur-md">
                  <MapPinIcon className="size-4" aria-hidden="true" />
                </span>
                <Badge className="rounded-full border border-white/20 bg-white/16 text-white shadow-sm backdrop-blur-md">
                  {formatPersianNumber(province.entryCount)} مطلب
                </Badge>
              </div>
              <div className="space-y-2">
                <h2 className="text-[24px] font-bold leading-8 text-white">{province.name}</h2>
                <p className="inline-flex items-center gap-1 text-[13px] font-semibold text-white/78 transition-colors group-hover:text-white">
                  دیدن مطالب
                  <ArrowLeftIcon
                    className="size-4 transition-transform group-hover:-translate-x-1"
                    aria-hidden="true"
                  />
                </p>
              </div>
            </div>
          </div>
        </Link>
      </Card>
    </motion.div>
  );
}

export { ProvinceSearchGrid };
