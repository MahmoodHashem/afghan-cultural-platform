"use client";

import { CalendarDaysIcon, MapPinIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import { useEffect } from "react";
import { toast } from "sonner";
import { BookmarkIcon } from "@/components/icons/animated/bookmark";

import { ChatBubbleOvalLeftEllipsisIcon } from "@/components/icons/animated/chat-bubble-oval-left-ellipsis";
import { HeartIcon } from "@/components/icons/animated/heart";
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
};

function PublicEntryCardView({
  entry,
  imageIndex = 0,
  breadcrumbParent,
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

  return (
    <Card className="group relative h-full overflow-hidden rounded-xl border border-border/80 bg-card p-3 shadow-[0_2px_10px_rgba(0,0,0,.05)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-primary/20 hover:shadow-[0_8px_24px_rgba(0,0,0,.08)]">
      <Link
        href={entryHref(entry)}
        data-entry-breadcrumb-context={serializeEntryBreadcrumbContext(breadcrumbParent)}
        className="block h-full outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
          <Image
            src={
              entry.coverImage?.thumbnailUrl ??
              entry.coverImage?.secureUrl ??
              fallbackImages[imageIndex % fallbackImages.length]
            }
            alt={entry.coverImage?.altText ?? entry.title}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 45vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-x-0 bottom-0 flex justify-end bg-linear-to-t from-black/40 to-transparent p-3">
            <span className="rounded-full bg-white/90 px-3 py-1 text-[12px] font-medium text-foreground backdrop-blur-sm">
              {entry.category.name}
            </span>
          </div>
        </div>

        <CardContent className=" pt-3 px-1 space-y-3 ">
          <h2 className="line-clamp-1 text-[20px] font-semibold leading-7 text-foreground">
            {entry.title}
          </h2>
          <p className="line-clamp-2 text-[14px] leading-7 text-muted-foreground">
            {entry.summary}
          </p>

          <div className="flex items-center justify-between text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon className="size-3.5" aria-hidden="true" />
              {getEntryLocationLabel(entry)}
            </span>
            <time dateTime={entry.publishedAt} className="inline-flex items-center gap-1.5">
              <CalendarDaysIcon className="size-3.5" aria-hidden="true" />
              {formatPersianDate(entry.publishedAt)}
            </time>
          </div>

          <div className="flex items-center gap-4 text-muted-foreground border-t border-border/80 pt-3 text-[13px]">
            <StaticEngagementItem icon={HeartIcon} label="پسندیدن مطلب" count={entry.likeCount} />
            <StaticEngagementItem
              icon={ChatBubbleOvalLeftEllipsisIcon}
              label="دیدگاه‌ها"
              count={entry.commentCount}
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
        "absolute top-6 right-6 z-10 flex min-h-5 min-w-5 items-center justify-center rounded-2xl bg-card/90 p-2 text-foreground backdrop-blur-sm transition-colors hover:bg-card",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2",
        bookmarked && "text-primary",
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
  //   "absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1.5 text-foreground backdrop-blur-sm transition-colors hover:bg-white",
  //   "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2",
  //   bookmarked && "text-primary  ",
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
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className="sr-only">{label}: </span>
      <span className="relative size-4">
        <Icon size={16} aria-hidden="true" />
      </span>
      <span className="text-[13px] font-medium tabular-nums text-foreground/80">
        {formatPersianNumber(count)}
      </span>
    </span>
  );
}

function entryHref(entry: Pick<PublicEntryCard, "slug">) {
  return createEntryHref(entry);
}

export { entryHref, PublicEntryCardView };
