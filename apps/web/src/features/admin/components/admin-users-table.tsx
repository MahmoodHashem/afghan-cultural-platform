"use client";

import {
  CheckCircleIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
const adminUserColumnHelper = createColumnHelper<
  typeof adminUsersTableFeatures,
  AdminUserListItem
>();

function AdminUsersTable({
  users,
  meta,
  currentUserId,
  loading,
  onStatusAction,
  onPageChange,
}: {
  users: AdminUserListItem[];
  meta: AdminPaginationMeta;
  currentUserId?: string;
  loading: boolean;
  onStatusAction: (user: AdminUserListItem) => void;
  onPageChange: (page: number) => void;
}) {
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
          cell: ({ row }) => <AdminUserStatusBadge status={row.original.status} />,
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

  if (loading) return <AdminUsersTableSkeleton />;

  if (users.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center px-6 text-center">
        <div className="space-y-2">
          <h2 className="text-[16px] font-semibold">کاربری پیدا نشد</h2>
          <p className="text-[13px] text-muted-foreground">
            عبارت جست‌وجو یا فیلترها را تغییر دهید.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:block">
        <Table>
          <TableHeader className="bg-muted/35">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-11 px-4 text-[12px] text-muted-foreground"
                  >
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="h-18">
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-3">
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="divide-y divide-border lg:hidden">
        {users.map((user) => (
          <article key={user.id} className="space-y-3 p-4">
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
              <AdminUserStatusBadge status={user.status} />
              <AdminEmailVerificationBadge verified={user.emailVerified} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-[12px] text-muted-foreground">
              <span>{formatPersianNumber(user.counts.entries)} مطلب</span>
              <span>عضویت: {formatPersianDate(user.createdAt)}</span>
            </div>
          </article>
        ))}
      </div>

      <AdminUsersPagination meta={meta} onPageChange={onPageChange} />
    </>
  );
}

function UserIdentity({ user }: { user: AdminUserListItem }) {
  return (
    <Link
      href={`/admin/users/${user.id}`}
      className="flex min-w-52 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
  onPageChange,
}: {
  meta: AdminPaginationMeta;
  onPageChange: (page: number) => void;
}) {
  if (meta.totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-between gap-3 border-t border-border px-4 py-3"
      aria-label="صفحه‌بندی کاربران"
    >
      <p className="text-[12px] text-muted-foreground">
        صفحه {formatPersianNumber(meta.page)} از {formatPersianNumber(meta.totalPages)}
      </p>
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
