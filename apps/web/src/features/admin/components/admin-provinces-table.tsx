"use client";

import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminProvince } from "@/features/admin/types/admin-provinces";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, AdminProvince>();
const GRID_COLUMNS =
  "minmax(14rem,1.5fr) minmax(8rem,.7fr) minmax(6rem,.45fr) minmax(6rem,.45fr) minmax(6rem,.55fr) minmax(7rem,.65fr) 7rem";
const SKELETON_KEYS = ["p1", "p2", "p3", "p4", "p5", "p6"];

function AdminProvincesTable({
  provinces,
  meta,
  loading,
  updating,
  reorderMode,
  onStatusAction,
  onMove,
  onPageChange,
}: {
  provinces: AdminProvince[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  loading: boolean;
  updating: boolean;
  reorderMode: boolean;
  onStatusAction: (province: AdminProvince) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onPageChange: (page: number) => void;
}) {
  const reducedMotion = useReducedMotion();
  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.display({
          id: "province",
          header: "ولایت",
          cell: ({ row }) => <ProvinceIdentity province={row.original} />,
        }),
        columnHelper.accessor("slug", {
          header: "نشانی",
          cell: ({ row }) => (
            <span dir="ltr" className="truncate text-[12px] text-muted-foreground">
              {row.original.slug}
            </span>
          ),
        }),
        columnHelper.accessor("entryCount", {
          header: "مطالب",
          cell: ({ row }) => formatPersianNumber(row.original.entryCount),
        }),
        columnHelper.accessor("districtCount", {
          header: "ولسوالی‌ها",
          cell: ({ row }) => formatPersianNumber(row.original.districtCount),
        }),
        columnHelper.accessor("isActive", {
          header: "وضعیت",
          cell: ({ row }) => <StatusBadge active={row.original.isActive} />,
        }),
        columnHelper.accessor("updatedAt", {
          header: "آخرین ویرایش",
          cell: ({ row }) => (
            <span className="text-[12px] text-muted-foreground">
              {formatPersianDate(row.original.updatedAt)}
            </span>
          ),
        }),
        columnHelper.display({
          id: "actions",
          header: reorderMode ? "جابه‌جایی" : "عملیات",
          cell: ({ row }) =>
            reorderMode ? (
              <ReorderActions
                index={row.index}
                lastIndex={provinces.length - 1}
                disabled={updating}
                onMove={onMove}
              />
            ) : (
              <RowActions
                province={row.original}
                disabled={updating}
                onStatusAction={onStatusAction}
              />
            ),
        }),
      ]),
    [onMove, onStatusAction, provinces.length, reorderMode, updating],
  );
  const table = useTable({ data: provinces, columns, features });

  return (
    <div className="relative overflow-hidden" aria-busy={loading || updating}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={loading ? "loading" : provinces.length === 0 ? "empty" : "results"}
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: updating ? 0.65 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.16 }}
        >
          {loading ? <TableSkeleton /> : null}
          {!loading && provinces.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center px-6 text-center">
              <div className="space-y-2">
                <h2 className="text-[16px] font-semibold">ولایتی پیدا نشد</h2>
                <p className="text-[13px] text-muted-foreground">
                  عبارت جست‌وجو یا فیلترها را تغییر دهید.
                </p>
              </div>
            </div>
          ) : null}

          {!loading && provinces.length > 0 ? (
            <>
              <div className="hidden xl:block">
                <table className="grid w-full" aria-label="فهرست ولایت‌ها">
                  <thead className="grid bg-muted/35">
                    {table.getHeaderGroups().map((group) => (
                      <tr
                        key={group.id}
                        className="grid h-11 border-b border-border"
                        style={{ gridTemplateColumns: GRID_COLUMNS }}
                      >
                        {group.headers.map((header) => (
                          <th
                            key={header.id}
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
                          initial={reducedMotion ? false : { opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="grid min-h-20 border-b border-border transition-colors hover:bg-muted/45"
                          style={{ gridTemplateColumns: GRID_COLUMNS }}
                        >
                          {row.getAllCells().map((cell) => (
                            <td
                              key={cell.id}
                              className="flex min-w-0 items-center overflow-hidden px-4 py-3 text-[13px]"
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

              <div className="divide-y divide-border xl:hidden">
                {provinces.map((province, index) => (
                  <motion.article layout="position" key={province.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <ProvinceIdentity province={province} />
                      {reorderMode ? (
                        <ReorderActions
                          index={index}
                          lastIndex={provinces.length - 1}
                          disabled={updating}
                          onMove={onMove}
                        />
                      ) : (
                        <RowActions
                          province={province}
                          disabled={updating}
                          onStatusAction={onStatusAction}
                        />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-[12px] text-muted-foreground">
                      <StatusBadge active={province.isActive} />
                      <span>{formatPersianNumber(province.entryCount)} مطلب</span>
                      <span>{formatPersianNumber(province.districtCount)} ولسوالی</span>
                    </div>
                  </motion.article>
                ))}
              </div>
              <Pagination meta={meta} onPageChange={onPageChange} />
            </>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ProvinceIdentity({ province }: { province: AdminProvince }) {
  return (
    <div className="min-w-0 space-y-1">
      <Link
        href={`/admin/provinces/${province.id}`}
        className="truncate text-[14px] font-semibold text-foreground hover:text-primary"
      >
        {province.name}
      </Link>
      <p className="line-clamp-2 text-[12px] leading-5 text-muted-foreground">
        {province.description || "هنوز توضیحی برای این ولایت ثبت نشده است."}
      </p>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge
      variant="outline"
      className={active ? "border-primary/20 bg-primary/8 text-primary" : "text-muted-foreground"}
    >
      {active ? "فعال" : "غیرفعال"}
    </Badge>
  );
}

function RowActions({
  province,
  disabled,
  onStatusAction,
}: {
  province: AdminProvince;
  disabled: boolean;
  onStatusAction: (province: AdminProvince) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        render={<Link href={`/admin/provinces/${province.id}`} />}
        aria-label={`بازکردن ${province.name}`}
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled}
        onClick={() => onStatusAction(province)}
        aria-label={`${province.isActive ? "غیرفعال‌کردن" : "فعال‌کردن"} ${province.name}`}
      >
        {province.isActive ? (
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
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="icon-sm"
        disabled={disabled || index === 0}
        onClick={() => onMove(index, -1)}
        aria-label="انتقال به بالا"
      >
        <ArrowUpIcon className="size-4" aria-hidden="true" />
      </Button>
      <Button
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

function Pagination({
  meta,
  onPageChange,
}: {
  meta: { page: number; totalPages: number };
  onPageChange: (page: number) => void;
}) {
  if (meta.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t p-4">
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

function TableSkeleton() {
  return (
    <div role="status" aria-label="در حال بارگذاری">
      {SKELETON_KEYS.map((key) => (
        <div key={key} className="flex min-h-20 items-center gap-5 border-b px-4 py-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-64 max-w-full" />
          </div>
          <Skeleton className="h-5 w-16" />
          <Skeleton className="size-8" />
        </div>
      ))}
    </div>
  );
}

export { AdminProvincesTable };
