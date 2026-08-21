"use client";

import {
  BookmarkIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  HeartIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import {
  BookmarkIcon as BookmarkIconSolid,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useEngagementAccess } from "@/features/engagement/hooks/use-engagement-access";
import { useEntryBookmark, useEntryLike } from "@/features/engagement/hooks/use-entry-interactions";
import { useEntryReviews } from "@/features/engagement/hooks/use-entry-reviews";
import type { PublicReview } from "@/features/entries/types/public-entry";
import { cn } from "@/lib/utils";
import { formatPersianNumber } from "@/lib/utils/formatters";

type EntryActionRailProps = {
  entryId: string;
  title: string;
  initialReviews: PublicReview[];
  likeCount: number;
  bookmarkCount: number;
};

function EntryActionRail({
  entryId,
  title,
  initialReviews,
  likeCount,
  bookmarkCount,
}: EntryActionRailProps) {
  const [progress, setProgress] = useState(0);
  const { isAuthenticated, status, ensureVerifiedAccess } = useEngagementAccess();
  const like = useEntryLike({ entryId, initialCount: likeCount, isAuthenticated });
  const bookmark = useEntryBookmark({ entryId, initialCount: bookmarkCount, isAuthenticated });
  const reviews = useEntryReviews(entryId, initialReviews);

  useEffect(() => {
    let animationFrameId = 0;

    const updateProgress = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(() => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const nextProgress =
          scrollableHeight > 0 ? Math.min(window.scrollY / scrollableHeight, 1) : 0;

        setProgress(nextProgress);
      });
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  async function shareEntry() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("پیوند مطلب کپی شد.");
    } catch {
      toast.error("پیوند کپی نشد. دوباره تلاش کنید.");
    }
  }

  function toggleLike() {
    if (ensureVerifiedAccess("like")) {
      like.toggle();
    }
  }

  function toggleBookmark() {
    if (ensureVerifiedAccess("bookmark")) {
      bookmark.toggle();
    }
  }

  return (
    <aside className="sticky top-20 z-20 self-start lg:top-32 lg:h-fit">
      <div className="flex items-center justify-around gap-2 rounded-xl border border-border bg-card/95 px-2 py-1 shadow-[0_2px_10px_rgba(0,0,0,.05)] backdrop-blur-sm lg:flex-col lg:gap-4 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
        <ActionButton
          label="دیدگاه‌ها"
          count={reviews.data?.length ?? initialReviews.length}
          onClick={() => scrollToSection("entry-comments")}
          icon={<ChatBubbleOvalLeftEllipsisIcon className="size-6" aria-hidden="true" />}
        />
        <ActionButton
          label={like.isLikedByCurrentUser ? "برداشتن پسند" : "پسندیدن مطلب"}
          count={like.likeCount}
          active={like.isLikedByCurrentUser}
          pending={like.isPending}
          disabled={status === "initializing" || like.isLoading}
          onClick={toggleLike}
          icon={
            like.isLikedByCurrentUser ? (
              <HeartIconSolid className="size-6" aria-hidden="true" />
            ) : (
              <HeartIcon className="size-6" aria-hidden="true" />
            )
          }
        />
        <ActionButton
          label={bookmark.bookmarked ? "برداشتن از ذخیره‌ها" : "ذخیره مطلب"}
          count={bookmark.bookmarkCount}
          active={bookmark.bookmarked}
          pending={bookmark.isPending}
          disabled={status === "initializing" || bookmark.isLoading}
          onClick={toggleBookmark}
          icon={
            bookmark.bookmarked ? (
              <BookmarkIconSolid className="size-6" aria-hidden="true" />
            ) : (
              <BookmarkIcon className="size-6" aria-hidden="true" />
            )
          }
        />
        <ActionButton
          label="اشتراک‌گذاری"
          onClick={shareEntry}
          icon={<ShareIcon className="size-6" aria-hidden="true" />}
        />

        <div
          className="hidden h-36 w-2 justify-center py-1 lg:flex"
          role="progressbar"
          aria-label="پیشرفت مطالعه"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <div className="relative h-full w-px rounded-full bg-border">
            <div
              className="absolute top-0 right-1/2 w-1.5 translate-x-1/2 rounded-full bg-primary transition-[height] duration-150"
              style={{ height: `${Math.max(progress * 100, 4)}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

function ActionButton({
  label,
  count,
  active,
  pending = false,
  disabled = false,
  icon,
  onClick,
}: {
  label: string;
  count?: number;
  active?: boolean;
  pending?: boolean;
  disabled?: boolean;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || pending}
      className={cn(
        "group flex min-h-12 min-w-12 flex-col items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-card hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-60",
        active === true && "text-primary",
      )}
      aria-label={label}
      aria-pressed={active}
      aria-busy={pending}
    >
      {icon}
      {typeof count === "number" ? (
        <span className="mt-1 text-[12px] font-bold leading-none">
          {formatPersianNumber(count)}
        </span>
      ) : null}
    </button>
  );
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export { EntryActionRail };
