"use client";

import {
  ArrowPathIcon,
  BookmarkIcon,
  CameraIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { EyeIcon } from "@/components/icons/animated/eye";
import { TrashIcon } from "@/components/icons/animated/trash";
import { useMobileChromeHidden } from "@/components/layout/mobile/use-mobile-chrome-hidden";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { EmailVerificationButton } from "@/features/auth/components/email-verification-button";
import { VerifiedEmailBanner } from "@/features/auth/components/verified-email-banner";
import type { OwnEntry } from "@/features/entries/api/entry-drafts-api";
import type {
  ProfileBookmark,
  ProfileComment,
  ProfileOwner,
} from "@/features/profile/api/profile-api";
import {
  canDeleteOwnEntry,
  ENTRY_STATUS_FILTERS,
  ENTRY_STATUS_META,
  getEntryStatusBadgeClassName,
  isOwnerEditableStatus,
} from "@/features/profile/constants/entry-status";
import {
  useDeleteOwnDraftMutation,
  useOwnerBookmarks,
  useOwnerComments,
  useOwnerEntries,
  useOwnerEntryStats,
  useOwnerProfile,
} from "@/features/profile/hooks/use-owner-entries";
import {
  createProfileHref,
  type ProfileQuery,
  type ProfileTab,
  parseProfileQuery,
} from "@/features/profile/utils/profile-query";
import { useAnimatedIcon } from "@/hooks/use-animated-icon";
import { isApiError } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";
import { createUserInitials } from "@/lib/utils/user";
import { type SafeUser, useAuthStore } from "@/stores/auth-store";
import { ProfileLogoutButton } from "./profile-logout-button";
import { ProfilePageSkeleton } from "./profile-page-skeleton";

const profileTabs: Array<{
  value: ProfileTab;
  label: string;
  icon: typeof DocumentTextIcon;
}> = [
  { value: "entries", label: "مطالب من", icon: DocumentTextIcon },
  { value: "comments", label: "دیدگاه‌ها", icon: ChatBubbleLeftRightIcon },
  { value: "bookmarks", label: "ذخیره‌ها", icon: BookmarkIcon },
];

const ownerEntrySkeletonKeys = ["first", "second", "third", "fourth"] as const;
const ownerFeedbackSkeletonKeys = ["first", "second", "third"] as const;

const ENTRY_COMMENT_STATUS_META = {
  ACTIVE: {
    label: "منتشرشده",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  HIDDEN: {
    label: "پنهان‌شده",
    className: "border-muted bg-muted text-muted-foreground",
  },
  DELETED: {
    label: "حذف‌شده",
    className: "border-destructive/25 bg-destructive/10 text-destructive",
  },
} satisfies Record<ProfileComment["status"], { label: string; className: string }>;

function OwnerProfilePage() {
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const profileQuery = useMemo(() => parseProfileQuery(searchParams), [searchParams]);
  const ownerProfile = useOwnerProfile();

  if (!user) {
    return <ProfilePageSkeleton />;
  }

  const profileUser = ownerProfile.data ?? createProfileFallback(user);

  return (
    <section className="content-container mb-0 max-w-none space-y-4 rounded-none bg-background px-0 pb-8 lg:mb-10 lg:max-w-(--container-content) lg:space-y-7 lg:rounded-xl lg:bg-card lg:p-6">
      <OwnerProfileHeader user={profileUser} isProfileLoading={ownerProfile.isLoading} />
      <div className="flex flex-col items-center gap-3 lg:gap-6">
        <ProfileNavigationTabs activeTab={profileQuery.tab} query={profileQuery} />
        <div className="w-full outline-none">
          {profileQuery.tab === "entries" ? <OwnerEntriesPanel query={profileQuery} /> : null}
          {profileQuery.tab === "comments" ? <OwnerCommentsPanel query={profileQuery} /> : null}
          {profileQuery.tab === "bookmarks" ? <OwnerBookmarksPanel query={profileQuery} /> : null}
        </div>
      </div>
    </section>
  );
}

function OwnerProfileHeader({
  user,
  isProfileLoading,
}: {
  user: ProfileOwner;
  isProfileLoading: boolean;
}) {
  const stats = useOwnerEntryStats();

  return (
    <div className="overflow-hidden bg-card lg:bg-transparent">
      <div className="relative px-4 py-4 lg:min-h-36 lg:px-8 lg:py-6">
        <div className="flex flex-col items-center justify-center gap-3 lg:gap-4">
          <div className="relative shrink-0">
            <Avatar className="size-20 border-3 border-card bg-primary-light lg:size-28 lg:border-4">
              {user.profileImageUrl ? (
                <AvatarImage src={user.profileImageUrl} alt={user.displayName} />
              ) : null}
              <AvatarFallback className="bg-primary-light text-[20px] font-bold text-primary lg:text-[24px]">
                {createUserInitials(user.displayName)}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                buttonVariants({ variant: "outline" }),
                "absolute bottom-0 right-1 hidden size-9 cursor-not-allowed rounded-full bg-card p-0 lg:inline-flex",
              )}
              aria-disabled="true"
              title="ویرایش تصویر پروفایل در مرحله بعدی رابط کاربری فعال می‌شود."
            >
              <CameraIcon className="size-4" aria-hidden="true" />
            </span>
          </div>
          <div className="flex min-w-0 flex-col items-center space-y-1.5 lg:space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[22px] font-bold leading-9 text-foreground lg:text-[34px] lg:leading-10">
                {user.displayName}
              </h1>
              {/* {user.emailVerified ? <CheckIcon className="size-5 border rounded-full"  /> : "ایمیل تأیید نشده"} */}
            </div>
            <p className="text-[13px] font-medium text-muted-foreground" dir="ltr">
              {user.email}
            </p>
            {!user.emailVerified ? <EmailVerificationButton email={user.email} compact /> : null}
            <ProfileLogoutButton />
            {isProfileLoading ? <Skeleton className="h-4 w-36" /> : null}
            {user.biography ? (
              <p className="max-w-xl px-4 text-center text-[13px] leading-6 text-muted-foreground lg:px-0 lg:text-[14px] lg:leading-7">
                {user.biography}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <ProfileStats stats={stats} />
    </div>
  );
}

function ProfileStats({ stats }: { stats: ReturnType<typeof useOwnerEntryStats> }) {
  const items = [
    { label: "مطلب", value: stats.entries },
    { label: "دیدگاه", value: stats.comments },
    { label: "ذخیره", value: stats.bookmarks },
  ];

  return (
    <dl className="flex w-full justify-center border-y border-border/70 py-2 lg:gap-6 lg:border-0 lg:py-0">
      {items.map((item, index) => (
        <div
          className="flex flex-1 items-center justify-center gap-0 lg:flex-none lg:gap-6"
          key={item.label}
        >
          <div key={item.label} className="flex min-w-20 flex-col items-center px-2 lg:px-3">
            <dd className="text-[22px] font-semibold text-foreground lg:mt-2 lg:text-[29px] lg:font-normal">
              {stats.isLoading ? (
                <Skeleton className="h-8 w-14" />
              ) : stats.isError ? (
                <>
                  <span aria-hidden="true">—</span>
                  <span className="sr-only">آمار در دسترس نیست</span>
                </>
              ) : (
                <span>{formatPersianNumber(item.value)}</span>
              )}
            </dd>

            <dt className="text-[12px] text-muted-foreground lg:text-sm">{item.label}</dt>
          </div>
          {index < items.length - 1 ? <div className="h-7 w-px bg-border lg:bg-slate-300" /> : null}
        </div>
      ))}
    </dl>
  );
}

function ProfileNavigationTabs({
  activeTab,
  query,
}: {
  activeTab: ProfileTab;
  query: ProfileQuery;
}) {
  const chromeHidden = useMobileChromeHidden();
  const reducedMotion = Boolean(useReducedMotion());

  return (
    <motion.div
      initial={false}
      animate={{
        top: chromeHidden
          ? "calc(0.5rem + env(safe-area-inset-top))"
          : "calc(4.25rem + env(safe-area-inset-top))",
      }}
      transition={
        reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 42, mass: 0.8 }
      }
      className="sticky z-30 w-full  py-2 lg:static lg:bg-transparent lg:py-0 lg:backdrop-blur-none"
    >
      <Tabs value={activeTab} className="overflow-hidden px-4 lg:px-0">
        <TabsList
          variant="default"
          className="relative mx-auto h-auto min-h-11 w-max justify-start gap-1 rounded-full border border-border bg-card p-1 shadow-[0_2px_10px_rgba(0,0,0,.04)]"
          aria-label="بخش‌های پروفایل"
        >
          {profileTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.value === activeTab;

            return (
              <Link
                key={tab.value}
                href={createProfileHref(query, { tab: tab.value, page: 1 })}
                scroll={false}
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-[13px] font-semibold outline-none transition-all focus-visible:ring-3 focus-visible:ring-ring/40",
                  isActive
                    ? " text-primary-foreground shadow-[0_6px_16px_rgba(15,118,110,0.12)]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {isActive ? (
                  <motion.span
                    layoutId="profile-active-tab"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    aria-hidden="true"
                  />
                ) : null}
                <span className="relative z-10 inline-flex items-center gap-2">
                  <Icon className="size-4" aria-hidden="true" />
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </TabsList>
      </Tabs>
    </motion.div>
  );
}

function OwnerEntriesPanel({ query }: { query: ProfileQuery }) {
  const ownerEntries = useOwnerEntries(query);

  return (
    <div className="space-y-4 px-3 pb-4 lg:p-4">
      <OwnerEntryToolbar query={query} total={ownerEntries.data?.meta.total ?? 0} />
      {ownerEntries.isLoading ? <OwnerEntryListSkeleton /> : null}
      {isVerifiedEmailError(ownerEntries.error) ? <OwnerEntriesVerificationState /> : null}
      {ownerEntries.isError && !isVerifiedEmailError(ownerEntries.error) ? (
        <ProfileErrorState onRetry={() => void ownerEntries.refetch()} />
      ) : null}
      {ownerEntries.data && ownerEntries.data.data.length === 0 ? (
        <OwnerEntriesEmptyState query={query} />
      ) : null}
      {ownerEntries.data && ownerEntries.data.data.length > 0 ? (
        <>
          <OwnerEntryList entries={ownerEntries.data.data} />
          <ProfilePagination meta={ownerEntries.data.meta} query={query} />
        </>
      ) : null}
    </div>
  );
}

function OwnerEntriesVerificationState() {
  return (
    <div className="rounded-[24px] border border-border bg-card p-5 shadow-[0_2px_10px_rgba(0,0,0,.035)]">
      <VerifiedEmailBanner />
    </div>
  );
}

function OwnerCommentsPanel({ query }: { query: ProfileQuery }) {
  const ownerComments = useOwnerComments(query);

  return (
    <div className="space-y-4 px-3 pb-4 lg:p-4">
      <SimpleProfileToolbar total={ownerComments.data?.meta.total ?? 0} label="دیدگاه" />
      {ownerComments.isLoading ? <OwnerFeedbackListSkeleton /> : null}
      {ownerComments.isError ? (
        <ProfileErrorState
          title="دیدگاه‌ها بارگذاری نشد"
          onRetry={() => void ownerComments.refetch()}
        />
      ) : null}
      {ownerComments.data && ownerComments.data.data.length === 0 ? (
        <ProfileEmptyState
          icon={ChatBubbleLeftRightIcon}
          title="هنوز دیدگاهی ننوشته‌اید"
          description="دیدگاه‌هایی که زیر مطالب منتشرشده می‌نویسید، اینجا دیده می‌شوند."
        />
      ) : null}
      {ownerComments.data && ownerComments.data.data.length > 0 ? (
        <>
          <OwnerCommentList comments={ownerComments.data.data} />
          <ProfilePagination meta={ownerComments.data.meta} query={query} />
        </>
      ) : null}
    </div>
  );
}

function OwnerBookmarksPanel({ query }: { query: ProfileQuery }) {
  const ownerBookmarks = useOwnerBookmarks(query);

  return (
    <div className="space-y-4 px-3 pb-4 lg:p-4">
      <SimpleProfileToolbar total={ownerBookmarks.data?.meta.total ?? 0} label="ذخیره" />
      {ownerBookmarks.isLoading ? <OwnerFeedbackListSkeleton /> : null}
      {ownerBookmarks.isError ? (
        <ProfileErrorState
          title="ذخیره‌ها بارگذاری نشد"
          onRetry={() => void ownerBookmarks.refetch()}
        />
      ) : null}
      {ownerBookmarks.data && ownerBookmarks.data.data.length === 0 ? (
        <ProfileEmptyState
          icon={BookmarkIcon}
          title="هنوز مطلبی ذخیره نکرده‌اید"
          description="مطالبی که برای خواندن دوباره ذخیره می‌کنید، اینجا قرار می‌گیرند."
        />
      ) : null}
      {ownerBookmarks.data && ownerBookmarks.data.data.length > 0 ? (
        <>
          <OwnerBookmarkList bookmarks={ownerBookmarks.data.data} />
          <ProfilePagination meta={ownerBookmarks.data.meta} query={query} />
        </>
      ) : null}
    </div>
  );
}

function SimpleProfileToolbar({ total, label }: { total: number; label: string }) {
  return (
    <div className="flex min-h-10 items-center justify-between rounded-full border border-border bg-card px-4 py-1">
      <p className="text-[13px] font-semibold text-muted-foreground">{label}</p>
      {total > 0 ? (
        <p className="text-sm text-foreground">
          {formatPersianNumber(total)} {label}
        </p>
      ) : null}
    </div>
  );
}

function OwnerEntryToolbar({ query, total }: { query: ProfileQuery; total: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 rounded-full border bg-card px-2 py-1 lg:gap-5">
        <div className="flex min-w-0 gap-2 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
          {ENTRY_STATUS_FILTERS.map((filter) => {
            const isActive = filter.value === "ALL" ? !query.status : query.status === filter.value;

            return (
              <Link
                key={filter.value}
                href={createProfileHref(query, {
                  tab: "entries",
                  status: filter.value === "ALL" ? undefined : filter.value,
                  page: 1,
                })}
                scroll={false}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-7 shrink-0 items-center rounded-full px-3 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                  isActive ? "border-primary text-primary" : "",
                )}
              >
                {isActive ? (
                  <motion.span
                    layoutId="owner-entry-toolbar-active-filter"
                    className="absolute inset-0 rounded-full bg-primary/10"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    aria-hidden="true"
                  />
                ) : null}
                <span className="relative z-10">{filter.label}</span>
              </Link>
            );
          })}
        </div>
        {total > 0 && (
          <p className="shrink-0 text-center text-[12px] text-foreground lg:text-sm">
            {formatPersianNumber(total)} مطلب
          </p>
        )}
      </div>
    </div>
  );
}

