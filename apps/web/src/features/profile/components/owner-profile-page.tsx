"use client";

import {
  ArrowPathIcon,
  BookmarkIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  DocumentTextIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerifiedEmailBanner } from "@/features/auth/components/verified-email-banner";
import type { OwnEntry } from "@/features/entries/api/entry-drafts-api";
import {
  canDeleteOwnEntry,
  ENTRY_STATUS_FILTERS,
  ENTRY_STATUS_META,
  getEntryStatusBadgeClassName,
  isOwnerEditableStatus,
} from "@/features/profile/constants/entry-status";
import {
  useDeleteOwnDraftMutation,
  useOwnerEntries,
  useOwnerEntryStats,
} from "@/features/profile/hooks/use-owner-entries";
import {
  createProfileHref,
  isProfileTab,
  type ProfileQuery,
  type ProfileTab,
  parseProfileQuery,
} from "@/features/profile/utils/profile-query";
import { isApiError } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";
import { type SafeUser, useAuthStore } from "@/stores/auth-store";
import { ProfilePageSkeleton } from "./profile-page-skeleton";

const profileTabs: Array<{
  value: ProfileTab;
  label: string;
  icon: typeof DocumentTextIcon;
}> = [
    { value: "entries", label: "مطالب من", icon: DocumentTextIcon },
    { value: "reviews", label: "دیدگاه‌ها", icon: ChatBubbleLeftRightIcon },
    { value: "bookmarks", label: "ذخیره‌ها", icon: BookmarkIcon },
  ];

const ownerEntrySkeletonKeys = ["first", "second", "third", "fourth"] as const;

function OwnerProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const profileQuery = useMemo(() => parseProfileQuery(searchParams), [searchParams]);

  if (!user) {
    return <ProfilePageSkeleton />;
  }

  return (
    <section className="content-container space-y-7 pb-16">
      <OwnerProfileHeader user={user} />
      <Tabs
        value={profileQuery.tab}
        onValueChange={(value) => {
          if (isProfileTab(value)) {
            router.push(createProfileHref(profileQuery, { tab: value, page: 1 }), {
              scroll: false,
            });
          }
        }}
        className="gap-6"
      >
        <ProfileNavigationTabs />
        <TabsContent value="entries" className="outline-none">
          {profileQuery.tab === "entries" ? <OwnerEntriesPanel query={profileQuery} /> : null}
        </TabsContent>
        <TabsContent value="reviews" className="outline-none">
          {profileQuery.tab === "reviews" ? (
            <DeferredProfileTab
              icon={ChatBubbleLeftRightIcon}
              title="دیدگاه‌های شما اینجا نمایش داده می‌شود"
              description="امکان نمایش فهرست دیدگاه‌های شما هنوز آماده نشده است. تا آن زمان این بخش داده ساختگی نشان نمی‌دهد."
            />
          ) : null}
        </TabsContent>
        <TabsContent value="bookmarks" className="outline-none">
          {profileQuery.tab === "bookmarks" ? (
            <DeferredProfileTab
              icon={BookmarkIcon}
              title="ذخیره‌های شما هنوز وصل نشده است"
              description="امکان نمایش فهرست ذخیره‌های شما هنوز آماده نشده است. این بخش بعداً با داده واقعی وصل می‌شود و فعلاً داده ساختگی نشان نمی‌دهد."
            />
          ) : null}
        </TabsContent>
      </Tabs>
    </section>
  );
}

function OwnerProfileHeader({ user }: { user: SafeUser }) {
  const stats = useOwnerEntryStats();

  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_18px_55px_rgba(31,41,55,0.07)]">
      <div className="relative min-h-36  px-5 py-6 sm:px-8">
        <div className="absolute inset-x-0 bottom-0 h-px bg-border" aria-hidden="true" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-20 border-4 border-card bg-primary-light shadow-[0_12px_30px_rgba(31,41,55,0.12)]">
              <AvatarFallback className="bg-primary-light text-[24px] font-bold text-primary">
                {createInitials(user.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[28px] font-bold leading-10 text-foreground sm:text-[34px]">
                  {user.displayName}
                </h1>
              
                  {user.emailVerified ? <CheckIcon className="size-5 border rounded-full"  /> : "ایمیل تأیید نشده"}
            
              </div>
              <p className="max-w-2xl text-[14px] leading-7 text-muted-foreground">
                اینجا می‌توانید نوشته‌های فرهنگی خود را دنبال کنید و وضعیت بررسی آن‌ها را ببینید.
              </p>
              <p className="text-[13px] font-medium text-muted-foreground" dir="ltr">
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 cursor-not-allowed rounded-full opacity-70",
              )}
              aria-disabled="true"
              title="ویرایش پروفایل پس از آماده شدن API پروفایل فعال می‌شود."
            >
              ویرایش پروفایل
            </span>
            <Link
              href="/entries/new"
              className={cn(buttonVariants({ variant: "default" }), "h-10 rounded-full")}
            >
              <PlusIcon className="size-4" aria-hidden="true" />
              افزودن مطلب
            </Link>
          </div>
        </div>
      </div>
      <ProfileStats stats={stats} />
    </div>
  );
}

