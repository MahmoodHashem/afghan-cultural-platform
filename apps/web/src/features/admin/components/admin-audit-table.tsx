"use client";

import { EyeIcon } from "@heroicons/react/24/outline";
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useMemo } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminAuditActionMeta } from "@/features/admin/mappers/admin-overview-mapper";
import type { AdminAuditItem, AdminAuditPerson } from "@/features/admin/types/admin-audit";
import type { AdminPaginationMeta } from "@/features/admin/types/admin-users";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";
import { createUserInitials, getUserAvatarColorClass } from "@/lib/utils/user";

const features = tableFeatures({});
const helper = createColumnHelper<typeof features, AdminAuditItem>();
const COLUMNS =
  "minmax(10rem,1fr) minmax(10rem,1fr) minmax(13rem,1.5fr) minmax(12rem,1.3fr) minmax(8rem,.8fr) 4rem";

function AdminAuditTable({
  items,
  meta,
  loading,
  updating,
  pageDirection,
  onInspect,
  onPageChange,
}: {
  items: AdminAuditItem[];
  meta: AdminPaginationMeta;
  loading: boolean;
  updating: boolean;
  pageDirection: -1 | 0 | 1;
  onInspect: (item: AdminAuditItem) => void;
  onPageChange: (page: number) => void;
}) {
  const reducedMotion = useReducedMotion();
  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor("action", {
          header: "فعالیت",
          cell: ({ row }) => <ActionBadge action={row.original.action} />,
        }),
        helper.display({
          id: "actor",
          header: "انجام‌دهنده",
          cell: ({ row }) => <Person person={row.original.actor} />,
        }),
        helper.display({
          id: "context",
          header: "زمینه",
          cell: ({ row }) => <AuditContext item={row.original} />,
        }),
        helper.display({
          id: "target",
          header: "کاربر مرتبط",
          cell: ({ row }) => <TargetUser person={row.original.targetUser} />,
        }),
        helper.accessor("createdAt", {
          header: "زمان",
          cell: ({ row }) => (
            <span className="text-[12px] text-muted-foreground">
              {formatPersianDate(row.original.createdAt)}
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
              onClick={() => onInspect(row.original)}
              aria-label="مشاهده جزئیات فعالیت"
            >
              <EyeIcon className="size-4" aria-hidden />
            </Button>
          ),
        }),
      ]),
    [onInspect],
  );
  const table = useTable({ data: items, columns, features });

  return (
    <div className="relative overflow-hidden" aria-busy={loading || updating}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={loading ? "loading" : items.length ? "results" : "empty"}
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: updating ? 0.62 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.16 }}
        >
          {loading ? <AuditSkeleton /> : null}
          {!loading && items.length === 0 ? <AuditEmpty /> : null}
          {!loading && items.length ? (
            <>
              <div className="hidden lg:block">
                <table className="grid w-full" aria-label="تاریخچه فعالیت‌های مدیریتی">
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
                {items.map((item) => (
                  <article key={item.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <ActionBadge action={item.action} />
                        <AuditContext item={item} />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onInspect(item)}
                        aria-label="مشاهده جزئیات فعالیت"
                      >
                        <EyeIcon className="size-4" aria-hidden />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-[12px] text-muted-foreground">
                      <Person person={item.actor} />
                      <time dateTime={item.createdAt}>{formatPersianDate(item.createdAt)}</time>
                    </div>
                  </article>
                ))}
              </div>
              <AuditPagination meta={meta} onPageChange={onPageChange} />
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

function ActionBadge({ action }: { action: AdminAuditItem["action"] }) {
  const meta = getAdminAuditActionMeta(action);
  const tones = {
    blue: "text-blue-700",
    green: "text-primary",
    orange: "text-amber-700",
    red: "text-destructive",
    neutral: "text-muted-foreground",
  };
  return (
    <Badge variant="outline" className={tones[meta.tone]}>
      {meta.label}
    </Badge>
  );
}

function Person({ person }: { person: AdminAuditPerson | null }) {
  if (!person) return <span className="text-[12px] text-muted-foreground">سیستم</span>;
  return (
    <Link
      href={`/admin/users/${person.id}`}
      className="flex min-w-0 items-center gap-2 hover:text-primary"
    >
      <Avatar className="size-7">
        {person.profileImageUrl ? <AvatarImage src={person.profileImageUrl} alt="" /> : null}
        <AvatarFallback className={getUserAvatarColorClass(person.id)}>
          {createUserInitials(person.displayName)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate text-[12px]">{person.displayName}</span>
    </Link>
  );
}

function TargetUser({ person }: { person: AdminAuditPerson | null }) {
  return person ? (
    <Person person={person} />
  ) : (
    <span className="text-[12px] text-muted-foreground">-</span>
  );
}

function AuditContext({ item }: { item: AdminAuditItem }) {
  if (item.entry)
    return (
      <Link
        href={`/admin/entries/${item.entry.id}`}
        className="line-clamp-2 text-[12px] hover:text-primary"
      >
        {item.entry.title}
      </Link>
    );
  if (item.targetUser)
    return <span className="line-clamp-1 text-[12px]">{item.targetUser.displayName}</span>;
  if (item.report)
    return (
      <span className="font-mono text-[11px] text-muted-foreground" dir="ltr">
        {item.report.id}
      </span>
    );
  return <span className="text-[12px] text-muted-foreground">رویداد سیستمی</span>;
}

function AuditPagination({
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
      aria-label="صفحه‌بندی تاریخچه"
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

function AuditEmpty() {
  return (
    <div className="flex min-h-64 items-center justify-center p-6 text-center">
      <div className="space-y-2">
        <h2 className="text-[16px] font-semibold">فعالیتی پیدا نشد</h2>
        <p className="text-[13px] text-muted-foreground">فیلترها را تغییر دهید.</p>
      </div>
    </div>
  );
}

function AuditSkeleton() {
  return (
    <div>
      {["one", "two", "three", "four", "five", "six"].map((key) => (
        <div key={key} className="flex h-20 items-center gap-4 border-b px-4">
          <Skeleton className="size-8 rounded-full" />
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

export { AdminAuditTable };
