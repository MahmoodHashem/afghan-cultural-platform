"use client";

import { CheckCircleIcon, NoSymbolIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminTag, AdminTagsResponse } from "@/features/admin/types/admin-tags";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";

const tagTableFeatures = tableFeatures({});
const tagColumnHelper = createColumnHelper<typeof tagTableFeatures, AdminTag>();
const TAG_GRID_COLUMNS =
  "minmax(11rem,1.25fr) minmax(9rem,.85fr) minmax(9rem,.85fr) minmax(5rem,.4fr) minmax(6rem,.55fr) minmax(7rem,.65fr) 6rem";
const SKELETON_KEYS = ["tag-1", "tag-2", "tag-3", "tag-4", "tag-5", "tag-6"];

function AdminTagsTable({
  tags,
  meta,
  loading,
  updating,
  onEdit,
  onStatusAction,
  onPageChange,
}: {
  tags: AdminTag[];
  meta: AdminTagsResponse["meta"];
  loading: boolean;
  updating: boolean;
  onEdit: (tag: AdminTag) => void;
  onStatusAction: (tag: AdminTag) => void;
  onPageChange: (page: number) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const columns = useMemo(
    () =>
      tagColumnHelper.columns([
        tagColumnHelper.accessor("name", {
          header: "برچسب",
          cell: ({ row }) => (
            <span className="truncate text-[14px] font-semibold">{row.original.name}</span>
          ),
        }),
        tagColumnHelper.accessor("normalizedName", {
          header: "نام یکسان‌شده",
          cell: ({ row }) => (
            <span className="truncate text-[12px] text-muted-foreground">
              {row.original.normalizedName}
            </span>
          ),
        }),
        tagColumnHelper.accessor("slug", {
          header: "نشانی",
          cell: ({ row }) => (
            <span dir="ltr" className="truncate text-[12px] text-muted-foreground">
              {row.original.slug}
            </span>
          ),
        }),
        tagColumnHelper.accessor("entryCount", {
          header: "مطالب",
          cell: ({ row }) => (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-[13px]"
              render={<Link href={`/admin/entries?tagId=${row.original.id}`} />}
            >
              {formatPersianNumber(row.original.entryCount)}
            </Button>
          ),
        }),
        tagColumnHelper.accessor("isActive", {
          header: "وضعیت",
          cell: ({ row }) => <TagStatusBadge active={row.original.isActive} />,
        }),
        tagColumnHelper.accessor("updatedAt", {
          header: "آخرین ویرایش",
          cell: ({ row }) => (
            <span className="text-[12px] text-muted-foreground">
              {formatPersianDate(row.original.updatedAt)}
            </span>
          ),
        }),
        tagColumnHelper.display({
          id: "actions",
          header: "عملیات",
          cell: ({ row }) => (
            <TagRowActions
              tag={row.original}
              disabled={updating}
              onEdit={onEdit}
              onStatusAction={onStatusAction}
            />
          ),
        }),
      ]),
    [onEdit, onStatusAction, updating],
  );
  const table = useTable({ data: tags, columns, features: tagTableFeatures });

  return (
    <div className="relative overflow-hidden" aria-busy={loading || updating}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={loading ? "loading" : tags.length === 0 ? "empty" : "results"}
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: updating ? 0.65 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
        >
          {loading ? <TagsSkeleton /> : null}
          {!loading && tags.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center px-6 text-center">
              <div className="space-y-2">
                <h2 className="text-[16px] font-semibold">برچسبی پیدا نشد</h2>
                <p className="text-[13px] text-muted-foreground">
                  عبارت جست‌وجو یا فیلترها را تغییر دهید.
                </p>
              </div>
            </div>
          ) : null}
          {!loading && tags.length > 0 ? (
            <>
              <div className="hidden lg:block">
                <table
                  className="grid w-full"
                  aria-label="فهرست برچسب‌ها"
                  aria-rowcount={meta.total + 1}
                >
                  <thead className="grid bg-muted/35">
                    {table.getHeaderGroups().map((group) => (
                      <tr
                        key={group.id}
                        className="grid h-11 border-b border-border"
                        style={{ gridTemplateColumns: TAG_GRID_COLUMNS }}
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
                          exit={{ opacity: 0, y: -4 }}
                          className="grid min-h-18 border-b border-border transition-colors hover:bg-muted/45"
                          style={{ gridTemplateColumns: TAG_GRID_COLUMNS }}
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
                  {tags.map((tag) => (
                    <motion.article
                      layout="position"
                      key={tag.id}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{tag.name}</p>
                          <p dir="ltr" className="truncate text-[12px] text-muted-foreground">
                            {tag.slug}
                          </p>
                        </div>
                        <TagRowActions
                          tag={tag}
                          disabled={updating}
                          onEdit={onEdit}
                          onStatusAction={onStatusAction}
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
                        <TagStatusBadge active={tag.isActive} />
                        <Link
                          href={`/admin/entries?tagId=${tag.id}`}
                          className="text-primary hover:underline"
                        >
                          {formatPersianNumber(tag.entryCount)} مطلب
                        </Link>
                        <span>{tag.normalizedName}</span>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
              <TagsPagination meta={meta} onPageChange={onPageChange} />
            </>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TagStatusBadge({ active }: { active: boolean }) {
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
function TagRowActions({
  tag,
  disabled,
  onEdit,
  onStatusAction,
}: {
  tag: AdminTag;
  disabled: boolean;
  onEdit: (tag: AdminTag) => void;
  onStatusAction: (tag: AdminTag) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled}
        onClick={() => onEdit(tag)}
        aria-label={`ویرایش ${tag.name}`}
      >
        <PencilSquareIcon className="size-4" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled}
        onClick={() => onStatusAction(tag)}
        aria-label={`${tag.isActive ? "غیرفعال‌کردن" : "فعال‌کردن"} ${tag.name}`}
      >
        {tag.isActive ? (
          <NoSymbolIcon className="size-4 text-destructive" aria-hidden="true" />
        ) : (
          <CheckCircleIcon className="size-4 text-primary" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}
function TagsPagination({
  meta,
  onPageChange,
}: {
  meta: AdminTagsResponse["meta"];
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
function TagsSkeleton() {
  return (
    <div role="status" aria-label="در حال بارگذاری برچسب‌ها">
      {SKELETON_KEYS.map((key) => (
        <div
          key={key}
          className="flex min-h-18 items-center gap-5 border-b border-border px-4 py-3"
        >
          <Skeleton className="h-4 w-32" />
          <Skeleton className="hidden h-4 w-28 sm:block" />
          <Skeleton className="ms-auto h-6 w-14 rounded-full" />
          <Skeleton className="size-8" />
        </div>
      ))}
    </div>
  );
}

export { AdminTagsTable };