function OwnerCommentList({ comments }: { comments: ProfileComment[] }) {
  return (
    <motion.ul
      layout
      className="overflow-hidden rounded-xl border border-border bg-card lg:space-y-3 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent"
    >
      {comments.map((comment) => (
        <motion.li
          key={comment.id}
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <OwnerCommentRow comment={comment} />
        </motion.li>
      ))}
    </motion.ul>
  );
}

function OwnerCommentRow({ comment }: { comment: ProfileComment }) {
  const commentStatusMeta = ENTRY_COMMENT_STATUS_META[comment.status];

  return (
    <article className="group border-b border-border bg-card px-4 py-4 transition-colors last:border-b-0 lg:rounded-xl lg:border-0 lg:p-4 lg:transition-all lg:duration-200 lg:hover:border-primary/25 lg:hover:shadow-[0_14px_34px_rgba(31,41,55,0.07)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn("rounded-full px-3 py-1", commentStatusMeta.className)}
            >
              {commentStatusMeta.label}
            </Badge>
            <span className="text-[13px] text-muted-foreground">
              {comment.parentId ? "پاسخ · " : null}
              {formatPersianDate(comment.updatedAt)}
            </span>
          </div>
          <p className="line-clamp-3 text-[14px] leading-7 text-foreground lg:text-[15px] lg:leading-8">
            {comment.body}
          </p>
          <Link
            href={`/entries/${encodeURIComponent(comment.entry.slug)}`}
            className="line-clamp-1 text-[14px] font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            {comment.entry.title}
          </Link>
        </div>
        {comment.entry.status === "PUBLISHED" ? (
          <ProfileViewLink
            href={`/entries/${encodeURIComponent(comment.entry.slug)}`}
            label="نمایش مطلب"
          />
        ) : null}
      </div>
    </article>
  );
}

