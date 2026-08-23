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
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminDistrict } from "@/features/admin/types/admin-provinces";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, AdminDistrict>();
const GRID_COLUMNS =
  "minmax(12rem,1.3fr) minmax(9rem,.8fr) minmax(6rem,.45fr) minmax(6rem,.55fr) minmax(7rem,.65fr) 7rem";

function AdminDistrictsTable({
  districts,
  meta,
  loading,
  updating,
  reorderMode,
  onEdit,
  onStatusAction,
  onMove,
  onPageChange,
}: {
  districts: AdminDistrict[];
  meta: { page: number; totalPages: number };
  loading: boolean;
  updating: boolean;
  reorderMode: boolean;
  onEdit: (district: AdminDistrict) => void;
  onStatusAction: (district: AdminDistrict) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onPageChange: (page: number) => void;
}) {
  const reducedMotion = useReducedMotion();
  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("name", {
          header: "ولسوالی",
          cell: ({ row }) => <span className="font-semibold">{row.original.name}</span>,
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
        columnHelper.accessor("isActive", {
          header: "وضعیت",
          cell: ({ row }) => <DistrictStatus active={row.original.isActive} />,
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
              <MoveActions
                index={row.index}
                lastIndex={districts.length - 1}
                disabled={updating}
                onMove={onMove}
              />
            ) : (
              <DistrictActions
                district={row.original}
                disabled={updating}
                onEdit={onEdit}
                onStatusAction={onStatusAction}
              />
            ),
        }),
      ]),
    [districts.length, onEdit, onMove, onStatusAction, reorderMode, updating],
  );
  const table = useTable({ data: districts, columns, features });

  return (
    <div className="overflow-hidden" aria-busy={loading || updating}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={loading ? "loading" : districts.length ? "results" : "empty"}
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: updating ? 0.65 : 1 }}
          exit={{ opacity: 0 }}
        >
          {loading ? <DistrictSkeleton /> : null}
          {!loading && districts.length === 0 ? (
            <div className="flex min-h-56 items-center justify-center p-6 text-center">
              <div>
                <h3 className="font-semibold">ولسوالی‌ای پیدا نشد</h3>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  فیلترها را تغییر دهید یا نخستین ولسوالی را اضافه کنید.
                </p>
              </div>
            </div>
          ) : null}
          {!loading && districts.length ? (
            <>
              <div className="hidden lg:block">
                <table className="grid w-full" aria-label="فهرست ولسوالی‌ها">
                  <thead className="grid bg-muted/35">
                    {table.getHeaderGroups().map((group) => (
                      <tr
                        key={group.id}
                        className="grid h-11 border-b"
                        style={{ gridTemplateColumns: GRID_COLUMNS }}
                      >
                        {group.headers.map((header) => (
                          <th
                            key={header.id}
                            className="flex items-center px-4 text-[12px] font-medium text-muted-foreground"
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
                          className="grid min-h-16 border-b hover:bg-muted/40"
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
              <div className="divide-y lg:hidden">
                {districts.map((district, index) => (
                  <motion.article
                    layout="position"
                    key={district.id}
                    className="flex items-center justify-between gap-3 p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold">{district.name}</p>
                      <div className="mt-2 flex gap-2 text-[12px] text-muted-foreground">
                        <DistrictStatus active={district.isActive} />
                        <span>{formatPersianNumber(district.entryCount)} مطلب</span>
                      </div>
                    </div>
                    {reorderMode ? (
                      <MoveActions
                        index={index}
                        lastIndex={districts.length - 1}
                        disabled={updating}
                        onMove={onMove}
                      />
                    ) : (
                      <DistrictActions
                        district={district}
                        disabled={updating}
                        onEdit={onEdit}
                        onStatusAction={onStatusAction}
                      />
                    )}
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

function DistrictStatus({ active }: { active: boolean }) {
  return (
    <Badge
      variant="outline"
      className={active ? "border-primary/20 bg-primary/8 text-primary" : "text-muted-foreground"}
    >
      {active ? "فعال" : "غیرفعال"}
    </Badge>
  );
}

function DistrictActions({
  district,
  disabled,
  onEdit,
  onStatusAction,
}: {
  district: AdminDistrict;
  disabled: boolean;
  onEdit: (district: AdminDistrict) => void;
  onStatusAction: (district: AdminDistrict) => void;
}) {
  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={disabled}
        onClick={() => onEdit(district)}
        aria-label={`ویرایش ${district.name}`}
      >
        <PencilSquareIcon className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={disabled}
        onClick={() => onStatusAction(district)}
        aria-label={`${district.isActive ? "غیرفعال‌کردن" : "فعال‌کردن"} ${district.name}`}
      >
        {district.isActive ? (
          <NoSymbolIcon className="size-4 text-destructive" />
        ) : (
          <CheckCircleIcon className="size-4 text-primary" />
        )}
      </Button>
    </div>
  );
}

function MoveActions({
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
        <ArrowUpIcon className="size-4" />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        disabled={disabled || index === lastIndex}
        onClick={() => onMove(index, 1)}
        aria-label="انتقال به پایین"
      >
        <ArrowDownIcon className="size-4" />
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

function DistrictSkeleton() {
  return (
    <div role="status" aria-label="در حال بارگذاری">
      {[1, 2, 3, 4].map((key) => (
        <div key={key} className="flex min-h-16 items-center gap-4 border-b p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="ms-auto h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

export { AdminDistrictsTable };
