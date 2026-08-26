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
import { createPortal } from "react-dom";
import { toast } from "sonner";

import { useEngagementAccess } from "@/features/engagement/hooks/use-engagement-access";
import { useEntryComments } from "@/features/engagement/hooks/use-entry-comments";
import { useEntryBookmark, useEntryLike } from "@/features/engagement/hooks/use-entry-interactions";
import type { EntryCommentListResponse } from "@/features/engagement/types/entry-engagement";
import { cn } from "@/lib/utils";
import { formatPersianNumber } from "@/lib/utils/formatters";

type EntryActionRailProps = {
  entryId: string;
  title: string;
  initialComments: EntryCommentListResponse;
  likeCount: number;
  bookmarkCount: number;
};

function EntryActionRail({
  entryId,
  title,
  initialComments,
  likeCount,
  bookmarkCount,
}: EntryActionRailProps) {
  const [progress, setProgress] = useState(0);
  const [showMobileDock, setShowMobileDock] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const {
    isAuthenticated,
    status,
    canContribute,
    pendingIntent,
    ensureVerifiedAccess,
    takePendingToggleIntent,
  } = useEngagementAccess();
  const like = useEntryLike({ entryId, initialCount: likeCount, isAuthenticated });
  const bookmark = useEntryBookmark({ entryId, initialCount: bookmarkCount, isAuthenticated });
  const comments = useEntryComments(entryId, "newest", initialComments);
  const commentCount = comments.data?.pages[0]?.commentCount ?? initialComments.commentCount;

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  useEffect(() => {
    let animationFrameId = 0;

    const updateProgress = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(() => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const nextProgress =
          scrollableHeight > 0 ? Math.min(window.scrollY / scrollableHeight, 1) : 0;
        const entryIntro = document.querySelector<HTMLElement>("[data-entry-intro]");
        const commentsSection = document.getElementById("entry-comments");
        const hasReachedComments = commentsSection
          ? commentsSection.getBoundingClientRect().top <= window.innerHeight * 0.82
          : false;

        setProgress(nextProgress);
        setShowMobileDock(
          (entryIntro ? entryIntro.getBoundingClientRect().bottom <= 72 : window.scrollY > 420) &&
          !hasReachedComments,
        );
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

  useEffect(() => {
    if (!canContribute || like.isLoading || pendingIntent?.kind !== "like") return;

    const intent = takePendingToggleIntent("like");
    if (!intent || intent.desiredState === like.isLikedByCurrentUser) return;

    void like
      .setLiked(intent.desiredState)
      .then((result) => {
        if (result) {
          toast.success(intent.desiredState ? "پسند شما ثبت شد." : "پسند شما برداشته شد.");
        }
      })
      .catch(() => undefined);
  }, [canContribute, like, pendingIntent, takePendingToggleIntent]);

  useEffect(() => {
    if (!canContribute || bookmark.isLoading || pendingIntent?.kind !== "bookmark") return;

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
  }, [bookmark, canContribute, pendingIntent, takePendingToggleIntent]);

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
    if (
      ensureVerifiedAccess("like", {
        kind: "like",
        desiredState: !like.isLikedByCurrentUser,
      })
    ) {
      like.toggle();
    }
  }

  function toggleBookmark() {
    if (
      ensureVerifiedAccess("bookmark", {
        kind: "bookmark",
        desiredState: !bookmark.bookmarked,
      })
    ) {
      bookmark.toggle();
    }
  }

  function renderActions(orientation: "mobile" | "desktop") {
    return (
      <>

        <ActionButton
          label={like.isLikedByCurrentUser ? "برداشتن پسند" : "پسندیدن مطلب"}
          count={like.likeCount}
          orientation={orientation}
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
          label="دیدگاه‌ها"
          count={commentCount}
          orientation={orientation}
          onClick={() => scrollToSection("entry-comments")}
          icon={<ChatBubbleOvalLeftEllipsisIcon className="size-6" aria-hidden="true" />}
        />
        <ActionButton
          label={bookmark.bookmarked ? "برداشتن از ذخیره‌ها" : "ذخیره مطلب"}
          count={bookmark.bookmarkCount}
          orientation={orientation}
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
          orientation={orientation}
          onClick={shareEntry}
          icon={<ShareIcon className="size-6" aria-hidden="true" />}
        />
      </>
    );
  }

  return (
    <>
      <aside className="sticky top-32 z-20 hidden h-fit self-start lg:block">
        <div className="flex flex-col items-center gap-4">
          {renderActions("desktop")}
          <div
            className="flex h-36 w-2 justify-center py-1"
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

      {portalRoot
        ? createPortal(
          <>
            <div
              className="pointer-events-none fixed inset-x-0 top-[calc(3.5rem+env(safe-area-inset-top))] z-41 h-0.5 bg-border/60 lg:hidden"
              role="progressbar"
              aria-label="پیشرفت مطالعه"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
            >
              <div
                className="h-full bg-primary transition-[width] duration-150 motion-reduce:transition-none"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            <nav
              aria-label="تعامل با مطلب"
              aria-hidden={!showMobileDock}
              inert={!showMobileDock}
              className={cn(
                "fixed right-4  z-30 flex flex-col rounded-2xl px-1 py-1   duration-300 motion-reduce:transition-none lg:hidden",
                "inset-x-auto bottom-[calc(5rem+env(safe-area-inset-bottom))]  flex flex-col grid-cols-none items-center gap-1.5",
              )}
            >
              {renderActions("mobile")}
            </nav>
          </>,
          portalRoot,
        )
        : null}
    </>
  );
}

function ActionButton({
  label,
  count,
  active,
  pending = false,
  disabled = false,
  orientation = "desktop",
  icon,
  onClick,
}: {
  label: string;
  count?: number;
  active?: boolean;
  pending?: boolean;
  disabled?: boolean;
  orientation?: "mobile" | "desktop";
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || pending}
      className={cn(
        "group flex min-h-12 min-w-12 flex-col items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-60",
        orientation === "mobile" &&
        "min-h-13  rounded-full text-primary  ",
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
