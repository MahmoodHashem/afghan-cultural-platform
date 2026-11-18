"use client";

import { ArrowLeftIcon, CalendarDaysIcon, MapPinIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import { useEffect } from "react";
import { toast } from "sonner";
import { BookmarkIcon } from "@/components/icons/animated/bookmark";

import { ChatBubbleOvalLeftEllipsisIcon } from "@/components/icons/animated/chat-bubble-oval-left-ellipsis";
import { HeartIcon } from "@/components/icons/animated/heart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useEngagementAccess } from "@/features/engagement/hooks/use-engagement-access";
import { useEntryBookmark } from "@/features/engagement/hooks/use-entry-interactions";
import { cn } from "@/lib/utils";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";
import type { PublicEntryCard } from "../types/public-entry";
import {
  createEntryHref,
  type EntryBreadcrumbContext,
  serializeEntryBreadcrumbContext,
} from "../utils/entry-breadcrumb";
import { getEntryLocationLabel } from "../utils/geography";
import { ActionButton } from "./entry-action-rail";

const fallbackImages = [
  "/images/HERAT02.jpg",
  "/images/bamyan.jpg",
  "/images/menaras.jpg",
  "/images/mazar.jpg",
] as const;

type PublicEntryCardViewProps = {
  entry: PublicEntryCard;
  imageIndex?: number;
  breadcrumbParent?: EntryBreadcrumbContext;
  /** `lead` lays the card out horizontally across two grid columns on large screens. */
  variant?: "default" | "lead";
};

function PublicEntryCardView({
  entry,
  imageIndex = 0,
  breadcrumbParent,
  variant = "default",
}: PublicEntryCardViewProps) {
  const {
    status,
    isAuthenticated,
    canContribute,
    pendingIntent,
    ensureVerifiedAccess,
    takePendingToggleIntent,
  } = useEngagementAccess();

  const bookmark = useEntryBookmark({
    entryId: entry.id,
    initialCount: entry.bookmarkCount,
    isAuthenticated,
  });

  useEffect(() => {
    if (
      !canContribute ||
      bookmark.isLoading ||
      pendingIntent?.kind !== "bookmark" ||
      pendingIntent.entryId !== entry.id
    ) {
      return;
    }

    const intent = takePendingToggleIntent("bookmark");
    if (!intent || intent.desiredState === bookmark.bookmarked) return;

    void bookmark
      .setBookmarked(intent.desiredState)
      .then((result) => {
        if (result) {
          toast.success(
            intent.desiredState
              ? "مطلب در ذخیره‌های شما قرار گرفت."
              : "مطلب از ذخیره‌های شما برداشته شد.",
          );
        }
      })
      .catch(() => undefined);
  }, [bookmark, canContribute, entry.id, pendingIntent, takePendingToggleIntent]);

  function toggleBookmark() {
    if (
      ensureVerifiedAccess(
        "bookmark",
        { kind: "bookmark", desiredState: !bookmark.bookmarked },
        { entryId: entry.id, entryPath: entryHref(entry) },
      )
    ) {
      bookmark.toggle();
    }
  }

  const isLead = variant === "lead";

  return (
    <Card
      data-variant={variant}
      className={cn(
        "group relative h-full gap-0 overflow-hidden rounded-card border border-line bg-surface py-0 shadow-none transition-[translate,box-shadow,border-color] duration-250 ease-expo hover:-translate-y-1 hover:border-transparent hover:shadow-lift has-[a:focus-visible]:-translate-y-1 has-[a:focus-visible]:shadow-lift",
        isLead && "lg:flex-row",
      )}
    >
      <Link
        href={entryHref(entry)}
        data-entry-breadcrumb-context={serializeEntryBreadcrumbContext(breadcrumbParent)}
        className={cn(
          "flex h-full flex-col outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
          isLead && "lg:flex-row",
        )}
      >
        <div
          className={cn(
            "relative aspect-video shrink-0 overflow-hidden bg-media-ph",
            isLead && "lg:aspect-auto lg:min-h-64 lg:w-[52%]",
          )}
        >
          <Image
            src={
              entry.coverImage?.thumbnailUrl ??
              entry.coverImage?.secureUrl ??
              fallbackImages[imageIndex % fallbackImages.length]
            }
            alt={entry.coverImage?.altText ?? entry.title}
            fill
            sizes={
              isLead
                ? "(min-width: 1024px) 40vw, 100vw"
                : "(min-width: 1280px) 25vw, (min-width: 768px) 45vw, 100vw"
            }
            className="object-cover transition-transform duration-500 ease-expo group-hover:scale-105"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-linear-155 from-ink/12 to-ink/4 transition-opacity duration-300 group-hover:opacity-0"
          />
          <Badge variant="corner" className="absolute top-3 start-3 z-[1]">
            {entry.category.name}
          </Badge>
        </div>

        <CardContent
          className={cn(
            "flex min-w-0 flex-1 flex-col px-4.5 pt-4 pb-4",
            isLead && "lg:justify-center lg:px-6 lg:py-6",
          )}
        >
          <h2
            className={cn(
              "line-clamp-2 font-bold text-ink transition-colors duration-200 group-hover:text-brand-ink",
              isLead ? "text-[18px] leading-[1.8] lg:line-clamp-3" : "text-[14.5px] leading-[1.9]",
            )}
          >
            {entry.title}
          </h2>
          <p
            className={cn(
              "mt-1.5 text-[12.5px] leading-[2] text-copy",
              isLead ? "line-clamp-3" : "line-clamp-2",
            )}
          >
            {entry.summary}
          </p>

          <div className="mt-2.5 mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-faint">
            <span className="inline-flex items-center gap-1">
              <MapPinIcon className="size-3.5" aria-hidden="true" />
              {getEntryLocationLabel(entry)}
            </span>
            <time dateTime={entry.publishedAt} className="inline-flex items-center gap-1">
              <CalendarDaysIcon className="size-3.5" aria-hidden="true" />
              {formatPersianDate(entry.publishedAt)}
            </time>
          </div>

          <div className="mt-auto flex items-center gap-4 border-t border-line-soft pt-3 text-[11.5px] text-faint">
            <StaticEngagementItem icon={HeartIcon} label="پسندیدن مطلب" count={entry.likeCount} />
            <StaticEngagementItem
              icon={ChatBubbleOvalLeftEllipsisIcon}
              label="دیدگاه‌ها"
              count={entry.commentCount}
            />
            <ArrowLeftIcon
              className="ms-auto size-4 text-brand transition-transform duration-250 ease-expo group-hover:-translate-x-1"
              aria-hidden="true"
            />
          </div>
        </CardContent>
      </Link>
      <BookmarkImageBadge
        bookmarked={bookmark.bookmarked}
        isLoading={bookmark.isLoading || bookmark.isPending}
        disabled={status === "initializing" || bookmark.isLoading}
        onToggle={toggleBookmark}
      />
    </Card>
  );
}

function BookmarkImageBadge({
  bookmarked,
  isLoading,
  disabled,
  onToggle,
}: {
  bookmarked: boolean;
  isLoading: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <ActionButton
      label={bookmarked ? "برداشتن از ذخیره‌ها" : "ذخیره مطلب"}
      orientation="desktop"
      active={bookmarked}
      pending={isLoading}
      disabled={disabled}
      onClick={onToggle}
      icon={BookmarkIcon}
      size={18}
      className={cn(
        "absolute top-3 end-3 z-10 flex min-h-5 min-w-5 items-center justify-center rounded-bubble-xs bg-surface/90 p-2 text-ink backdrop-blur-sm transition-colors hover:bg-surface",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        bookmarked && "text-brand-ink",
        isLoading && "opacity-70",
      )}
    />
  );

  // return (
  //   <ActionButton
  //     type="button"
  //     onClick={onToggle}
  //     disabled={isLoading}
  //     aria-label={bookmarked ? "برداشتن از ذخیره‌ها" : "ذخیره مطلب"}
  //     aria-pressed={bookmarked}
  // className={cn(
  //   "absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1.5 text-ink backdrop-blur-sm transition-colors hover:bg-white",
  //   "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2",
  //   bookmarked && "text-brand-ink  ",
  //   isLoading && "opacity-70",
  // )}
  //   >
  //     <span className="relative size-4">
  //       <BookmarkIcon size={16} aria-hidden="true" />
  //     </span>
  //     <span className="text-[12px] font-medium tabular-nums">{formatPersianNumber(count)}</span>
  //   </ActionButton>
  // );
}

function StaticEngagementItem({
  icon: Icon,
  label,
  count,
}: {
  icon: ComponentType<{ size?: number }>;
  label: string;
  count: number;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-faint">
      <span className="sr-only">{label}: </span>
      <span className="relative size-4">
        <Icon size={16} aria-hidden="true" />
      </span>
      <span className="text-[11.5px] font-medium tabular-nums text-copy">
        {formatPersianNumber(count)}
      </span>
    </span>
  );
}

function entryHref(entry: Pick<PublicEntryCard, "slug">) {
  return createEntryHref(entry);
}

export { entryHref, PublicEntryCardView };