function ProfileStats({ stats }: { stats: ReturnType<typeof useOwnerEntryStats> }) {
  const items = [
    { label: "همه مطالب", value: stats.all },
    { label: "منتشرشده", value: stats.published },
    { label: "در انتظار بررسی / نیازمند اصلاح", value: stats.needsAttention },
  ];

  return (
    <dl className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-x-reverse sm:divide-y-0">
      {items.map((item) => (
        <div key={item.label} className="px-5 py-5 sm:px-8">
          <dt className="text-[13px] font-medium text-muted-foreground">{item.label}</dt>
          <dd className="mt-2 text-[28px] font-bold text-foreground">
            {stats.isLoading ? (
              <Skeleton className="h-8 w-14" />
            ) : stats.isError ? (
              <>
                <span aria-hidden="true">—</span>
                <span className="sr-only">آمار در دسترس نیست</span>
              </>
            ) : (
              <span>{formatNumber(item.value)}</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ProfileNavigationTabs() {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <TabsList className="h-auto min-h-12 w-max rounded-full border border-border bg-card p-1 shadow-[0_2px_10px_rgba(0,0,0,.04)]">
        {profileTabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="h-10 min-w-30 rounded-full px-4 text-[14px] data-active:bg-primary data-active:text-primary-foreground"
            >
              <Icon className="size-4" aria-hidden="true" />
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </div>
  );
}

function OwnerEntriesPanel({ query }: { query: ProfileQuery }) {
  const ownerEntries = useOwnerEntries(query);

  return (
    <div className="space-y-4">
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

function OwnerEntryToolbar({ query, total }: { query: ProfileQuery; total: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-[0_2px_10px_rgba(0,0,0,.035)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[15px] font-bold text-foreground">{formatNumber(total)} مطلب</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            فقط نوشته‌های متعلق به حساب شما نمایش داده می‌شود.
          </p>
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
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
                  "inline-flex h-9 shrink-0 items-center rounded-full border px-3 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/35 hover:bg-primary-light/30 hover:text-primary",
                )}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OwnerEntryList({ entries }: { entries: OwnEntry[] }) {
  const [entryPendingDeletion, setEntryPendingDeletion] = useState<OwnEntry | null>(null);
  const deleteDraftMutation = useDeleteOwnDraftMutation();

  return (
    <>
      <motion.ul layout className="space-y-3">
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
    <article className="group rounded-2xl border border-border bg-card p-4 shadow-[0_2px_10px_rgba(0,0,0,.035)] transition-all duration-200 hover:border-primary/25 hover:shadow-[0_14px_34px_rgba(31,41,55,0.07)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
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
          <div>
            <h2 className="line-clamp-2 text-[20px] font-bold leading-8 text-foreground">
              {entry.title || "بدون عنوان"}
            </h2>
            <p className="mt-2 line-clamp-2 text-[14px] leading-7 text-muted-foreground">
              {entry.summary || "برای این مطلب هنوز خلاصه‌ای نوشته نشده است."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-muted-foreground">
            <span>{getLocationLabel(entry)}</span>
            <span>آخرین ویرایش: {formatDate(entry.updatedAt)}</span>
            <span>{statusMeta.description}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
          {entry.status === "PUBLISHED" ? (
            <Link
              href={`/entries/${encodeURIComponent(entry.slug)}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
            >
              <EyeIcon className="size-4" aria-hidden="true" />
              نمایش
            </Link>
          ) : null}
          {isOwnerEditableStatus(entry.status) ? (
            <span
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "cursor-not-allowed rounded-full opacity-60",
              )}
              aria-disabled="true"
              title="مسیر ویرایش پیش‌نویس هنوز در frontend ساخته نشده است."
            >
              ویرایش به‌زودی
            </span>
          ) : null}
          {canDeleteOwnEntry(entry) ? (
            <button
              type="button"
              onClick={onDelete}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive",
              )}
            >
              <TrashIcon className="size-4" aria-hidden="true" />
              حذف
            </button>
          ) : null}
        </div>
      </div>
    </article>
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
        صفحه {formatNumber(meta.page)} از {formatNumber(meta.totalPages)}
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

function DeferredProfileTab({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof DocumentTextIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-card px-5 py-14 text-center shadow-[0_2px_10px_rgba(0,0,0,.035)]">
      <Icon className="mx-auto size-11 text-primary" aria-hidden="true" />
      <h2 className="mt-4 text-[20px] font-bold text-foreground">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-[14px] leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function ProfileErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-[24px] border border-destructive/20 bg-card px-5 py-10 text-center">
      <ArrowPathIcon className="mx-auto size-10 text-destructive" aria-hidden="true" />
      <h2 className="mt-4 text-[20px] font-bold text-foreground">مطالب بارگذاری نشد</h2>
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

function getLocationLabel(entry: Pick<OwnEntry, "geographicScope" | "province">) {
  if (entry.geographicScope === "NATIONAL") {
    return "سراسر افغانستان";
  }

  if (entry.geographicScope === "NONE") {
    return "بدون وابستگی به مکان";
  }

  return entry.province?.name ?? "وابسته به یک ولایت";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-AF", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-AF").format(value);
}

function createInitials(displayName: string) {
  return displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function isVerifiedEmailError(error: unknown) {
  return isApiError(error) && error.code === "AUTH_EMAIL_VERIFICATION_REQUIRED";
}

export { OwnerProfilePage };
