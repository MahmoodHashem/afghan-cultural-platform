"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { ArrowUturnLeftIcon } from "@/components/icons/animated/arrow-uturn-left";
import { ChevronDownIcon } from "@/components/icons/animated/chevron-down";
import { HeartIcon } from "@/components/icons/animated/heart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommentComposer } from "@/features/engagement/components/comment-composer";
import { CommentMenu } from "@/features/engagement/components/comment-menu";
import { CommentListSkeleton } from "@/features/engagement/components/comment-skeletons";
import { useEngagementAccess } from "@/features/engagement/hooks/use-engagement-access";
import {
  useCommentLike,
  useCommentReplies,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from "@/features/engagement/hooks/use-entry-comments";
import type { EntryComment } from "@/features/engagement/types/entry-engagement";
import { formatCommentRelativeTime } from "@/features/engagement/utils/comment-time";
import { useAnimatedIcon } from "@/hooks/use-animated-icon";
import { cn } from "@/lib/utils";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";
import { createUserInitials, getUserAvatarColorClass } from "@/lib/utils/user";

type CommentThreadProps = {
  entryId: string;
  comment: EntryComment;
  depth?: number;
  now: number;
};

function CommentThread({ entryId, comment, depth = 0, now }: CommentThreadProps) {
  const reducedMotion = useReducedMotion();
  const { user, canContribute, ensureVerifiedAccess, getPendingComment, clearPendingComment } =
    useEngagementAccess();
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const repliesQuery = useCommentReplies(
    entryId,
    comment.id,
    repliesOpen && comment.directReplyCount > 0,
  );
  const createComment = useCreateComment(entryId);
  const updateComment = useUpdateComment(entryId);
  const deleteComment = useDeleteComment(entryId);
  const commentLike = useCommentLike(entryId, comment, canContribute);
  const replies = repliesQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const activeAuthor = comment.status === "ACTIVE" ? comment.author : null;
  const activeBody = comment.status === "ACTIVE" ? comment.body : null;
  const isOwner = Boolean(activeAuthor?.id === user?.id);
  const isSelfLike = Boolean(activeAuthor?.id === user?.id);
  const pendingReply = getPendingComment(comment.id);
  const likeAnimation = useAnimatedIcon();
  const replyAnimation = useAnimatedIcon();
  const revealRepliesAnimation = useAnimatedIcon();
  const previousLikedRef = useRef(commentLike.isLiked);

  useEffect(() => {
    if (previousLikedRef.current !== commentLike.isLiked) likeAnimation.playStateChange();
    previousLikedRef.current = commentLike.isLiked;
  }, [commentLike.isLiked, likeAnimation.playStateChange]);

  useEffect(() => {
    if (canContribute && pendingReply) {
      setRepliesOpen(true);
      setReplying(true);
      setEditing(false);
    }
  }, [canContribute, pendingReply]);

  function beginReply() {
    setRepliesOpen(true);
    setReplying(true);
    setEditing(false);
  }

  function toggleLike() {
    if (isSelfLike) return;
    if (ensureVerifiedAccess("commentLike")) commentLike.toggle();
  }

  async function submitReply(body: string) {
    if (
      !ensureVerifiedAccess("comment", {
        kind: "comment",
        body,
        parentId: comment.id,
      })
    ) {
      throw new Error("Comment access is unavailable.");
    }
    await createComment.mutateAsync({ body, parentId: comment.id });
    clearPendingComment(comment.id);
    setReplying(false);
    setRepliesOpen(true);
  }

  async function submitEdit(body: string) {
    await updateComment.mutateAsync({ commentId: comment.id, body });
    setEditing(false);
  }

  const remainingReplies = Math.max(
    0,
    (repliesQuery.data?.pages[0]?.meta.total ?? comment.directReplyCount) - replies.length,
  );

  return (
    <motion.article
      layout={reducedMotion ? false : "position"}
      initial={reducedMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn(" ", depth === 0 && "")}
    >
      {activeAuthor && activeBody ? (
        <div className="flex items-start gap-3 sm:gap-4">
          <Avatar className={cn("bg-primary-light", depth === 0 ? "size-11" : "size-9")}>
            {activeAuthor.profileImageUrl ? (
              <AvatarImage src={activeAuthor.profileImageUrl} alt="" />
            ) : null}
            <AvatarFallback
              className={cn("font-bold", getUserAvatarColorClass(activeAuthor.id))}
            >
              {createUserInitials(activeAuthor.displayName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <header className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0  ">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-foreground">{activeAuthor.displayName}</h3>
                  {activeAuthor.isEntryAuthor ? (
                    <Badge className="rounded-full bg-primary-light px-2.5 text-[11px] text-primary shadow-none">
                      نویسنده مطلب
                    </Badge>
                  ) : null}
                </div>
                <time
                  dateTime={comment.createdAt}
                  title={formatPersianDate(comment.createdAt)}
                  className="block text-[12px] text-muted-foreground"
                >
                  {formatCommentRelativeTime(comment.createdAt, now)}
                  {comment.updatedAt !== comment.createdAt ? " · ویرایش‌شده" : null}
                </time>
              </div>
            </header>

            <AnimatePresence initial={false} mode="wait">
              {editing ? (
                <motion.div
                  key="edit"
                  initial={reducedMotion ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <CommentComposer
                    mode="edit"
                    authorName={activeAuthor.displayName}
                    authorSeed={activeAuthor.id}
                    initialBody={activeBody}
                    isPending={updateComment.isPending}
                    autoFocus
                    onSubmit={submitEdit}
                    onCancel={() => setEditing(false)}
                  />
                </motion.div>
              ) : (
                <motion.p
                  key="body"
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 whitespace-pre-wrap text-[15px] leading-8 text-foreground sm:text-[16px]"
                >
                  {activeBody}
                </motion.p>
              )}
            </AnimatePresence>

            {!editing ? (
              <div className="mt-3 flex flex-wrap items-center gap-1 text-muted-foreground">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={beginReply}
                  {...replyAnimation.triggerProps}
                >
                  <ArrowUturnLeftIcon
                    ref={replyAnimation.iconRef}
                    size={16}
                    className="rtl:-scale-x-100"
                    aria-hidden="true"
                  />
                  پاسخ
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-pressed={commentLike.isLiked}
                  aria-label={
                    isSelfLike
                      ? "نمی‌توانید دیدگاه خود را بپسندید"
                      : commentLike.isLiked
                        ? "برداشتن پسند دیدگاه"
                        : "پسندیدن دیدگاه"
                  }
                  disabled={isSelfLike || commentLike.isPending || commentLike.isLoading}
                  className={cn(commentLike.isLiked && "text-primary hover:text-primary")}
                  onClick={toggleLike}
                  {...likeAnimation.triggerProps}
                >
                  <HeartIcon
                    ref={likeAnimation.iconRef}
                    size={16}
                    className={cn(commentLike.isLiked && "[&>svg]:fill-current")}
                    aria-hidden="true"
                  />
                  {formatPersianNumber(comment.likeCount)}
                </Button>
                <CommentMenu
                  entryId={entryId}
                  commentId={comment.id}
                  isOwner={isOwner}
                  isDeleting={deleteComment.isPending}
                  onEdit={() => {
                    setEditing(true);
                    setReplying(false);
                  }}
                  onDelete={() => deleteComment.mutateAsync(comment.id)}
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-[13px] text-muted-foreground">
          {comment.status === "DELETED"
            ? "این دیدگاه به‌دست نویسنده حذف شده است."
            : "این دیدگاه پس از بررسی نمایش داده نمی‌شود."}
        </div>
      )}

      {comment.directReplyCount > 0 && !repliesOpen ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="my-3 ms-12 text-primary hover:text-primary sm:ms-14"
          onClick={() => setRepliesOpen(true)}
          {...revealRepliesAnimation.triggerProps}
        >
          مشاهده {formatPersianNumber(comment.directReplyCount)} پاسخ
          <ChevronDownIcon ref={revealRepliesAnimation.iconRef} size={16} aria-hidden="true" />
        </Button>
      ) : null}

      <AnimatePresence initial={false}>
        {replying ? (
          <motion.div
            key="reply-composer"
            initial={reducedMotion ? false : { opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
            className="mt-4 ms-2 overflow-hidden sm:ms-14"
          >
            <CommentComposer
              mode="reply"
              authorName={user?.displayName ?? "کاربر"}
              authorSeed={user?.id ?? "guest"}
              initialBody={pendingReply?.body ?? ""}
              isPending={createComment.isPending}
              autoFocus
              onSubmit={submitReply}
              onCancel={() => setReplying(false)}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {repliesOpen && comment.directReplyCount > 0 ? (
          <motion.div
            key="replies"
            initial={reducedMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
            className={cn(
              "relative my-5 overflow-hidden border-s border-border",
              depth === 0
                ? "ms-4 ps-3 sm:ms-12"
                : "ms-0 border-s-0 ps-0 sm:ms-4 sm:border-s sm:ps-3",
              depth >= 2 && "sm:ms-1",
            )}
          >
            {repliesQuery.isLoading ? <CommentListSkeleton compact /> : null}
            {repliesQuery.isError ? (
              <div
                role="alert"
                className="flex flex-wrap items-center gap-2 py-3 text-[13px] text-muted-foreground"
              >
                پاسخ‌ها بارگذاری نشد.
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => repliesQuery.refetch()}
                >
                  تلاش دوباره
                </Button>
              </div>
            ) : null}
            {replies.map((reply) => (
              <CommentThread
                key={reply.id}
                entryId={entryId}
                comment={reply}
                depth={depth + 1}
                now={now}
              />
            ))}
            {repliesQuery.hasNextPage ? (
              <Button
                type="button"
                variant="ghost"
                className="my-2 w-full bg-primary-light/45 text-primary hover:bg-primary-light hover:text-primary"
                disabled={repliesQuery.isFetchingNextPage}
                onClick={() => repliesQuery.fetchNextPage()}
                {...revealRepliesAnimation.triggerProps}
              >
                {repliesQuery.isFetchingNextPage
                  ? "در حال بارگذاری..."
                  : `مشاهده ${formatPersianNumber(remainingReplies)} پاسخ دیگر`}
                <ChevronDownIcon
                  ref={revealRepliesAnimation.iconRef}
                  size={16}
                  aria-hidden="true"
                />
              </Button>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}

export { CommentThread };
