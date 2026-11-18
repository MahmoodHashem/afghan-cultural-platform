"use client";

import {
  ArrowPathIcon,
  BookmarkIcon,
  CameraIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EyeIcon } from "@/components/icons/animated/eye";
import { TrashIcon } from "@/components/icons/animated/trash";
import { EmptyState } from "@/components/common/empty-state";
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
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { EmailVerificationButton } from "@/features/auth/components/email-verification-button";
import { VerifiedEmailBanner } from "@/features/auth/components/verified-email-banner";
import {
  cancelEntryRevision,
  type OwnEntry,
  startEntryRevision,
} from "@/features/entries/api/entry-drafts-api";
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
import { profileQueryKeys } from "@/features/profile/constants/profile-query-keys";
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
import { createUserInitials, getUserAvatarColorClass } from "@/lib/utils/user";
import { type SafeUser, useAuthStore } from "@/stores/auth-store";
import { ProfileEditDialog } from "./profile-edit-dialog";
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
    className: "border-ok/25 bg-ok-soft text-ok",
  },
  HIDDEN: {
    label: "پنهان‌شده",
    className: "border-line bg-line-soft text-faint",
  },
  DELETED: {
    label: "حذف‌شده",
    className: "border-brand/25 bg-brand-soft text-brand-ink",
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
    <div className="pb-16 lg:pb-20">
      <OwnerProfileHeader user={profileUser} isProfileLoading={ownerProfile.isLoading} />
      <section className="content-container relative z-10 -mt-7 space-y-5 max-lg:px-0 lg:space-y-6">
        <ProfileNavigationTabs activeTab={profileQuery.tab} query={profileQuery} />
        <div className="w-full outline-none">
          {profileQuery.tab === "entries" ? <OwnerEntriesPanel query={profileQuery} /> : null}
          {profileQuery.tab === "comments" ? <OwnerCommentsPanel query={profileQuery} /> : null}
          {profileQuery.tab === "bookmarks" ? <OwnerBookmarksPanel query={profileQuery} /> : null}
        </div>
      </section>
    </div>
  );
}

