"use client";

import { ArrowLeftIcon, CalendarDaysIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCorrectionQueue,
  useModerationHistory,
  useReportsQueue,
} from "@/features/moderation/hooks/use-content-moderation";
import type { ReportTargetType } from "@/features/moderation/types/content-moderation";
import {
  correctionSectionLabels,
  historyActionLabels,
  reportReasonLabels,
} from "@/features/moderation/utils/content-moderation-labels";
import { cn } from "@/lib/utils";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";

function CorrectionQueue() {
  const [page, setPage] = useState(1);
  const query = useCorrectionQueue({ page, limit: 20, status: "PENDING" });

  return (
    <QueueShell
      title="پیشنهادهای اصلاح"
      description="پیشنهادهای کاربران را با متن فعلی مطلب مقایسه و بررسی کنید."
      breadcrumb="پیشنهادهای اصلاح"
      loading={query.isLoading}
      error={query.isError}
      empty={query.data?.data.length === 0}
      onRetry={() => query.refetch()}
      pagination={query.data?.meta}
      page={page}
      onPageChange={setPage}
    >
      {query.data?.data.map((correction) => (
        <article key={correction.id} className="rounded-xl border border-border bg-card p-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_1fr_1fr_150px] lg:items-center">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="line-clamp-1 font-bold text-foreground">{correction.entry.title}</h2>
                <Badge variant="outline">{correctionSectionLabels[correction.section]}</Badge>
              </div>
              <p className="line-clamp-1 text-[13px] text-muted-foreground">{correction.reason}</p>
            </div>
            <Meta icon={<UserCircleIcon />} text={correction.submittedBy.displayName} />
            <Meta icon={<CalendarDaysIcon />} text={formatPersianDate(correction.submittedAt)} />
            <Link
              href={`/moderator/corrections/${correction.id}`}
              className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
            >
              بررسی پیشنهاد <ArrowLeftIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </article>
      ))}
    </QueueShell>
  );
}

function ReportsQueue() {
  const [page, setPage] = useState(1);
  const [targetType, setTargetType] = useState<ReportTargetType | undefined>();
  const query = useReportsQueue({ page, limit: 20, targetType });

  return (
    <QueueShell
      title="گزارش‌ها"
      description="گزارش‌های مطالب و دیدگاه‌ها را در یک صف بررسی کنید."
      breadcrumb="گزارش‌ها"
      loading={query.isLoading}
      error={query.isError}
      empty={query.data?.data.length === 0}
      onRetry={() => query.refetch()}
      pagination={query.data?.meta}
      page={page}
      onPageChange={setPage}
      toolbar={
        <Tabs
          value={targetType ?? "ALL"}
          onValueChange={(value) => {
            setTargetType(value === "ALL" ? undefined : (value as ReportTargetType));
            setPage(1);
          }}
        >
          <TabsList>
            <TabsTrigger value="ALL">همه</TabsTrigger>
            <TabsTrigger value="ENTRY">مطالب</TabsTrigger>
            <TabsTrigger value="REVIEW">دیدگاه‌ها</TabsTrigger>
          </TabsList>
        </Tabs>
      }
    >
      {query.data?.data.map((report) => (
        <article key={report.id} className="rounded-xl border border-border bg-card p-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_1fr_1fr_150px] lg:items-center">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="line-clamp-1 font-bold text-foreground">{report.entry.title}</h2>
                <Badge variant="outline">
                  {report.targetType === "REVIEW" ? "دیدگاه" : "مطلب"}
                </Badge>
              </div>
              <p className="line-clamp-1 text-[13px] text-muted-foreground">{report.explanation}</p>
            </div>
            <span className="text-[13px] text-muted-foreground">
              {reportReasonLabels[report.reason]}
            </span>
            <Meta icon={<CalendarDaysIcon />} text={formatPersianDate(report.createdAt)} />
            <Link
              href={`/moderator/reports/${report.id}`}
              className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
            >
              بررسی گزارش <ArrowLeftIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </article>
      ))}
    </QueueShell>
  );
}

