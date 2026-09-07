"use client";

import { EyeIcon, ShieldExclamationIcon } from "@heroicons/react/24/outline";
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useMemo } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AdminEmailVerificationBadge,
  AdminUserStatusBadge,
} from "@/features/admin/components/admin-user-badges";
import type { AdminPaginationMeta, AdminUserListItem } from "@/features/admin/types/admin-users";
import { cn } from "@/lib/utils";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";
import { createUserInitials, getUserAvatarColorClass } from "@/lib/utils/user";

const tableFeaturesConfig = tableFeatures({});
const columnHelper = createColumnHelper<typeof tableFeaturesConfig, AdminUserListItem>();
const GRID_COLUMNS =
  "minmax(12rem,1.7fr) minmax(0,.7fr) minmax(0,.75fr) minmax(0,.9fr) minmax(0,.85fr) minmax(0,.85fr) 8rem";

function AdminModeratorsTable({
  moderators,
  meta,
  loading,
  updating,
  pageDirection,
  onDemote,
  onPageChange,
}: {
  moderators: AdminUserListItem[];
  meta: AdminPaginationMeta;
  loading: boolean;
  updating: boolean;
  pageDirection: -1 | 0 | 1;
  onDemote: (user: AdminUserListItem) => void;
  onPageChange: (page: number) => void;
}) {
  const reducedMotion = useReducedMotion();
  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.display({
          id: "moderator",
          header: "ناظر",
          cell: ({ row }) => <ModeratorIdentity user={row.original} />,
        }),
        columnHelper.accessor("status", {
          header: "وضعیت",
          cell: ({ row }) => <AdminUserStatusBadge status={row.original.status} />,
        }),
        columnHelper.display({
          id: "emailVerified",
          header: "ایمیل",
          cell: ({ row }) => <AdminEmailVerificationBadge verified={row.original.emailVerified} />,
        }),
        columnHelper.display({
          id: "activity",
          header: "فعالیت",
          cell: ({ row }) => (
            <span className="text-[12px] text-muted-foreground">
              {formatPersianNumber(row.original.counts.entries)} مطلب ·{" "}
              {formatPersianNumber(row.original.counts.comments)} دیدگاه ·{" "}
              {formatPersianNumber(row.original.counts.bookmarks)} ذخیره
            </span>
          ),
        }),
        columnHelper.accessor("roleChangedAt", {
          header: "تعیین نقش",
          cell: ({ row }) => <MutedDate value={row.original.roleChangedAt} />,
        }),
        columnHelper.accessor("lastLoginAt", {
          header: "آخرین ورود",
          cell: ({ row }) => <MutedDate value={row.original.lastLoginAt} />,
        }),
        columnHelper.display({
          id: "actions",
          header: "",
          cell: ({ row }) => <ModeratorActions user={row.original} onDemote={onDemote} />,
        }),
      ]),
    [onDemote],
  );
  const table = useTable({ data: moderators, columns, features: tableFeaturesConfig });

  if (loading) return <ModeratorsSkeleton />;

  if (moderators.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center px-6 text-center">
        <div className="space-y-2">
          <h2 className="text-[16px] font-semibold">ناظری پیدا نشد</h2>
          <p className="text-[13px] text-muted-foreground">
            فیلترها را تغییر دهید یا یک ناظر جدید اضافه کنید.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden" aria-busy={updating}>
      <div className="hidden lg:block">
        <table className="grid w-full" aria-label="فهرست ناظران" aria-rowcount={meta.total + 1}>
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
                  initial={reducedMotion ? false : { opacity: 0, x: pageDirection * 8, y: 4 }}
                  animate={{ opacity: updating ? 0.62 : 1, x: 0, y: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: pageDirection * -8 }}
                  transition={{ duration: reducedMotion ? 0 : 0.18 }}
                  className="grid min-h-18 border-b border-border transition-colors hover:bg-muted/50"
                  style={{ gridTemplateColumns: GRID_COLUMNS }}
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
          {moderators.map((user) => (
            <motion.article
              layout="position"
              key={user.id}
              initial={reducedMotion ? false : { opacity: 0, x: pageDirection * 10, y: 4 }}
              animate={{ opacity: updating ? 0.62 : 1, x: 0, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -8 }}
              transition={{ duration: reducedMotion ? 0 : 0.18 }}
              className="space-y-3 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <ModeratorIdentity user={user} />
                <ModeratorActions user={user} onDemote={onDemote} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <AdminUserStatusBadge status={user.status} />
                <AdminEmailVerificationBadge verified={user.emailVerified} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-[12px] text-muted-foreground">
                <span>{formatPersianNumber(user.counts.entries)} مطلب</span>
                <span>{formatPersianNumber(user.counts.comments)} دیدگاه</span>
                <span>{formatPersianNumber(user.counts.bookmarks)} ذخیره</span>
                <span>
                  تعیین نقش:{" "}
                  {user.roleChangedAt ? formatPersianDate(user.roleChangedAt) : "ثبت نشده"}
                </span>
                <span>
                  آخرین ورود: {user.lastLoginAt ? formatPersianDate(user.lastLoginAt) : "ثبت نشده"}
                </span>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      <ModeratorsPagination meta={meta} onPageChange={onPageChange} />
    </div>
  );
}

function ModeratorIdentity({ user }: { user: AdminUserListItem }) {
  return (
    <Link
      href={`/admin/users/${user.id}`}
      className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Avatar className="size-9">
        {user.profileImageUrl ? <AvatarImage src={user.profileImageUrl} alt="" /> : null}
        <AvatarFallback className={getUserAvatarColorClass(user.id)}>
          {createUserInitials(user.displayName)}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold">{user.displayName}</span>
        <span className="block max-w-52 truncate text-[11px] text-muted-foreground" dir="ltr">
          {user.email}
        </span>
      </span>
    </Link>
  );
}

function ModeratorActions({
  user,
  onDemote,
}: {
  user: AdminUserListItem;
  onDemote: (user: AdminUserListItem) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/admin/users/${user.id}`}
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        aria-label={`مشاهده جزئیات ${user.displayName}`}
      >
        <EyeIcon className="size-4" aria-hidden="true" />
      </Link>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onDemote(user)}
        aria-label={`برداشتن دسترسی ناظر ${user.displayName}`}
      >
        <ShieldExclamationIcon className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

function MutedDate({ value }: { value: string | null }) {
  return (
    <span className="text-[12px] text-muted-foreground">
      {value ? formatPersianDate(value) : "ثبت نشده"}
    </span>
  );
}

function ModeratorsPagination({
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
      aria-label="صفحه‌بندی ناظران"
    >
      <span className="text-[12px] text-muted-foreground">
        صفحه {formatPersianNumber(meta.page)} از {formatPersianNumber(meta.totalPages)}
      </span>
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
    </nav>
  );
}

function ModeratorsSkeleton() {
  return (
    <div className="space-y-1 p-4" role="status" aria-label="در حال بارگذاری ناظران">
      {["one", "two", "three", "four", "five"].map((item) => (
        <div key={item} className="flex h-16 items-center gap-3 border-b border-border/70 px-2">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="hidden h-6 w-20 sm:block" />
        </div>
      ))}
    </div>
  );
}

export { AdminModeratorsTable };
