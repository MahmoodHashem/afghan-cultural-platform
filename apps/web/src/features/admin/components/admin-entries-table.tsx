"use client";

import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { ArchiveBoxIcon } from "@/components/icons/animated/archive-box";
import { ArrowPathIcon } from "@/components/icons/animated/arrow-path";
import { EyeIcon } from "@/components/icons/animated/eye";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminEntryStatusBadge } from "@/features/admin/components/admin-entry-status-badge";
import { adminGeographicScopeLabels } from "@/features/admin/constants/admin-entry-meta";
import type { AdminEntryListItem } from "@/features/admin/types/admin-entries";
import type { AdminPaginationMeta } from "@/features/admin/types/admin-users";
import { useAnimatedIcon } from "@/hooks/use-animated-icon";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";

const features = tableFeatures({});
const helper = createColumnHelper<typeof features, AdminEntryListItem>();
const COLUMNS =
  "minmax(15rem,2fr) minmax(7rem,.75fr) minmax(9rem,1fr) minmax(8rem,.85fr) minmax(8rem,.85fr) minmax(6rem,.65fr) minmax(7rem,.75fr) 4.5rem";

function AdminEntriesTable({
  entries,
  meta,
  loading,
  updating,
  pageDirection,
  onLifecycle,
  onPageChange,
}: {
  entries: AdminEntryListItem[];
  meta: AdminPaginationMeta;
  loading: boolean;
  updating: boolean;
  pageDirection: -1 | 0 | 1;
  onLifecycle: (entry: AdminEntryListItem) => void;
  onPageChange: (page: number) => void;
}) {
  const reducedMotion = useReducedMotion();
  const columns = useMemo(
    () =>
      helper.columns([
        helper.display({
          id: "entry",
          header: "مطلب",
          cell: ({ row }) => <EntryIdentity entry={row.original} />,
        }),
        helper.accessor("status", {
          header: "وضعیت",
          cell: ({ row }) => <AdminEntryStatusBadge status={row.original.status} />,
        }),
        helper.display({
          id: "author",
          header: "نویسنده",
          cell: ({ row }) => (
            <Link
              className="truncate text-[12px] hover:text-primary"
              href={`/admin/users/${row.original.author.id}`}
            >
              {row.original.author.displayName}
            </Link>
          ),
        }),
        helper.display({
          id: "category",
          header: "موضوع",
          cell: ({ row }) => (
            <span className="truncate text-[12px] text-muted-foreground">
              {row.original.category.name}
            </span>
          ),
        }),
        helper.display({
          id: "location",
          header: "محدوده",
          cell: ({ row }) => (
            <span className="truncate text-[12px] text-muted-foreground">
              {entryLocation(row.original)}
            </span>
          ),
        }),
        helper.accessor("viewCount", {
          header: "بازدید",
          cell: ({ row }) => (
            <span className="text-[12px] font-semibold">
              {formatPersianNumber(row.original.viewCount)}
            </span>
          ),
        }),
        helper.accessor("updatedAt", {
          header: "آخرین ویرایش",
          cell: ({ row }) => (
            <span className="text-[12px] text-muted-foreground">
              {formatPersianDate(row.original.updatedAt)}
            </span>
          ),
        }),
        helper.display({
          id: "actions",
          header: "",
          cell: ({ row }) => <EntryActions entry={row.original} onLifecycle={onLifecycle} />,
        }),
      ]),
    [onLifecycle],
  );
  const table = useTable({ data: entries, columns, features });

  return (
    <div className="relative overflow-hidden" aria-busy={loading || updating}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={loading ? "loading" : entries.length ? "results" : "empty"}
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: updating ? 0.62 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.16 }}
        >
          {loading ? <AdminEntriesSkeleton /> : null}
          {!loading && entries.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center p-6 text-center">
              <div className="space-y-2">
                <h2 className="text-[16px] font-semibold">مطلبی پیدا نشد</h2>
                <p className="text-[13px] text-muted-foreground">
                  عبارت جست‌وجو یا فیلترها را تغییر دهید.
                </p>
              </div>
            </div>
          ) : null}
          {!loading && entries.length ? (
            <>
              <div className="hidden lg:block">
                <table
                  className="grid w-full"
                  aria-label="فهرست مطالب"
                  aria-rowcount={meta.total + 1}
                >
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
                              : { opacity: 0, x: pageDirection * 8, y: pageDirection === 0 ? 5 : 0 }
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
                <AnimatePresence initial={false} mode="popLayout">
                  {entries.map((entry) => (
                    <motion.article
                      layout="position"
                      key={entry.id}
                      initial={reducedMotion ? false : { opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <EntryIdentity entry={entry} />
                        <EntryActions entry={entry} onLifecycle={onLifecycle} />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <AdminEntryStatusBadge status={entry.status} />
                        <span className="text-[12px] text-muted-foreground">
                          {entry.category.name}
                        </span>
                        <span className="text-[12px] text-muted-foreground">
                          {entryLocation(entry)}
                        </span>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
              <EntriesPagination meta={meta} onPageChange={onPageChange} />
            </>
          ) : null}
        </motion.div>
      </AnimatePresence>
      {updating ? (
        <div
          className="absolute inset-x-0 top-0 h-0.5 animate-pulse bg-primary"
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}

function EntryIdentity({ entry }: { entry: AdminEntryListItem }) {
  return (
    <Link
      href={`/admin/entries/${entry.id}`}
      className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
        {entry.thumbnailUrl ? (
          <Image src={entry.thumbnailUrl} alt="" fill sizes="44px" className="object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center text-[11px] text-muted-foreground">
            بدون تصویر
          </span>
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold">{entry.title}</span>
        <span className="line-clamp-1 text-[11px] text-muted-foreground">{entry.summary}</span>
      </span>
    </Link>
  );
}

function EntryActions({
  entry,
  onLifecycle,
}: {
  entry: AdminEntryListItem;
  onLifecycle: (entry: AdminEntryListItem) => void;
}) {
  const viewAnimation = useAnimatedIcon();
  const archiveAnimation = useAnimatedIcon();
  const restoreAnimation = useAnimatedIcon();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        render={<Link href={`/admin/entries/${entry.id}`} />}
        aria-label={`مشاهده ${entry.title}`}
        {...viewAnimation.triggerProps}
      >
        <EyeIcon ref={viewAnimation.iconRef} size={16} aria-hidden="true" />
      </Button>
      {entry.status === "PUBLISHED" ? (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onLifecycle(entry)}
          aria-label={`بایگانی ${entry.title}`}
          {...archiveAnimation.triggerProps}
        >
          <ArchiveBoxIcon ref={archiveAnimation.iconRef} size={16} aria-hidden="true" />
        </Button>
      ) : null}
      {entry.status === "ARCHIVED" ? (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onLifecycle(entry)}
          aria-label={`بازگردانی ${entry.title}`}
          {...restoreAnimation.triggerProps}
        >
          <ArrowPathIcon ref={restoreAnimation.iconRef} size={16} aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}

function EntriesPagination({
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
      aria-label="صفحه‌بندی مطالب"
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

function AdminEntriesSkeleton() {
  const rows = ["one", "two", "three", "four", "five", "six", "seven"];

  return (
    <div className="space-y-0">
      {rows.map((row) => (
        <div key={row} className="flex h-20 items-center gap-4 border-b px-4">
          <Skeleton className="size-11 rounded-lg" />
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

function entryLocation(entry: AdminEntryListItem) {
  return entry.geographicScope === "PROVINCE"
    ? (entry.province?.name ?? "ولایت نامشخص")
    : adminGeographicScopeLabels[entry.geographicScope];
}

export { AdminEntriesTable };
