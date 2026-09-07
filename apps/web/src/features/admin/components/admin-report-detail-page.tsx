"use client";

import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminReportResolutionDialog } from "@/features/admin/components/admin-report-resolution-dialog";
import { AdminReportStatusBadge } from "@/features/admin/components/admin-report-status-badge";
import {
  adminReportTargetLabels,
  commentReportActions,
  entryReportActions,
} from "@/features/admin/constants/admin-report-meta";
import { useReport, useResolveReport } from "@/features/moderation/hooks/use-content-moderation";
import type { ReportResolutionAction } from "@/features/moderation/types/content-moderation";
import {
  reportActionLabels,
  reportReasonLabels,
} from "@/features/moderation/utils/content-moderation-labels";
import { cn } from "@/lib/utils";
import { formatPersianDate } from "@/lib/utils/formatters";

function AdminReportDetailPage({ reportId }: { reportId: string }) {
  const router = useRouter();
  const reportQuery = useReport(reportId);
  const mutation = useResolveReport();
  const [dialogOpen, setDialogOpen] = useState(false);
  const report = reportQuery.data?.data;
  const defaultAction =
    report?.targetType === "COMMENT" ? commentReportActions[0] : entryReportActions[0];
  const [action, setAction] = useState<ReportResolutionAction>(defaultAction);

  if (reportQuery.isLoading) return <AdminReportDetailSkeleton />;
  if (reportQuery.isError || !report) {
    return (
      <section className="flex min-h-96 items-center justify-center">
        <div className="space-y-4 text-center">
          <h1 className="text-xl font-semibold">گزارش بارگذاری نشد</h1>
          <p className="text-sm text-muted-foreground">ممکن است گزارش حذف شده یا در دسترس نباشد.</p>
          <Button variant="outline" onClick={() => void reportQuery.refetch()}>
            تلاش دوباره
          </Button>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="بررسی گزارش"
        description={`گزارش ${adminReportTargetLabels[report.targetType]} برای «${report.entry.title}»`}
        actions={
          <Link
            href="/admin/reports"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <ArrowRightIcon className="size-4" aria-hidden="true" /> بازگشت به گزارش‌ها
          </Link>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <AdminReportStatusBadge status={report.status} />
          <Badge variant="outline">{adminReportTargetLabels[report.targetType]}</Badge>
          <Badge variant="secondary">{reportReasonLabels[report.reason]}</Badge>
        </div>
        {report.status !== "RESOLVED" ? (
          <Button onClick={() => setDialogOpen(true)}>ثبت نتیجه بررسی</Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <main className="min-w-0 space-y-6">
          <Panel title="توضیح گزارش" icon={<DocumentTextIcon />}>
            <p className="whitespace-pre-wrap text-[14px] leading-8">{report.explanation}</p>
          </Panel>

          {report.entryComment ? (
            <Panel title="دیدگاه گزارش‌شده" icon={<ChatBubbleLeftRightIcon />}>
              <blockquote className="border-s-2 border-primary/30 ps-4">
                <p className="whitespace-pre-wrap text-[14px] leading-8">
                  {report.entryComment.body}
                </p>
                <footer className="mt-3 flex flex-wrap gap-3 text-[12px] text-muted-foreground">
                  <span>{report.entryComment.author.displayName}</span>
                  <time dateTime={report.entryComment.createdAt}>
                    {formatPersianDate(report.entryComment.createdAt)}
                  </time>
                </footer>
              </blockquote>
            </Panel>
          ) : (
            <Panel title="مطلب گزارش‌شده" icon={<DocumentTextIcon />}>
              <div className="space-y-3">
                <h2 className="text-[18px] font-semibold">{report.entry.title}</h2>
                <p className="text-[14px] leading-8 text-muted-foreground">
                  {report.entry.summary}
                </p>
              </div>
            </Panel>
          )}

          {report.status === "RESOLVED" ? (
            <Panel title="نتیجه بررسی" icon={<UserCircleIcon />}>
              <div className="space-y-3 text-[14px] leading-7">
                <p>
                  تصمیم:{" "}
                  <strong>
                    {report.resolutionAction
                      ? reportActionLabels[report.resolutionAction]
                      : "ثبت نشده"}
                  </strong>
                </p>
                {report.resolutionNotes ? (
                  <p className="whitespace-pre-wrap">{report.resolutionNotes}</p>
                ) : null}
                <p className="text-muted-foreground">
                  {report.reviewedBy?.displayName ?? "بررسی‌کننده نامشخص"}
                  {report.resolvedAt ? ` · ${formatPersianDate(report.resolvedAt)}` : ""}
                </p>
              </div>
            </Panel>
          ) : null}
        </main>

        <aside className="space-y-4">
          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-[15px]">اطلاعات گزارش</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 py-4">
              <MetaRow
                label="ثبت گزارش"
                value={formatPersianDate(report.createdAt)}
                icon={<CalendarDaysIcon />}
              />
              <MetaRow
                label="آخرین تغییر"
                value={formatPersianDate(report.updatedAt)}
                icon={<CalendarDaysIcon />}
              />
              <MetaRow
                label="محتوا"
                value={adminReportTargetLabels[report.targetType]}
                icon={<DocumentTextIcon />}
              />
            </CardContent>
          </Card>
          {report.entry.slug ? (
            <Link
              href={`/entries/${encodeURIComponent(report.entry.slug)}`}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              مشاهده مطلب عمومی <ArrowTopRightOnSquareIcon className="size-4" aria-hidden="true" />
            </Link>
          ) : null}
        </aside>
      </div>

      <AdminReportResolutionDialog
        open={dialogOpen}
        targetType={report.targetType}
        action={action}
        pending={mutation.isPending}
        onActionChange={setAction}
        onOpenChange={setDialogOpen}
        onConfirm={async (notes) => {
          await mutation.mutateAsync({ id: report.id, resolutionAction: action, notes });
          setDialogOpen(false);
          router.push("/admin/reports");
        }}
      />
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b py-4">
        <CardTitle className="flex items-center gap-2 text-[15px]">
          <span className="text-primary [&>svg]:size-5" aria-hidden="true">
            {icon}
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-5">{children}</CardContent>
    </Card>
  );
}

function MetaRow({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex gap-3 text-[12px]">
      <span className="mt-0.5 text-muted-foreground [&>svg]:size-4" aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-muted-foreground">{label}</span>
        <span className="mt-0.5 block font-medium">{value}</span>
      </span>
    </div>
  );
}

function AdminReportDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Skeleton className="h-52 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </div>
  );
}

export { AdminReportDetailPage };
