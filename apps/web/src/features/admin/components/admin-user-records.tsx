"use client";

import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  adminAccountAuditLabels,
  adminEntryStatusLabels,
  adminReviewStatusLabels,
} from "@/features/admin/constants/admin-user-meta";
import {
  useAdminUserActivity,
  useAdminUserEntries,
  useAdminUserReviews,
} from "@/features/admin/hooks/use-admin-users";
import type { AdminPaginationMeta } from "@/features/admin/types/admin-users";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";

type AdminUserRecordTab = "entries" | "reviews" | "activity";

function AdminUserRecords({
  userId,
  tab,
  page,
  onTabChange,
  onPageChange,
}: {
  userId: string;
  tab: AdminUserRecordTab;
  page: number;
  onTabChange: (tab: AdminUserRecordTab) => void;
  onPageChange: (page: number) => void;
}) {
  const entries = useAdminUserEntries(userId, { page, limit: 10 }, tab === "entries");
  const reviews = useAdminUserReviews(userId, { page, limit: 10 }, tab === "reviews");
  const activity = useAdminUserActivity(userId, { page, limit: 10 }, tab === "activity");

  return (
    <Card className="gap-0 overflow-hidden rounded-xl py-0 shadow-none">
      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (value === "entries" || value === "reviews" || value === "activity") {
            onTabChange(value);
          }
        }}
      >
        <div className="overflow-x-auto border-b border-border px-4 pt-3">
          <TabsList variant="line" className="h-10 min-w-max gap-5">
            <TabsTrigger value="entries" className="px-2">
              <DocumentTextIcon className="size-4" aria-hidden="true" />
              مطالب
            </TabsTrigger>
            <TabsTrigger value="reviews" className="px-2">
              <ChatBubbleLeftRightIcon className="size-4" aria-hidden="true" />
              دیدگاه‌ها
            </TabsTrigger>
            <TabsTrigger value="activity" className="px-2">
              <ClockIcon className="size-4" aria-hidden="true" />
              تاریخچه حساب
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="entries" className="m-0">
          <RecordsState
            loading={entries.isLoading}
            error={entries.isError}
            empty={entries.data?.data.length === 0}
            emptyMessage="این کاربر هنوز مطلبی ثبت نکرده است."
            onRetry={() => void entries.refetch()}
          >
            <div className="divide-y divide-border">
              {entries.data?.data.map((entry) => (
                <article
                  key={entry.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    {entry.status === "PUBLISHED" ? (
                      <Link
                        href={`/entries/${encodeURIComponent(entry.slug)}`}
                        className="font-semibold text-foreground hover:text-primary"
                      >
                        {entry.title}
                      </Link>
                    ) : (
                      <h3 className="font-semibold text-foreground">{entry.title}</h3>
                    )}
                    <p className="mt-1 line-clamp-1 text-[12px] text-muted-foreground">
                      {entry.summary || "خلاصه‌ای ثبت نشده است."}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge variant="outline" className="rounded-full">
                      {adminEntryStatusLabels[entry.status]}
                    </Badge>
                    <time className="text-[12px] text-muted-foreground" dateTime={entry.updatedAt}>
                      {formatPersianDate(entry.updatedAt)}
                    </time>
                  </div>
                </article>
              ))}
            </div>
            {entries.data ? (
              <RecordPagination meta={entries.data.meta} onPageChange={onPageChange} />
            ) : null}
          </RecordsState>
        </TabsContent>

        <TabsContent value="reviews" className="m-0">
          <RecordsState
            loading={reviews.isLoading}
            error={reviews.isError}
            empty={reviews.data?.data.length === 0}
            emptyMessage="این کاربر هنوز دیدگاهی ننوشته است."
            onRetry={() => void reviews.refetch()}
          >
            <div className="divide-y divide-border">
              {reviews.data?.data.map((review) => (
                <article key={review.id} className="space-y-2 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[12px] font-semibold text-primary">
                      برای {review.entry.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="rounded-full">
                        {adminReviewStatusLabels[review.status]}
                      </Badge>
                      <time
                        className="text-[12px] text-muted-foreground"
                        dateTime={review.createdAt}
                      >
                        {formatPersianDate(review.createdAt)}
                      </time>
                    </div>
                  </div>
                  <p className="line-clamp-3 text-[13px] leading-7 text-foreground">
                    {review.body}
                  </p>
                </article>
              ))}
            </div>
            {reviews.data ? (
              <RecordPagination meta={reviews.data.meta} onPageChange={onPageChange} />
            ) : null}
          </RecordsState>
        </TabsContent>

        <TabsContent value="activity" className="m-0">
          <RecordsState
            loading={activity.isLoading}
            error={activity.isError}
            empty={activity.data?.data.length === 0}
            emptyMessage="هنوز اقدام مدیریتی برای این حساب ثبت نشده است."
            onRetry={() => void activity.refetch()}
          >
            <ol className="divide-y divide-border">
              {activity.data?.data.map((item) => (
                <li key={item.id} className="flex gap-3 p-4">
                  <span
                    className="mt-1 size-2 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-foreground">
                        {adminAccountAuditLabels[item.action]}
                      </p>
                      <time className="text-[12px] text-muted-foreground" dateTime={item.createdAt}>
                        {formatPersianDate(item.createdAt)}
                      </time>
                    </div>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      انجام‌دهنده: {item.actor?.displayName ?? "سامانه"}
                    </p>
                    {item.reason ? (
                      <p className="mt-2 rounded-lg bg-muted/45 px-3 py-2 text-[12px] leading-6 text-foreground">
                        {item.reason}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
            {activity.data ? (
              <RecordPagination meta={activity.data.meta} onPageChange={onPageChange} />
            ) : null}
          </RecordsState>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function RecordsState({
  loading,
  error,
  empty,
  emptyMessage,
  onRetry,
  children,
}: {
  loading: boolean;
  error: boolean;
  empty: boolean;
  emptyMessage: string;
  onRetry: () => void;
  children: React.ReactNode;
}) {
  if (loading) return <RecordsSkeleton />;
  if (error) {
    return (
      <div
        className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center"
        role="alert"
      >
        <ExclamationTriangleIcon className="size-6 text-destructive" aria-hidden="true" />
        <p className="text-[13px] text-muted-foreground">این بخش بارگذاری نشد.</p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          تلاش دوباره
        </Button>
      </div>
    );
  }
  if (empty) {
    return (
      <p className="flex min-h-48 items-center justify-center p-6 text-[13px] text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }
  return children;
}

function RecordsSkeleton() {
  return (
    <div className="space-y-3 p-4" role="status" aria-label="در حال بارگذاری سابقه کاربر">
      {(["one", "two", "three", "four"] as const).map((item) => (
        <Skeleton key={item} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

function RecordPagination({
  meta,
  onPageChange,
}: {
  meta: AdminPaginationMeta;
  onPageChange: (page: number) => void;
}) {
  if (meta.totalPages <= 1) return null;
  return (
    <nav
      className="flex items-center justify-between border-t border-border px-4 py-3"
      aria-label="صفحه‌بندی سابقه کاربر"
    >
      <span className="text-[12px] text-muted-foreground">
        صفحه {formatPersianNumber(meta.page)} از {formatPersianNumber(meta.totalPages)}
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          قبلی
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          بعدی
        </Button>
      </div>
    </nav>
  );
}

export type { AdminUserRecordTab };
export { AdminUserRecords };
