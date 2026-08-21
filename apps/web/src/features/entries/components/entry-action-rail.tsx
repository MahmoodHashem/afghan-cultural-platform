"use client";

import {
  BookmarkIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  HeartIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { formatPersianNumber } from "@/lib/utils/formatters";

type EntryActionRailProps = {
  title: string;
  commentCount: number;
  ratingCount: number;
};

function EntryActionRail({ title, commentCount, ratingCount }: EntryActionRailProps) {
  const [progress, setProgress] = useState(0);

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

  return (
    <aside className="hidden self-start lg:sticky lg:top-32 lg:block lg:h-fit">
      <div className="flex flex-col items-center gap-4">
        <ActionButton
          label="دیدگاه‌ها"
          count={commentCount}
          onClick={() => scrollToSection("entry-comments")}
          icon={<ChatBubbleOvalLeftEllipsisIcon className="size-6" aria-hidden="true" />}
        />
        <ActionButton
          label="امتیازدهی"
          count={ratingCount}
          onClick={() => scrollToSection("entry-feedback")}
          icon={<HeartIcon className="size-6" aria-hidden="true" />}
        />
        <ActionButton
          label="ذخیره مطلب"
          onClick={() => toast.message("این امکان هنوز فعال نشده است.")}
          icon={<BookmarkIcon className="size-6" aria-hidden="true" />}
        />
        <ActionButton
          label="اشتراک‌گذاری"
          onClick={shareEntry}
          icon={<ShareIcon className="size-6" aria-hidden="true" />}
        />

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
  );
}

function ActionButton({
  label,
  count,
  icon,
  onClick,
}: {
  label: string;
  count?: number;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex min-h-12 min-w-12 flex-col items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-card hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
      )}
      aria-label={label}
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
