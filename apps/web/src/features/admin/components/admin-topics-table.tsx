"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminTopic, AdminTopicsResponse } from "@/features/admin/types/admin-topics";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";

const topicTableFeatures = tableFeatures({});
const topicColumnHelper = createColumnHelper<typeof topicTableFeatures, AdminTopic>();
const TOPIC_GRID_COLUMNS =
  "minmax(13rem,1.5fr) minmax(9rem,.8fr) minmax(6rem,.45fr) minmax(6rem,.55fr) minmax(7rem,.65fr) 7rem";
const TOPIC_SKELETON_KEYS = ["topic-1", "topic-2", "topic-3", "topic-4", "topic-5", "topic-6"];

function AdminTopicsTable({
  topics,
  meta,
  loading,
  updating,
  reorderMode,
  onEdit,
  onStatusAction,
  onMove,
  onPageChange,
}: {
  topics: AdminTopic[];
  meta: AdminTopicsResponse["meta"];
  loading: boolean;
  updating: boolean;
  reorderMode: boolean;
  onEdit: (topic: AdminTopic) => void;
  onStatusAction: (topic: AdminTopic) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onPageChange: (page: number) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const columns = useMemo(
    () =>
      topicColumnHelper.columns([
        topicColumnHelper.display({
          id: "topic",
          header: "موضوع",
          cell: ({ row }) => <TopicIdentity topic={row.original} />,
        }),
        topicColumnHelper.accessor("slug", {
          header: "نشانی",
          cell: ({ row }) => (
            <span dir="ltr" className="truncate text-[12px] text-muted-foreground">
              {row.original.slug}
            </span>
          ),
        }),
        topicColumnHelper.accessor("entryCount", {
          header: "مطالب",
          cell: ({ row }) => (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-[13px]"
              render={<Link href={`/admin/entries?categoryId=${row.original.id}`} />}
            >
              {formatPersianNumber(row.original.entryCount)}
            </Button>
          ),
        }),
        topicColumnHelper.accessor("isActive", {
          header: "وضعیت",
          cell: ({ row }) => <TopicStatusBadge active={row.original.isActive} />,
        }),
        topicColumnHelper.accessor("updatedAt", {
          header: "آخرین ویرایش",
          cell: ({ row }) => (
            <span className="text-[12px] text-muted-foreground">
              {formatPersianDate(row.original.updatedAt)}
            </span>
          ),
        }),
        topicColumnHelper.display({
          id: "actions",
          header: reorderMode ? "جابه‌جایی" : "عملیات",
          cell: ({ row }) =>
            reorderMode ? (
              <ReorderActions
                index={row.index}
                lastIndex={topics.length - 1}
                disabled={updating}
                onMove={onMove}
              />
            ) : (
              <TopicRowActions
                topic={row.original}
                disabled={updating}
                onEdit={onEdit}
                onStatusAction={onStatusAction}
              />
            ),
        }),
      ]),
    [onEdit, onMove, onStatusAction, reorderMode, topics.length, updating],
  );
  const table = useTable({ data: topics, columns, features: topicTableFeatures });

  return (
    <div className="relative overflow-hidden" aria-busy={loading || updating}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={loading ? "loading" : topics.length === 0 ? "empty" : "results"}
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: updating ? 0.65 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
        >
          {loading ? <TopicsSkeleton /> : null}
          {!loading && topics.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center px-6 text-center">
              <div className="space-y-2">
                <h2 className="text-[16px] font-semibold">موضوعی پیدا نشد</h2>
                <p className="text-[13px] text-muted-foreground">
                  عبارت جست‌وجو یا فیلترها را تغییر دهید.
                </p>
              </div>
            </div>
          ) : null}

          {!loading && topics.length > 0 ? (
            <>
              <div className="hidden lg:block">
                <table
                  className="grid w-full"
                  aria-label="فهرست موضوع‌ها"
                  aria-rowcount={meta.total + 1}
                >
                  <thead className="grid bg-muted/35">
                    {table.getHeaderGroups().map((group) => (
                      <tr
                        key={group.id}
                        className="grid h-11 border-b border-border"
                        style={{ gridTemplateColumns: TOPIC_GRID_COLUMNS }}
                      >
                        {group.headers.map((header) => (
                          <th
                            key={header.id}
                            scope="col"
                            className="flex min-w-0 items-center overflow-hidden px-4 text-[12px] font-medium whitespace-nowrap text-muted-foreground"
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
                          initial={prefersReducedMotion ? false : { opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                          transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
                          className="grid min-h-20 border-b border-border transition-colors hover:bg-muted/45"
                          style={{ gridTemplateColumns: TOPIC_GRID_COLUMNS }}
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

              <div className="divide-y divide-border lg:hidden">
                <AnimatePresence initial={false} mode="popLayout">
                  {topics.map((topic, index) => (
                    <motion.article
                      layout="position"
                      key={topic.id}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <TopicIdentity topic={topic} />
                        {reorderMode ? (
                          <ReorderActions
                            index={index}
                            lastIndex={topics.length - 1}
                            disabled={updating}
                            onMove={onMove}
                          />
                        ) : (
                          <TopicRowActions
                            topic={topic}
                            disabled={updating}
                            onEdit={onEdit}
                            onStatusAction={onStatusAction}
                          />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
                        <TopicStatusBadge active={topic.isActive} />
                        <Link
                          href={`/admin/entries?categoryId=${topic.id}`}
                          className="text-primary hover:underline"
                        >
                          {formatPersianNumber(topic.entryCount)} مطلب
                        </Link>
                        <span dir="ltr">{topic.slug}</span>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
              {!reorderMode ? <TopicsPagination meta={meta} onPageChange={onPageChange} /> : null}
            </>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TopicIdentity({ topic }: { topic: AdminTopic }) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="truncate text-[14px] font-semibold text-foreground">{topic.name}</p>
      <p className="line-clamp-2 text-[12px] leading-5 text-muted-foreground">
        {topic.description || "بدون توضیح"}
      </p>
    </div>
  );
}

function TopicStatusBadge({ active }: { active: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        active ? "border-primary/20 bg-primary/8 text-primary" : "bg-muted text-muted-foreground"
      }
    >
      {active ? "فعال" : "غیرفعال"}
    </Badge>
  );
}

function TopicRowActions({
  topic,
  disabled,
  onEdit,
  onStatusAction,
}: {
  topic: AdminTopic;
  disabled: boolean;
  onEdit: (topic: AdminTopic) => void;
  onStatusAction: (topic: AdminTopic) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled}
        onClick={() => onEdit(topic)}
        aria-label={`ویرایش ${topic.name}`}
      >
        <PencilSquareIcon className="size-4" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled}
        onClick={() => onStatusAction(topic)}
        aria-label={`${topic.isActive ? "غیرفعال‌کردن" : "فعال‌کردن"} ${topic.name}`}
      >
        {topic.isActive ? (
          <NoSymbolIcon className="size-4 text-destructive" aria-hidden="true" />
        ) : (
          <CheckCircleIcon className="size-4 text-primary" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}

function ReorderActions({
  index,
  lastIndex,
  disabled,
  onMove,
}: {
  index: number;
  lastIndex: number;
  disabled: boolean;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={disabled || index === 0}
        onClick={() => onMove(index, -1)}
        aria-label="انتقال به بالا"
      >
        <ArrowUpIcon className="size-4" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={disabled || index === lastIndex}
        onClick={() => onMove(index, 1)}
        aria-label="انتقال به پایین"
      >
        <ArrowDownIcon className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

function TopicsPagination({
  meta,
  onPageChange,
}: {
  meta: AdminTopicsResponse["meta"];
  onPageChange: (page: number) => void;
}) {
  if (meta.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border p-4">
      <p className="text-[12px] text-muted-foreground">
        صفحه {formatPersianNumber(meta.page)} از {formatPersianNumber(meta.totalPages)}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          قبلی
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          بعدی
        </Button>
      </div>
    </div>
  );
}

function TopicsSkeleton() {
  return (
    <div className="space-y-0" role="status" aria-label="در حال بارگذاری موضوع‌ها">
      {TOPIC_SKELETON_KEYS.map((key) => (
        <div
          key={key}
          className="flex min-h-20 items-center gap-5 border-b border-border px-4 py-3"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-64 max-w-full" />
          </div>
          <Skeleton className="hidden h-4 w-28 sm:block" />
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="size-8" />
        </div>
      ))}
    </div>
  );
}

export { AdminTopicsTable };
