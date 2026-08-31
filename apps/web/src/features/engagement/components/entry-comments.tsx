"use client";

import { ChatBubbleLeftRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CommentComposer } from "@/features/engagement/components/comment-composer";
import { CommentListSkeleton } from "@/features/engagement/components/comment-skeletons";
import { CommentThread } from "@/features/engagement/components/comment-thread";
import { useEngagementAccess } from "@/features/engagement/hooks/use-engagement-access";
import { useCreateComment, useEntryComments } from "@/features/engagement/hooks/use-entry-comments";
import type {
  EntryCommentListResponse,
  EntryCommentSort,
} from "@/features/engagement/types/entry-engagement";
import { formatPersianNumber } from "@/lib/utils/formatters";

const sortOptions: Array<{ value: EntryCommentSort; label: string }> = [
  { value: "newest", label: "جدیدترین" },
  { value: "oldest", label: "قدیمی‌ترین" },
  { value: "mostLiked", label: "بیشترین پسند" },
];

type EntryCommentsProps = {
  entryId: string;
  initialComments: EntryCommentListResponse;
  renderedAt?: string;
};

function EntryComments({ entryId, initialComments, renderedAt }: EntryCommentsProps) {
  const reducedMotion = useReducedMotion();
  const {
    status,
    user,
    canContribute,
    ensureVerifiedAccess,
    getPendingComment,
    clearPendingComment,
  } = useEngagementAccess();
  const [sort, setSort] = useState<EntryCommentSort>("newest");
  const [now, setNow] = useState(() => new Date(renderedAt ?? Date.now()).getTime());
  const commentsQuery = useEntryComments(entryId, sort, initialComments);
  const createComment = useCreateComment(entryId);
  const comments = commentsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const commentCount = commentsQuery.data?.pages[0]?.commentCount ?? initialComments.commentCount;
  const pendingRootComment = getPendingComment();

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  async function submitComment(body: string) {
    if (!ensureVerifiedAccess("comment", { kind: "comment", body })) {
      throw new Error("Comment access is unavailable.");
    }
    await createComment.mutateAsync({ body });
    clearPendingComment();
  }

  return (
    <section
      id="entry-comments"
      className="scroll-mt-32 space-y-5"
      aria-labelledby="entry-comments-title"
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary-light text-primary">
            <ChatBubbleLeftRightIcon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="entry-comments-title"
              className="text-[25px] font-bold text-foreground sm:text-[28px]"
            >
              دیدگاه‌ها
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground" aria-live="polite">
              {formatPersianNumber(commentCount)} دیدگاه
            </p>
          </div>
        </div>

        <Select
          items={sortOptions}
          value={sort}
          onValueChange={(value) => value && setSort(value as EntryCommentSort)}
        >
          <SelectTrigger size="sm" className="w-auto min-w-44 rounded-full bg-card px-3">
            <span className="text-muted-foreground">مرتب‌سازی:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectGroup>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </header>

      {status === "initializing" ? (
        <Skeleton className="h-48 rounded-xl" aria-label="در حال آماده‌سازی فرم دیدگاه" />
      ) : (
        <CommentComposer
          authorName={user?.displayName ?? "مهمان"}
          authorSeed={user?.id ?? "guest"}
          initialBody={pendingRootComment?.body ?? ""}
          isPending={createComment.isPending}
          autoFocus={canContribute && Boolean(pendingRootComment)}
          helperText={
            status === "unauthenticated"
              ? "متن شما حفظ می‌شود؛ برای ثبت دیدگاه وارد حساب خود شوید."
              : user?.status === "SUSPENDED"
                ? "امکان ثبت دیدگاه با این حساب وجود ندارد."
                : !canContribute
                  ? "متن شما حفظ می‌شود؛ برای ثبت دیدگاه ایمیل خود را تأیید کنید."
                  : undefined
          }
          onSubmit={submitComment}
        />
      )}

      {commentsQuery.isLoading ? <CommentListSkeleton /> : null}
      {commentsQuery.isError ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-[14px]"
        >
          <span>دیدگاه‌ها بارگذاری نشد. دوباره تلاش کنید.</span>
          <Button type="button" variant="outline" size="sm" onClick={() => commentsQuery.refetch()}>
            تلاش دوباره
          </Button>
        </div>
      ) : null}

      {!commentsQuery.isLoading && !commentsQuery.isError && comments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-5 py-8 text-center text-[14px] leading-7 text-muted-foreground">
          هنوز دیدگاهی نوشته نشده است. شما می‌توانید نخستین دیدگاه را بنویسید.
        </div>
      ) : null}

      {comments.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card ">
          <AnimatePresence initial={false} mode="popLayout">
            {comments.map((comment) => (
              <motion.div
                layout={reducedMotion ? false : "position"}
                key={comment.id}
                className="border-b border-border last:border-0 px-4 py-3"
              >
                <CommentThread entryId={entryId} comment={comment} now={now} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : null}

      {commentsQuery.hasNextPage ? (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="min-w-64 rounded-full bg-card"
            disabled={commentsQuery.isFetchingNextPage}
            onClick={() => commentsQuery.fetchNextPage()}
          >
            {commentsQuery.isFetchingNextPage ? "در حال بارگذاری..." : "مشاهده دیدگاه‌های بیشتر"}
            <ChevronDownIcon className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ) : null}
    </section>
  );
}

export { EntryComments };
