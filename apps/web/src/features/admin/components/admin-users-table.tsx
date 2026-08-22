"use client";

import {
  CheckCircleIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useMemo } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AdminEmailVerificationBadge,
  AdminUserRoleBadge,
  AdminUserStatusBadge,
} from "@/features/admin/components/admin-user-badges";
import { adminAuthMethodLabels } from "@/features/admin/constants/admin-user-meta";
import type { AdminPaginationMeta, AdminUserListItem } from "@/features/admin/types/admin-users";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";
import { createUserInitials } from "@/lib/utils/user";

const adminUsersTableFeatures = tableFeatures({});
const ADMIN_USERS_GRID_COLUMNS =
  "minmax(10rem,1.8fr) minmax(0,.65fr) minmax(0,.75fr) minmax(0,.75fr) minmax(0,.85fr) minmax(0,.4fr) minmax(0,.9fr) minmax(0,.9fr) 2.75rem";
const adminUserColumnHelper = createColumnHelper<
  typeof adminUsersTableFeatures,
  AdminUserListItem
>();

function AdminUsersTable({
  users,
  meta,
  currentUserId,
  loading,
  updating,
  pageDirection,
  onStatusAction,
  onPageChange,
}: {
  users: AdminUserListItem[];
  meta: AdminPaginationMeta;
  currentUserId?: string;
  loading: boolean;
  updating: boolean;
  pageDirection: -1 | 0 | 1;
  onStatusAction: (user: AdminUserListItem) => void;
  onPageChange: (page: number) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const columns = useMemo(
    () =>
      adminUserColumnHelper.columns([
        adminUserColumnHelper.display({
          id: "user",
          header: "کاربر",
          cell: ({ row }) => <UserIdentity user={row.original} />,
        }),
        adminUserColumnHelper.accessor("role", {
          header: "نقش",
          cell: ({ row }) => <AdminUserRoleBadge role={row.original.role} />,
        }),
        adminUserColumnHelper.accessor("status", {
          header: "وضعیت",
          cell: ({ row }) => <AnimatedUserStatusBadge status={row.original.status} />,
        }),
        adminUserColumnHelper.display({
          id: "verification",
          header: "ایمیل",
          cell: ({ row }) => <AdminEmailVerificationBadge verified={row.original.emailVerified} />,
        }),
        adminUserColumnHelper.display({
          id: "authMethods",
          header: "روش ورود",
          cell: ({ row }) => (
            <span className="text-[12px] text-muted-foreground">
              {row.original.authMethods.map((method) => adminAuthMethodLabels[method]).join("، ") ||
                "نامشخص"}
            </span>
          ),
        }),
        adminUserColumnHelper.display({
          id: "entries",
          header: "مطالب",
          cell: ({ row }) => (
            <span className="font-semibold text-foreground">
              {formatPersianNumber(row.original.counts.entries)}
            </span>
          ),
        }),
        adminUserColumnHelper.accessor("lastLoginAt", {
          header: "آخرین ورود",
          cell: ({ row }) => (
            <span className="text-[12px] text-muted-foreground">
              {row.original.lastLoginAt ? formatPersianDate(row.original.lastLoginAt) : "ثبت نشده"}
            </span>
          ),
        }),
        adminUserColumnHelper.accessor("createdAt", {
          header: "عضویت",
          cell: ({ row }) => (
            <span className="text-[12px] text-muted-foreground">
              {formatPersianDate(row.original.createdAt)}
            </span>
          ),
        }),
        adminUserColumnHelper.display({
          id: "actions",
          header: "",
          cell: ({ row }) => (
            <AdminUserRowActions
              user={row.original}
              isCurrentUser={row.original.id === currentUserId}
              onStatusAction={onStatusAction}
            />
          ),
        }),
      ]),
    [currentUserId, onStatusAction],
  );
  const table = useTable({
    data: users,
    columns,
    features: adminUsersTableFeatures,
  });

  return (
    <div className="relative overflow-hidden" aria-busy={loading || updating}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={loading ? "loading" : users.length === 0 ? "empty" : "results"}
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: updating ? 0.62 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
        >
          {loading ? <AdminUsersTableSkeleton /> : null}

          {!loading && users.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center px-6 text-center">
              <div className="space-y-2">
                <h2 className="text-[16px] font-semibold">کاربری پیدا نشد</h2>
                <p className="text-[13px] text-muted-foreground">
                  عبارت جست‌وجو یا فیلترها را تغییر دهید.
                </p>
              </div>
            </div>
          ) : null}

          {!loading && users.length > 0 ? (
            <>
              <div className="hidden lg:block">
                <table
                  className="grid w-full"
                  aria-label="فهرست کاربران"
                  aria-rowcount={meta.total + 1}
                >
                  <thead className="grid bg-muted/35">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr
                        key={headerGroup.id}
                        className="grid h-11 border-b border-border"
                        style={{ gridTemplateColumns: ADMIN_USERS_GRID_COLUMNS }}
                      >
                        {headerGroup.headers.map((header) => (
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
                          initial={
                            prefersReducedMotion
                              ? false
                              : {
                                  opacity: 0,
                                  x: pageDirection * 8,
                                  y: pageDirection === 0 ? 5 : 0,
                                }
                          }
                          animate={{ opacity: 1, x: 0, y: 0 }}
                          exit={
                            prefersReducedMotion
                              ? { opacity: 0 }
                              : { opacity: 0, x: pageDirection * -8 }
                          }
                          transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
                          className="grid h-18 border-b border-border transition-colors hover:bg-muted/50"
                          style={{ gridTemplateColumns: ADMIN_USERS_GRID_COLUMNS }}
                        >
                          {row.getAllCells().map((cell) => (
                            <td
                              key={cell.id}
                              className="flex min-w-0 items-center overflow-hidden px-4 py-3 whitespace-nowrap"
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
                  {users.map((user) => (
                    <motion.article
                      layout="position"
                      key={user.id}
                      initial={
                        prefersReducedMotion
                          ? false
                          : { opacity: 0, x: pageDirection * 10, y: pageDirection === 0 ? 5 : 0 }
                      }
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -8 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
                      className="space-y-3 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <UserIdentity user={user} />
                        <AdminUserRowActions
                          user={user}
                          isCurrentUser={user.id === currentUserId}
                          onStatusAction={onStatusAction}
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <AdminUserRoleBadge role={user.role} />
                        <AnimatedUserStatusBadge status={user.status} />
                        <AdminEmailVerificationBadge verified={user.emailVerified} />
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-[12px] text-muted-foreground">
                        <span>{formatPersianNumber(user.counts.entries)} مطلب</span>
                        <span>عضویت: {formatPersianDate(user.createdAt)}</span>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>

              <AdminUsersPagination
                meta={meta}
                pageDirection={pageDirection}
                onPageChange={onPageChange}
              />
            </>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {updating ? (
          <motion.div
            className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-primary/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          >
            <motion.span
              className="block h-full bg-primary"
              initial={{ scaleX: 0.12 }}
              animate={
                prefersReducedMotion
                  ? { scaleX: 1 }
                  : { scaleX: [0.12, 0.72, 0.12], x: ["40%", "-40%", "40%"] }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 1.15, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
              }
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function AnimatedUserStatusBadge({ status }: { status: AdminUserListItem["status"] }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <span className="grid w-fit overflow-hidden">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={status}
          className="col-start-1 row-start-1"
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.92, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: -4 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
        >
          <AdminUserStatusBadge status={status} />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function UserIdentity({ user }: { user: AdminUserListItem }) {
  return (
    <Link
      href={`/admin/users/${user.id}`}
      className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Avatar className="size-9">
        {user.profileImageUrl ? <AvatarImage src={user.profileImageUrl} alt="" /> : null}
        <AvatarFallback className="bg-primary/10 text-primary">
          {createUserInitials(user.displayName)}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold text-foreground">
          {user.displayName}
        </span>
        <span className="block max-w-52 truncate text-[11px] text-muted-foreground" dir="ltr">
          {user.email}
        </span>
      </span>
    </Link>
  );
}

function AdminUserRowActions({
  user,
  isCurrentUser,
  onStatusAction,
}: {
  user: AdminUserListItem;
  isCurrentUser: boolean;
  onStatusAction: (user: AdminUserListItem) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`اقدام‌های ${user.displayName}`}
          />
        }
      >
        <EllipsisVerticalIcon className="size-5" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href={`/admin/users/${user.id}`} />}>
            <EyeIcon className="size-4" aria-hidden="true" />
            مشاهده جزئیات
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isCurrentUser} onClick={() => onStatusAction(user)}>
            {user.status === "ACTIVE" ? (
              <NoSymbolIcon className="size-4" aria-hidden="true" />
            ) : (
              <CheckCircleIcon className="size-4" aria-hidden="true" />
            )}
            {user.status === "ACTIVE" ? "تعلیق حساب" : "فعال‌سازی حساب"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AdminUsersPagination({
  meta,
  pageDirection,
  onPageChange,
}: {
  meta: AdminPaginationMeta;
  pageDirection: -1 | 0 | 1;
  onPageChange: (page: number) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  if (meta.totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-between gap-3 border-t border-border px-4 py-3"
      aria-label="صفحه‌بندی کاربران"
    >
      <div className="grid overflow-hidden text-[12px] text-muted-foreground">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.p
            key={meta.page}
            className="col-start-1 row-start-1"
            initial={prefersReducedMotion ? false : { opacity: 0, x: pageDirection * 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: pageDirection * -8 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
          >
            صفحه {formatPersianNumber(meta.page)} از {formatPersianNumber(meta.totalPages)}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          قبلی
        </Button>
        <Button
          type="button"
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

function AdminUsersTableSkeleton() {
  const rows = ["one", "two", "three", "four", "five", "six"];
  return (
    <div className="space-y-1 p-4" role="status" aria-label="در حال بارگذاری کاربران">
      {rows.map((row) => (
        <div key={row} className="flex h-16 items-center gap-3 border-b border-border/70 px-2">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="hidden h-6 w-20 sm:block" />
          <Skeleton className="hidden h-6 w-24 md:block" />
        </div>
      ))}
    </div>
  );
}

export { AdminUsersTable };