function OwnerBookmarkList({ bookmarks }: { bookmarks: ProfileBookmark[] }) {
  return (
    <motion.ul
      layout
      className="overflow-hidden rounded-xl border border-border bg-card lg:space-y-3 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent"
    >
      {bookmarks.map((bookmark) => (
        <motion.li
          key={bookmark.id}
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <OwnerBookmarkRow bookmark={bookmark} />
        </motion.li>
      ))}
    </motion.ul>
  );
}

function OwnerBookmarkRow({ bookmark }: { bookmark: ProfileBookmark }) {
  return (
    <article className="group border-b border-border bg-card px-4 py-4 transition-colors last:border-b-0 lg:rounded-xl lg:border-0 lg:p-4 lg:transition-all lg:duration-200 lg:hover:border-primary/25 lg:hover:shadow-[0_14px_34px_rgba(31,41,55,0.07)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-full border-primary/25 bg-primary-light px-3 py-1 text-primary"
            >
              ذخیره‌شده
            </Badge>
            <span className="text-[13px] text-muted-foreground">
              {formatPersianDate(bookmark.createdAt)}
            </span>
          </div>
          <div>
            <h2 className="line-clamp-2 text-[17px] font-bold leading-7 text-foreground lg:text-[20px] lg:leading-8">
              {bookmark.entry.title}
            </h2>
            <p className="mt-2 line-clamp-2 text-[14px] leading-7 text-muted-foreground">
              {bookmark.entry.summary}
            </p>
          </div>
        </div>
        <ProfileViewLink
          href={`/entries/${encodeURIComponent(bookmark.entry.slug)}`}
          label="نمایش مطلب"
        />
      </div>
    </article>
  );
}