function ModerationHistory() {
  const [page, setPage] = useState(1);
  const query = useModerationHistory({ page, limit: 30 });

  return (
    <QueueShell
      title="تاریخچه بررسی"
      description="تصمیم‌ها و تغییرات مهم محتوایی از گزارش ثبت‌شده سامانه خوانده می‌شوند."
      breadcrumb="تاریخچه بررسی"
      loading={query.isLoading}
      error={query.isError}
      empty={query.data?.data.length === 0}
      onRetry={() => query.refetch()}
      pagination={query.data?.meta}
      page={page}
      onPageChange={setPage}
    >
      <ol className="relative space-y-0 border-s border-border ms-3">
        {query.data?.data.map((item) => (
          <li key={item.id} className="relative pb-7 ps-7">
            <span className="absolute -start-1.5 top-1 size-3 rounded-full border-2 border-card bg-primary" />
            <article className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-foreground">
                    {historyActionLabels[item.action] ?? item.action}
                  </h2>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {item.entry?.title ?? "محتوای حذف‌شده یا در دسترس‌نبودنی"}
                  </p>
                </div>
                <time className="text-[12px] text-muted-foreground">
                  {formatPersianDate(item.createdAt)}
                </time>
              </div>
              {item.actor ? (
                <p className="mt-3 text-[13px] text-muted-foreground">
                  انجام‌دهنده: {item.actor.displayName}
                </p>
              ) : null}
            </article>
          </li>
        ))}
      </ol>
    </QueueShell>
  );
}

function QueueShell({
  title,
  description,
  breadcrumb,
  toolbar,
  loading,
  error,
  empty,
  onRetry,
  pagination,
  page,
  onPageChange,
  children,
}: {
  title: string;
  description: string;
  breadcrumb: string;
  toolbar?: React.ReactNode;
  loading: boolean;
  error: boolean;
  empty: boolean;
  onRetry: () => unknown;
  pagination?: { total: number; totalPages: number };
  page: number;
  onPageChange: (page: number) => void;
  children: React.ReactNode;
}) {
  return (
    <section className="content-container space-y-7 pb-16">
      <PageBreadcrumb items={[{ label: "خانه", href: "/" }, { label: breadcrumb }]} />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[13px] font-semibold text-primary">مدیریت محتوا</p>
          <h1 className="text-[30px] font-bold text-foreground sm:text-[38px]">{title}</h1>
          <p className="max-w-2xl text-[15px] leading-8 text-muted-foreground">{description}</p>
        </div>
        {pagination ? (
          <Badge variant="outline">{formatPersianNumber(pagination.total)} مورد</Badge>
        ) : null}
      </header>
      {toolbar}
      {loading ? <QueueSkeleton /> : null}
      {error ? <State title="این بخش باز نشد" action="تلاش دوباره" onAction={onRetry} /> : null}
      {empty && !loading ? <State title="موردی برای بررسی نیست" /> : null}
      {!loading && !error ? <div className="space-y-3">{children}</div> : null}
      {pagination && pagination.totalPages > 1 ? (
        <nav className="flex justify-center gap-3" aria-label="صفحه‌بندی">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            قبلی
          </Button>
          <span className="self-center text-[13px] text-muted-foreground">
            صفحه {formatPersianNumber(page)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            بعدی
          </Button>
        </nav>
      ) : null}
    </section>
  );
}

function Meta({
  icon,
  text,
}: {
  icon: React.ReactElement<{ className?: string; "aria-hidden"?: string }>;
  text: string;
}) {
  return (
    <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
      {icon && (
        <span className="[&>svg]:size-4" aria-hidden="true">
          {icon}
        </span>
      )}
      {text}
    </span>
  );
}

function QueueSkeleton() {
  return (
    <div className="space-y-3" role="status">
      <span className="sr-only">در حال بارگذاری</span>
      {[1, 2, 3].map((item) => (
        <Skeleton key={item} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

function State({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => unknown;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
      <p className="font-bold">{title}</p>
      {action ? (
        <Button className="mt-4" variant="outline" onClick={onAction}>
          {action}
        </Button>
      ) : null}
    </div>
  );
}

export { CorrectionQueue, ModerationHistory, ReportsQueue };
