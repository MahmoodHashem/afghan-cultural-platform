"use client";

import { ArrowLeftIcon, EyeIcon } from "@heroicons/react/24/outline";
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminReportStatusBadge } from "@/features/admin/components/admin-report-status-badge";
import { adminReportTargetLabels } from "@/features/admin/constants/admin-report-meta";
import type { AdminPaginationMeta } from "@/features/admin/types/admin-users";
import type { ContentReport } from "@/features/moderation/types/content-moderation";
import { reportReasonLabels } from "@/features/moderation/utils/content-moderation-labels";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";

const features = tableFeatures({});
const helper = createColumnHelper<typeof features, ContentReport>();
const COLUMNS =
  "minmax(15rem,2fr) minmax(7rem,.65fr) minmax(10rem,1fr) minmax(7rem,.7fr) minmax(8rem,.8fr) minmax(8rem,.8fr) 4rem";

function AdminReportsTable({
  reports,
  meta,
  loading,
  updating,
  pageDirection,
  onPageChange,
}: {
  reports: ContentReport[];
  meta: AdminPaginationMeta;
  loading: boolean;
  updating: boolean;
  pageDirection: -1 | 0 | 1;
  onPageChange: (page: number) => void;
}) {
  const reducedMotion = useReducedMotion();
  const columns = useMemo(
    () =>
      helper.columns([
        helper.display({
          id: "content",
          header: "محتوای گزارش‌شده",
          cell: ({ row }) => <ReportIdentity report={row.original} />,
        }),
        helper.accessor("targetType", {
          header: "نوع",
          cell: ({ row }) => (
            <Badge variant="outline">{adminReportTargetLabels[row.original.targetType]}</Badge>
          ),
        }),
        helper.accessor("reason", {
          header: "دلیل",
          cell: ({ row }) => (
            <span className="line-clamp-2 text-[12px] text-muted-foreground">
              {reportReasonLabels[row.original.reason]}
            </span>
          ),
        }),
        helper.accessor("status", {
          header: "وضعیت",
          cell: ({ row }) => <AdminReportStatusBadge status={row.original.status} />,
        }),
        helper.accessor("createdAt", {
          header: "زمان گزارش",
          cell: ({ row }) => (
            <span className="text-[12px] text-muted-foreground">
              {formatPersianDate(row.original.createdAt)}
            </span>
          ),
        }),
        helper.display({
          id: "reviewer",
          header: "بررسی‌کننده",
          cell: ({ row }) => (
            <span className="truncate text-[12px] text-muted-foreground">
              {row.original.reviewedBy?.displayName ?? "هنوز بررسی نشده"}
            </span>
          ),
        }),
        helper.display({
          id: "actions",
          header: "",
          cell: ({ row }) => (
            <Button
              variant="ghost"
              size="icon-sm"
              render={<Link href={`/admin/reports/${row.original.id}`} />}
              aria-label={`بررسی گزارش ${row.original.entry.title}`}
            >
              <EyeIcon className="size-4" aria-hidden="true" />
            </Button>
          ),
        }),
      ]),
    [],
  );
  const table = useTable({ data: reports, columns, features });

  return (
    <div className="relative overflow-hidden" aria-busy={loading || updating}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={loading ? "loading" : reports.length ? "results" : "empty"}
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: updating ? 0.62 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.16 }}
        >
          {loading ? <ReportsSkeleton /> : null}
          {!loading && reports.length === 0 ? <ReportsEmpty /> : null}
          {!loading && reports.length ? (
            <>
              <div className="hidden lg:block">
                <table className="grid w-full" aria-label="فهرست گزارش‌ها">
                  <thead className="grid bg-muted/35">
                    {table.getHeaderGroups().map((group) => (
                      <tr
                        key={group.id}
                        className="grid h-11 border-b"
                        style={{ gridTemplateColumns: COLUMNS }}
                      >
                        {group.headers.map((header) => (
                          <th
                            key={header.id}
                            className="flex min-w-0 items-center overflow-hidden px-4 text-start text-[12px] font-medium whitespace-nowrap text-muted-foreground"
                          >
                            {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="grid overflow-hidden">
                    <AnimatePresence initial={false} mode="popLayout">
                      {table.getRowModel().rows.map((row) => (
                        <motion.tr
                          layout="position"
                          key={row.original.id}
                          initial={
                            reducedMotion
                              ? false
                              : { opacity: 0, x: pageDirection * 8, y: pageDirection ? 0 : 5 }
                          }
                          animate={{ opacity: 1, x: 0, y: 0 }}
                          exit={{ opacity: 0, x: reducedMotion ? 0 : pageDirection * -8 }}
                          transition={{ duration: reducedMotion ? 0 : 0.18 }}
                          className="grid min-h-20 border-b transition-colors hover:bg-muted/40"
                          style={{ gridTemplateColumns: COLUMNS }}
                        >
                          {row.getAllCells().map((cell) => (
                            <td
                              key={cell.id}
                              className="flex min-w-0 items-center overflow-hidden px-4 py-3"
                            >
                              <table.FlexRender cell={cell} />
                            </td>
                          ))}
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              <div className="divide-y lg:hidden">
                {reports.map((report) => (
                  <article key={report.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <ReportIdentity report={report} />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        render={<Link href={`/admin/reports/${report.id}`} />}
                        aria-label={`بررسی گزارش ${report.entry.title}`}
                      >
                        <ArrowLeftIcon className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminReportStatusBadge status={report.status} />
                      <Badge variant="outline">{adminReportTargetLabels[report.targetType]}</Badge>
                      <span className="text-[12px] text-muted-foreground">
                        {reportReasonLabels[report.reason]}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
              <ReportsPagination meta={meta} onPageChange={onPageChange} />
            </>
          ) : null}
        </motion.div>
      </AnimatePresence>
      {updating ? (
        <div className="absolute inset-x-0 top-0 h-0.5 animate-pulse bg-primary" aria-hidden />
      ) : null}
    </div>
  );
}

function ReportIdentity({ report }: { report: ContentReport }) {
  return (
    <Link
      href={`/admin/reports/${report.id}`}
      className="min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="block truncate text-[13px] font-semibold">{report.entry.title}</span>
      <span className="line-clamp-1 text-[11px] text-muted-foreground">
        {report.targetType === "COMMENT" && report.entryComment
          ? report.entryComment.body
          : report.explanation}
      </span>
    </Link>
  );
}

function ReportsPagination({
  meta,
  onPageChange,
}: {
  meta: AdminPaginationMeta;
  onPageChange: (page: number) => void;
}) {
  if (meta.totalPages <= 1) return null;
  return (
    <nav
      className="flex items-center justify-between border-t px-4 py-3"
      aria-label="صفحه‌بندی گزارش‌ها"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={meta.page <= 1}
        onClick={() => onPageChange(meta.page - 1)}
      >
        قبلی
      </Button>
      <span className="text-[12px] text-muted-foreground">
        صفحه {formatPersianNumber(meta.page)} از {formatPersianNumber(meta.totalPages)}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={meta.page >= meta.totalPages}
        onClick={() => onPageChange(meta.page + 1)}
      >
        بعدی
      </Button>
    </nav>
  );
}

function ReportsEmpty() {
  return (
    <div className="flex min-h-64 items-center justify-center p-6 text-center">
      <div className="space-y-2">
        <h2 className="text-[16px] font-semibold">گزارشی پیدا نشد</h2>
        <p className="text-[13px] text-muted-foreground">
          فیلترها را تغییر دهید یا بعداً دوباره بررسی کنید.
        </p>
      </div>
    </div>
  );
}

function ReportsSkeleton() {
  return (
    <div>
      {["one", "two", "three", "four", "five", "six"].map((key) => (
        <div key={key} className="flex h-20 items-center gap-4 border-b px-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-2.5 w-2/3" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export { AdminReportsTable };