function OwnerEntryList({ entries }: { entries: OwnEntry[] }) {
  const [entryPendingDeletion, setEntryPendingDeletion] = useState<OwnEntry | null>(null);
  const deleteDraftMutation = useDeleteOwnDraftMutation();

  return (
    <>
      <motion.ul
        layout
        className="overflow-hidden rounded-xl border border-border bg-card lg:space-y-3 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent"
      >
        {entries.map((entry) => (
          <motion.li
            key={entry.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <OwnerEntryRow entry={entry} onDelete={() => setEntryPendingDeletion(entry)} />
          </motion.li>
        ))}
      </motion.ul>
      <DeleteDraftDialog
        entry={entryPendingDeletion}
        isPending={deleteDraftMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !deleteDraftMutation.isPending) {
            setEntryPendingDeletion(null);
          }
        }}
        onConfirm={() => {
          if (!entryPendingDeletion) {
            return;
          }

          deleteDraftMutation.mutate(entryPendingDeletion.id, {
            onSuccess: () => setEntryPendingDeletion(null),
          });
        }}
      />
    </>
  );
}

function OwnerEntryRow({ entry, onDelete }: { entry: OwnEntry; onDelete: () => void }) {
  const statusMeta = ENTRY_STATUS_META[entry.status];

  return (
    <article className="group border-b border-border bg-card px-4 py-4 transition-colors last:border-b-0 lg:rounded-xl lg:border-0 lg:p-4 lg:transition-all lg:duration-200 lg:hover:border-primary/25 lg:hover:shadow-[0_14px_34px_rgba(31,41,55,0.07)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h2 className="line-clamp-2 text-[17px] font-bold leading-7 text-foreground lg:text-[20px] lg:leading-8">
              {entry.title || "بدون عنوان"}
            </h2>
            <p className="mt-2 line-clamp-2 text-[14px] leading-7 text-muted-foreground">
              {entry.summary || "برای این مطلب هنوز خلاصه‌ای نوشته نشده است."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={getEntryStatusBadgeClassName(entry.status, "rounded-full px-3 py-1")}
              >
                {statusMeta.label}
              </Badge>
              {entry.category ? (
                <Badge variant="outline" className="rounded-full bg-background px-3 py-1">
                  {entry.category.name}
                </Badge>
              ) : null}
              {entry.contentType ? (
                <span className="text-[13px] font-medium text-muted-foreground">
                  {entry.contentType.name}
                </span>
              ) : null}
            </div>
          </div>
          {entry.latestModerationReview?.comments &&
          (entry.status === "CHANGES_REQUESTED" || entry.status === "REJECTED") ? (
            <div className="flex gap-3 rounded-xl border border-terracotta/20 bg-terracotta/5 px-4 py-3 text-[14px] leading-7 text-foreground">
              <ChatBubbleLeftRightIcon
                className="mt-1 size-5 shrink-0 text-terracotta"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="font-semibold">
                  {entry.status === "CHANGES_REQUESTED" ? "نظر بررسی‌کننده" : "دلیل رد مطلب"}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {entry.latestModerationReview.comments}
                </p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {entry.latestModerationReview.moderator.displayName} ·{" "}
                  {formatPersianDate(entry.latestModerationReview.createdAt)}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
          {entry.status === "PUBLISHED" ? (
            <ProfileViewLink href={`/entries/${encodeURIComponent(entry.slug)}`} label="نمایش" />
          ) : null}
          {isOwnerEditableStatus(entry.status) ? (
            <Link
              href={`/entries/${entry.id}/edit`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
            >
              ویرایش
            </Link>
          ) : null}
          {canDeleteOwnEntry(entry) ? <ProfileDeleteButton onClick={onDelete} /> : null}
        </div>
      </div>
    </article>
  );
}

function ProfileViewLink({ href, label }: { href: string; label: string }) {
  const { iconRef, triggerProps } = useAnimatedIcon();

  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "self-start rounded-full")}
      {...triggerProps}
    >
      <EyeIcon ref={iconRef} size={16} aria-hidden="true" />
      {label}
    </Link>
  );
}

function ProfileDeleteButton({ onClick }: { onClick: () => void }) {
  const { iconRef, triggerProps } = useAnimatedIcon();

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive",
      )}
      {...triggerProps}
    >
      <TrashIcon ref={iconRef} size={16} aria-hidden="true" />
      حذف
    </button>
  );
}

