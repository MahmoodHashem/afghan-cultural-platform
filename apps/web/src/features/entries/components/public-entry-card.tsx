"use client";

import { ArrowLeftIcon, MapPinIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import { useEffect } from "react";
import { toast } from "sonner";
import { BookmarkIcon } from "@/components/icons/animated/bookmark";
import { ChatBubbleOvalLeftEllipsisIcon } from "@/components/icons/animated/chat-bubble-oval-left-ellipsis";
import { HeartIcon } from "@/components/icons/animated/heart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useEngagementAccess } from "@/features/engagement/hooks/use-engagement-access";
import { useEntryBookmark } from "@/features/engagement/hooks/use-entry-interactions";
import { cn } from "@/lib/utils";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";
import { createUserInitials, getUserAvatarColorClass } from "@/lib/utils/user";
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
  const author = entry.author;
  const hasEngagement = entry.likeCount > 0 || entry.commentCount > 0;

  return (
    <Card
      data-variant={variant}
      className={cn(
        "group relative h-full gap-0 overflow-hidden rounded-[20px_20px_20px_6px] border border-line-soft bg-surface py-0 shadow-card transition-[translate,box-shadow] duration-300 ease-expo hover:-translate-y-1 hover:shadow-lift has-[a:focus-visible]:-translate-y-1 has-[a:focus-visible]:shadow-lift",
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
            "relative aspect-[16/10] shrink-0 overflow-hidden bg-media-ph",
            isLead && "lg:aspect-auto lg:min-h-80 lg:w-[56%]",
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
                ? "(min-width: 1024px) 45vw, 100vw"
                : "(min-width: 1280px) 25vw, (min-width: 768px) 45vw, 100vw"
            }
            className="object-cover transition-transform duration-700 ease-expo group-hover:scale-[1.04]"
          />
          <Badge variant="corner" className="absolute bottom-3 start-3 z-[1] shadow-card">
            {entry.category.name}
          </Badge>
        </div>

        <CardContent
          className={cn(
            "flex min-w-0 flex-1 flex-col px-5 pt-4 pb-5",
            isLead && "lg:justify-center lg:px-9 lg:py-9",
          )}
        >
          <p className="flex items-center gap-1.5 text-[11.5px] text-faint">
            <MapPinIcon className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{getEntryLocationLabel(entry)}</span>
            <span aria-hidden="true" className="size-0.5 shrink-0 rounded-full bg-faint" />
            <time dateTime={entry.publishedAt} className="shrink-0">
              {formatPersianDate(entry.publishedAt)}
            </time>
          </p>
          <h2
            className={cn(
              "mt-2 line-clamp-2 font-bold text-ink transition-colors duration-200 group-hover:text-brand-ink",
              isLead
                ? "text-[19px] leading-[1.75] lg:line-clamp-3 lg:text-[24px]"
                : "text-[16px] leading-[1.8]",
            )}
          >
            {entry.title}
          </h2>
          <p
            className={cn(
              "mt-1.5 text-[13px] leading-[2] text-copy",
              isLead ? "line-clamp-3 lg:text-[14px]" : "line-clamp-2",
            )}
          >
            {entry.summary}
          </p>

          <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-[11.5px] text-faint">
            <span className="flex min-w-0 items-center gap-2">
              <Avatar className="size-5 shrink-0">
                {author.profileImageUrl ? (
                  <AvatarImage src={author.profileImageUrl} alt="" />
                ) : null}
                <AvatarFallback
                  className={cn("text-[9px] font-bold", getUserAvatarColorClass(author.id))}
                >
                  {createUserInitials(author.displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-right" dir="auto">
                {author.displayName}
              </span>
            </span>
            {hasEngagement ? (
              <span className="flex shrink-0 items-center gap-3">
                <StaticEngagementItem
                  icon={HeartIcon}
                  label="پسندیدن مطلب"
                  count={entry.likeCount}
                />
                <StaticEngagementItem
                  icon={ChatBubbleOvalLeftEllipsisIcon}
                  label="دیدگاه‌ها"
                  count={entry.commentCount}
                />
              </span>
            ) : (
              <span className="inline-flex shrink-0 items-center gap-1 font-bold text-brand-ink opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                خواندن
                <ArrowLeftIcon className="size-3.5" aria-hidden="true" />
              </span>
            )}
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
        "absolute top-3 end-3 z-10 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-black/25 p-2 text-white backdrop-blur-md transition-[background-color,color,opacity] hover:bg-surface hover:text-ink md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        bookmarked && "bg-surface text-brand-ink opacity-100 md:opacity-100",
        isLoading && "opacity-70",
      )}
    />
  );
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
    <span className="inline-flex items-center gap-1 text-faint">
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
