import { CalendarDaysIcon, MapPinIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PublicEntryCard } from "../types/public-entry";

const fallbackImages = [
  "/images/HERAT02.jpg",
  "/images/bamyan.jpg",
  "/images/menaras.jpg",
  "/images/mazar.jpg",
] as const;

type PublicEntryCardViewProps = {
  entry: PublicEntryCard;
  imageIndex?: number;
};

function PublicEntryCardView({ entry, imageIndex = 0 }: PublicEntryCardViewProps) {
  return (
    <Card className="group overflow-hidden rounded-2xl border-border bg-card p-0 shadow-[0_2px_10px_rgba(0,0,0,.04)] transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_14px_34px_rgba(31,41,55,0.09)]">
      <Link
        href={entryHref(entry)}
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
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 45vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-x-0 bottom-0 flex justify-end bg-linear-to-t from-black/45 to-transparent p-3">
            <Badge className="rounded-full bg-primary text-primary-foreground shadow-sm">
              {entry.category.name}
            </Badge>
          </div>
        </div>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full text-[12px]">
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
              {formatPersianDate(entry.publishedAt)}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

function entryHref(entry: Pick<PublicEntryCard, "slug">) {
  return `/entries/${encodeURIComponent(entry.slug)}`;
}

function locationLabel(entry: Pick<PublicEntryCard, "geographicScope" | "province">) {
  if (entry.geographicScope === "NATIONAL") {
    return "سراسر افغانستان";
  }

  if (entry.geographicScope === "NONE") {
    return "بدون وابستگی جغرافیایی";
  }

  return entry.province?.name ?? "ولایت مشخص";
}

function formatPersianDate(value: string) {
  return new Intl.DateTimeFormat("fa-AF", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatPersianNumber(value: number) {
  return new Intl.NumberFormat("fa-AF").format(value);
}

export { entryHref, formatPersianDate, formatPersianNumber, locationLabel, PublicEntryCardView };