/** Navy dashboard band: matted avatar, name, bio, interests and the owner's contribution totals. */
function OwnerProfileHeader({
  user,
  isProfileLoading,
}: {
  user: ProfileOwner;
  isProfileLoading: boolean;
}) {
  const stats = useOwnerEntryStats();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const chips = [user.province?.name, ...user.culturalInterests].filter(Boolean) as string[];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-linear-155 from-hero-navy to-hero-navy-deep pt-[calc(3.5rem+env(safe-area-inset-top)+1.75rem)] pb-16 text-white lg:pt-[calc(4.125rem+3rem)] lg:pb-20">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -end-[0.04em] -bottom-[0.3em] -z-10 font-calli text-[180px] leading-none whitespace-nowrap text-white opacity-[0.08] select-none max-lg:text-[110px]"
        >
          روایت‌گر
        </span>

        <div className="content-container grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-end sm:text-start">
            <div className="relative shrink-0 rounded-full bg-white/10 p-1.5 ring-1 ring-white/20">
              <Avatar className="size-24 bg-brand-soft lg:size-28">
                {user.profileImageUrl ? (
                  <AvatarImage src={user.profileImageUrl} alt={user.displayName} />
                ) : null}
                <AvatarFallback
                  className={cn(
                    "text-[22px] font-bold lg:text-[26px]",
                    getUserAvatarColorClass(user.id),
                  )}
                >
                  {createUserInitials(user.displayName)}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                className="absolute end-0 bottom-0 grid size-9 place-items-center rounded-full border-2 border-hero-navy-deep bg-primary text-white shadow-card transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="ویرایش تصویر پروفایل"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <CameraIcon className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="min-w-0 space-y-2">
              <p className="font-hand text-[19px] text-gold">داشبورد من</p>
              <h1 className="text-[26px] leading-[1.5] font-bold text-white lg:text-[34px]">
                {user.displayName}
              </h1>
              <p className="text-[13px] text-white/65" dir="ltr">
                {user.email}
              </p>
              {isProfileLoading ? <Skeleton className="h-4 w-36 bg-white/12" /> : null}
              {user.biography ? (
                <p className="max-w-xl text-[14px] leading-[2] text-white/80">{user.biography}</p>
              ) : null}
              {chips.length > 0 ? (
                <ul className="flex flex-wrap justify-center gap-2 pt-1 sm:justify-start">
                  {chips.map((chip) => (
                    <li key={chip}>
                      <Badge variant="glass">{chip}</Badge>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 sm:justify-start">
                <Button
                  type="button"
                  size="sm"
                  variant="glass"
                  className="h-9 px-4"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <PencilSquareIcon className="size-4" aria-hidden="true" />
                  ویرایش پروفایل
                </Button>
                <Link
                  href="/entries/new"
                  className={cn(buttonVariants({ variant: "pill", size: "sm" }), "h-9 px-4")}
                >
                  <DocumentTextIcon className="size-4" aria-hidden="true" />
                  مطلب تازه
                </Link>
                {!user.emailVerified ? (
                  <EmailVerificationButton
                    email={user.email}
                    compact
                    className="text-gold hover:bg-white/10 hover:text-gold"
                  />
                ) : null}
                <ProfileLogoutButton className="mt-0 text-white/70 hover:bg-white/10 hover:text-white" />
              </div>
            </div>
          </div>

          <ProfileStats stats={stats} />
        </div>
      </section>
      <ProfileEditDialog user={user} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
    </>
  );
}

function ProfileStats({ stats }: { stats: ReturnType<typeof useOwnerEntryStats> }) {
  const items = [
    { label: "مطلب", value: stats.entries },
    { label: "دیدگاه", value: stats.comments },
    { label: "ذخیره", value: stats.bookmarks },
  ];

  return (
    <dl className="grid grid-cols-3 gap-2 sm:gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex min-w-24 flex-col-reverse items-center gap-1 rounded-[18px_18px_18px_6px] border border-white/14 bg-white/8 px-4 py-3 backdrop-blur-sm"
        >
          <dt className="text-[12px] text-white/65">{item.label}</dt>
          <dd className="text-[26px] leading-none font-bold text-white lg:text-[30px]">
            {stats.isLoading ? (
              <Skeleton className="h-7 w-8 bg-white/12" />
            ) : stats.isError ? (
              <>
                <span aria-hidden="true">—</span>
                <span className="sr-only">آمار در دسترس نیست</span>
              </>
            ) : (
              <span>{formatPersianNumber(item.value)}</span>
            )}
          </dd>
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
      className="sticky z-30 w-full py-2 lg:static lg:py-0"
    >
      <Tabs value={activeTab} className="overflow-hidden px-4 lg:px-0">
        <TabsList
          variant="default"
          className="relative mx-auto h-auto min-h-12 w-max justify-start gap-1 rounded-full border border-line-soft bg-surface p-1.5 shadow-lift lg:mx-0"
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
                  "relative inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-[13px] font-bold outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  isActive ? "text-primary-foreground" : "text-copy hover:bg-paper hover:text-ink",
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
    <div className="space-y-4 px-4 lg:px-0">
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
    <div className="rounded-card border border-line-soft bg-surface p-5 shadow-card">
      <VerifiedEmailBanner />
    </div>
  );
}

function OwnerCommentsPanel({ query }: { query: ProfileQuery }) {
  const ownerComments = useOwnerComments(query);

  return (
    <div className="space-y-4 px-4 lg:px-0">
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
    <div className="space-y-4 px-4 lg:px-0">
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
    <div className="flex min-h-11 items-center justify-between rounded-full border border-line-soft bg-surface px-5 py-1 shadow-card">
      <p className="text-[13px] font-bold text-copy">{label}</p>
      {total > 0 ? (
        <p className="text-[13px] text-faint">
          {formatPersianNumber(total)} {label}
        </p>
      ) : null}
    </div>
  );
}

function OwnerEntryToolbar({ query, total }: { query: ProfileQuery; total: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 rounded-full border border-line-soft bg-surface px-1.5 py-1.5 shadow-card lg:gap-5">
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
                  "relative inline-flex h-8 shrink-0 items-center rounded-full px-3.5 text-[13px] font-bold transition-colors outline-none focus-visible:outline-2 focus-visible:outline-ring",
                  isActive ? "text-brand-ink" : "text-copy hover:text-ink",
                )}
              >
                {isActive ? (
                  <motion.span
                    layoutId="owner-entry-toolbar-active-filter"
                    className="absolute inset-0 rounded-full bg-brand-soft"
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
          <p className="shrink-0 px-3 text-center text-[12px] text-faint lg:text-[13px]">
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
      className="space-y-3"
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
    <article className="group rounded-card border border-line-soft bg-surface p-4 shadow-card transition-[translate,box-shadow,border-color] duration-300 ease-expo hover:border-line hover:shadow-lift sm:p-5 lg:hover:-translate-y-0.5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn("rounded-full px-3 py-1", commentStatusMeta.className)}
            >
              {commentStatusMeta.label}
            </Badge>
            <span className="text-[12.5px] text-faint">
              {comment.parentId ? "پاسخ · " : null}
              {formatPersianDate(comment.updatedAt)}
            </span>
          </div>
          <p className="line-clamp-3 text-[14px] leading-[2] text-ink lg:text-[15px]">
            {comment.body}
          </p>
          <Link
            href={`/entries/${encodeURIComponent(comment.entry.slug)}`}
            className="line-clamp-1 text-[13.5px] font-bold text-brand-ink transition-colors hover:text-brand"
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
      className="space-y-3"
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
    <article className="group rounded-card border border-line-soft bg-surface p-4 shadow-card transition-[translate,box-shadow,border-color] duration-300 ease-expo hover:border-line hover:shadow-lift sm:p-5 lg:hover:-translate-y-0.5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-full border-brand/25 bg-brand-soft px-3 py-1 text-brand-ink"
            >
              ذخیره‌شده
            </Badge>
            <span className="text-[12.5px] text-faint">
              {formatPersianDate(bookmark.createdAt)}
            </span>
          </div>
          <div>
            <h2 className="line-clamp-2 text-[16px] leading-[1.8] font-bold text-ink group-hover:text-brand-ink lg:text-[18px]">
              {bookmark.entry.title}
            </h2>
            <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-[1.95] text-copy">
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
        className="space-y-3"
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
    <article className="group rounded-card border border-line-soft bg-surface p-4 shadow-card transition-[translate,box-shadow,border-color] duration-300 ease-expo hover:border-line hover:shadow-lift sm:p-5 lg:hover:-translate-y-0.5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h2 className="line-clamp-2 text-[16px] leading-[1.8] font-bold text-ink group-hover:text-brand-ink lg:text-[18px]">
              {entry.title || "بدون عنوان"}
            </h2>
            <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-[1.95] text-copy">
              {entry.summary || "برای این مطلب هنوز خلاصه‌ای نوشته نشده است."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-faint">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={getEntryStatusBadgeClassName(entry.status, "rounded-full px-3 py-1")}
              >
                {statusMeta.label}
              </Badge>
              {entry.activeRevision ? (
                <Badge
                  variant="outline"
                  className="rounded-full border-lapis/25 bg-tint-navy px-3 py-1 text-lapis dark:text-ink"
                >
                  {getRevisionStatusLabel(entry.activeRevision.status)}
                </Badge>
              ) : null}
              {entry.category ? (
                <Badge
                  variant="outline"
                  className="rounded-full border-line bg-paper px-3 py-1 text-copy"
                >
                  {entry.category.name}
                </Badge>
              ) : null}
              {entry.contentType ? (
                <span className="text-[12.5px] font-medium text-faint">
                  {entry.contentType.name}
                </span>
              ) : null}
            </div>
          </div>
          {entry.latestModerationReview?.comments &&
            (entry.status === "CHANGES_REQUESTED" || entry.status === "REJECTED") ? (
            <div className="flex gap-3 rounded-[14px_14px_14px_4px] border border-saffron/25 bg-tint-sand px-4 py-3 text-[13.5px] leading-[1.95] text-ink">
              <ChatBubbleLeftRightIcon
                className="mt-1 size-5 shrink-0 text-saffron"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="font-bold">
                  {entry.status === "CHANGES_REQUESTED" ? "نظر بررسی‌کننده" : "دلیل رد مطلب"}
                </p>
                <p className="mt-1 text-copy">
                  {entry.latestModerationReview.comments}
                </p>
                <p className="mt-1 text-[12px] text-faint">
                  {entry.latestModerationReview.moderator.displayName} ·{" "}
                  {formatPersianDate(entry.latestModerationReview.createdAt)}
                </p>
              </div>
            </div>
          ) : null}
          {entry.activeRevision?.requestFeedback ? (
            <div className="flex gap-3 rounded-[14px_14px_14px_4px] border border-saffron/25 bg-tint-sand px-4 py-3 text-[13.5px] leading-[1.95] text-ink">
              <ChatBubbleLeftRightIcon
                className="mt-1 size-5 shrink-0 text-saffron"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="font-bold">پیشنهاد ویرایش مطلب منتشرشده</p>
                <p className="mt-1 text-copy">{entry.activeRevision.requestFeedback}</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
          {entry.status === "PUBLISHED" ? (
            <>
              <ProfileViewLink href={`/entries/${encodeURIComponent(entry.slug)}`} label="نمایش" />
              <PublishedEntryRevisionButton entry={entry} />
              {entry.activeRevision && entry.activeRevision.status !== "PENDING_REVIEW" ? (
                <CancelEntryRevisionButton entry={entry} />
              ) : null}
            </>
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

function CancelEntryRevisionButton({ entry }: { entry: OwnEntry }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const mutation = useMutation({
    mutationFn: () => cancelEntryRevision(entry.id),
    onSuccess: async () => {
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.all });
      toast.success("ویرایش مطلب لغو شد.");
    },
    onError: () => toast.error("لغو ویرایش انجام نشد."),
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="rounded-full text-brand-ink hover:bg-brand-soft"
        onClick={() => setOpen(true)}
      >
        لغو ویرایش
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>پیش‌نویس ویرایش لغو شود؟</AlertDialogTitle>
          <AlertDialogDescription>
            نسخه منتشرشده مطلب باقی می‌ماند، اما تغییرات ذخیره‌شده این ویرایش حذف می‌شوند.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>انصراف</AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            onClick={(event) => {
              event.preventDefault();
              mutation.mutate();
            }}
          >
            {mutation.isPending ? "در حال لغو..." : "لغو ویرایش"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function PublishedEntryRevisionButton({ entry }: { entry: OwnEntry }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const canEdit = entry.activeRevision?.status !== "PENDING_REVIEW";
  const mutation = useMutation({
    mutationFn: () => startEntryRevision(entry.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.all });
      router.push(`/entries/${entry.id}/edit?mode=revision`);
    },
    onError: () => toast.error("امکان آغاز ویرایش مطلب فراهم نشد."),
  });

  if (entry.activeRevision?.status === "PENDING_REVIEW") {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-full"
      disabled={!canEdit || mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      <PencilSquareIcon className="size-4" aria-hidden="true" />
      {entry.activeRevision ? "ادامه ویرایش" : "ویرایش مطلب"}
    </Button>
  );
}

function getRevisionStatusLabel(status: NonNullable<OwnEntry["activeRevision"]>["status"]) {
  const labels = {
    DRAFT: "پیش‌نویس ویرایش",
    PENDING_REVIEW: "تغییرات در انتظار بررسی",
    CHANGES_REQUESTED: "ویرایش نیازمند تغییر",
    REJECTED: "ویرایش ردشده",
    APPROVED: "ویرایش تأییدشده",
    CANCELLED: "ویرایش لغوشده",
  } as const;
  return labels[status];
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
        "rounded-full text-brand-ink hover:bg-brand-soft hover:text-brand-ink",
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
      className="flex items-center justify-center gap-3 pt-3 text-[13.5px] font-bold"
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
      <span className="text-faint">
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
          className="rounded-card border border-line-soft bg-surface p-4 shadow-card"
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
          className="rounded-card border border-line-soft bg-surface p-4 shadow-card"
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
    <EmptyState
      className="bg-surface"
      title={hasStatusFilter ? "مطلبی با این وضعیت پیدا نشد" : "نخستین روایت شما کجاست؟"}
      description={
        hasStatusFilter
          ? "فیلتر وضعیت را تغییر دهید یا همه مطالب را ببینید."
          : "اگر قصه، رسم، جا یا هنری از محل‌تان می‌شناسید، آن را بنویسید تا برای دیگران و نسل‌های بعد بماند."
      }
      action={
        <div className="flex flex-wrap justify-center gap-3">
          {hasStatusFilter ? (
            <Link
              href={createProfileHref(query, { status: undefined, page: 1 })}
              scroll={false}
              className={buttonVariants({ variant: "outline" })}
            >
              حذف فیلتر
            </Link>
          ) : null}
          <Link href="/entries/new" className={buttonVariants({ variant: "pill" })}>
            <PencilSquareIcon className="size-4" aria-hidden="true" />
            افزودن مطلب
          </Link>
        </div>
      }
    />
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
    <EmptyState
      className="bg-surface"
      illustration="none"
      title={
        <span className="flex flex-col items-center gap-3">
          <span className="grid size-12 place-items-center rounded-[16px_16px_16px_5px] bg-brand-soft text-brand-ink">
            <Icon className="size-6" aria-hidden="true" />
          </span>
          {title}
        </span>
      }
      description={description}
    />
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
    <div className="rounded-card border border-brand/20 bg-surface px-5 py-10 text-center shadow-card">
      <ArrowPathIcon className="mx-auto size-10 text-brand" aria-hidden="true" />
      <h2 className="mt-4 text-card-title text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-[14px] leading-[2] text-copy">
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
      <AlertDialogContent className="p-5">
        <AlertDialogHeader className="place-items-start text-start">
          <AlertDialogTitle>
            پیش‌نویس حذف شود؟
          </AlertDialogTitle>
          <AlertDialogDescription className="leading-7">
            این کار فقط برای پیش‌نویس‌های حذف‌پذیر انجام می‌شود و پس از تأیید backend قطعی خواهد شد.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-start">
          <AlertDialogCancel className="rounded-full">انصراف</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            variant="destructive"
            className="rounded-full"
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
    profileImageUrl: user.profileImageUrl,
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