function ProfilePagination({
  meta,
  query,
}: {
  meta: {
    page: number;
    totalPages: number;
  };
  query: ProfileQuery;
}) {
  if (meta.totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className="flex items-center justify-center gap-3 pt-2 text-[14px] font-semibold"
      aria-label="صفحه‌بندی مطالب من"
    >
      <Link
        href={createProfileHref(query, { page: Math.max(1, meta.page - 1) })}
        scroll={false}
        aria-disabled={meta.page <= 1}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "rounded-full",
          meta.page <= 1 && "pointer-events-none opacity-45",
        )}
      >
        قبلی
      </Link>
      <span className="text-muted-foreground">
        صفحه {formatPersianNumber(meta.page)} از {formatPersianNumber(meta.totalPages)}
      </span>
      <Link
        href={createProfileHref(query, { page: Math.min(meta.totalPages, meta.page + 1) })}
        scroll={false}
        aria-disabled={meta.page >= meta.totalPages}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "rounded-full",
          meta.page >= meta.totalPages && "pointer-events-none opacity-45",
        )}
      >
        بعدی
      </Link>
    </nav>
  );
}

function OwnerEntryListSkeleton() {
  return (
    <div className="space-y-3">
      {ownerEntrySkeletonKeys.map((key) => (
        <div
          key={`profile-entry-skeleton-${key}`}
          className="rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-1/2" />
            </div>
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function OwnerFeedbackListSkeleton() {
  return (
    <div className="space-y-3">
      {ownerFeedbackSkeletonKeys.map((key) => (
        <div
          key={`profile-feedback-skeleton-${key}`}
          className="rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-1/2" />
            </div>
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function OwnerEntriesEmptyState({ query }: { query: ProfileQuery }) {
  const hasStatusFilter = Boolean(query.status);

  return (
    <div className="rounded-[24px] border border-dashed border-border bg-card px-5 py-12 text-center">
      <DocumentTextIcon className="mx-auto size-10 text-primary" aria-hidden="true" />
      <h2 className="mt-4 text-[20px] font-bold text-foreground">
        {hasStatusFilter ? "مطلبی با این وضعیت پیدا نشد" : "هنوز مطلبی ننوشته‌اید"}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[14px] leading-7 text-muted-foreground">
        {hasStatusFilter
          ? "فیلتر وضعیت را تغییر دهید یا همه مطالب را ببینید."
          : "اگر چیزی از فرهنگ و تاریخ محل‌تان می‌دانید، با دیگران شریک کنید."}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        {hasStatusFilter ? (
          <Link
            href={createProfileHref(query, { status: undefined, page: 1 })}
            scroll={false}
            className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
          >
            حذف فیلتر
          </Link>
        ) : null}
        <Link href="/entries/new" className={cn(buttonVariants(), "rounded-full")}>
          افزودن مطلب
        </Link>
      </div>
    </div>
  );
}

function ProfileEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof DocumentTextIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-border bg-card px-5 py-12 text-center">
      <Icon className="mx-auto size-11 text-primary" aria-hidden="true" />
      <h2 className="mt-4 text-[20px] font-bold text-foreground">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-[14px] leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function ProfileErrorState({
  title = "مطالب بارگذاری نشد",
  onRetry,
}: {
  title?: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-destructive/20 bg-card px-5 py-10 text-center">
      <ArrowPathIcon className="mx-auto size-10 text-destructive" aria-hidden="true" />
      <h2 className="mt-4 text-[20px] font-bold text-foreground">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-[14px] leading-7 text-muted-foreground">
        فعلاً بخشی از مطالب در دسترس نیست. کمی بعد دوباره تلاش کنید.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className={cn(buttonVariants({ variant: "outline" }), "mt-6 rounded-full")}
      >
        تلاش دوباره
      </button>
    </div>
  );
}

function DeleteDraftDialog({
  entry,
  isPending,
  onOpenChange,
  onConfirm,
}: {
  entry: OwnEntry | null;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={Boolean(entry)} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[24px] border border-border bg-card p-5 text-foreground shadow-[0_24px_70px_rgba(31,41,55,0.16)]">
        <AlertDialogHeader className="place-items-start text-start">
          <AlertDialogTitle className="text-[18px] font-bold text-foreground">
            پیش‌نویس حذف شود؟
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[14px] leading-7 text-muted-foreground">
            این کار فقط برای پیش‌نویس‌های حذف‌پذیر انجام می‌شود و پس از تأیید backend قطعی خواهد شد.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="-mx-5 -mb-5 border-border bg-muted/40 px-5 py-4 sm:justify-start">
          <AlertDialogCancel className="rounded-full">انصراف</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "در حال حذف..." : "حذف پیش‌نویس"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function isVerifiedEmailError(error: unknown) {
  return isApiError(error) && error.code === "AUTH_EMAIL_VERIFICATION_REQUIRED";
}

function createProfileFallback(user: SafeUser): ProfileOwner {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
    displayName: user.displayName,
    profileImageUrl: null,
    biography: null,
    province: null,
    culturalInterests: [],
    emailVerified: user.emailVerified,
    emailVerifiedAt: null,
    createdAt: "",
    updatedAt: "",
  };
}

export { OwnerProfilePage };
