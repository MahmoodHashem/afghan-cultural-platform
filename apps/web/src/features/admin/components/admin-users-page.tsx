"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminUserStatusDialog } from "@/features/admin/components/admin-user-action-dialogs";
import { AdminUsersTable } from "@/features/admin/components/admin-users-table";
import { AdminUsersToolbar } from "@/features/admin/components/admin-users-toolbar";
import { useAdminUsers, useUpdateAdminUserStatus } from "@/features/admin/hooks/use-admin-users";
import type { AdminUserListItem, AdminUsersQuery } from "@/features/admin/types/admin-users";
import { createAdminUsersHref, parseAdminUsersQuery } from "@/features/admin/utils/admin-users-url";
import { useAuthStore } from "@/stores/auth-store";

const EMPTY_META = { page: 1, limit: 20, total: 0, totalPages: 0 };

function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = parseAdminUsersQuery(searchParams);
  const usersQuery = useAdminUsers(query);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);
  const statusMutation = useUpdateAdminUserStatus(selectedUser?.id ?? "");
  const [isNavigating, startTransition] = useTransition();

  const updateQuery = useCallback(
    (updates: Partial<AdminUsersQuery>) => {
      startTransition(() => {
        router.replace(createAdminUsersHref(searchParams, { page: 1, ...updates }), {
          scroll: false,
        });
      });
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="کاربران"
        description="جست‌وجوی حساب‌ها، بررسی فعالیت و مدیریت وضعیت دسترسی کاربران"
      />

      <Card className="gap-0 overflow-hidden rounded-xl py-0">
        <AdminUsersToolbar
          query={query}
          total={usersQuery.data?.meta.total ?? 0}
          pending={isNavigating || usersQuery.isFetching}
          onChange={updateQuery}
          onClear={() => startTransition(() => router.replace("/admin/users", { scroll: false }))}
        />

        {usersQuery.isError ? (
          <section
            className="flex min-h-72 flex-col items-center justify-center gap-4 px-6 text-center"
            role="alert"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ExclamationTriangleIcon className="size-5" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <h2 className="text-[16px] font-semibold">فهرست کاربران بارگذاری نشد</h2>
              <p className="text-[13px] text-muted-foreground">
                ارتباط با سرور برقرار نشد. دوباره تلاش کنید.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => void usersQuery.refetch()}>
              تلاش دوباره
            </Button>
          </section>
        ) : (
          <AdminUsersTable
            users={usersQuery.data?.data ?? []}
            meta={usersQuery.data?.meta ?? EMPTY_META}
            currentUserId={currentUserId}
            loading={usersQuery.isLoading}
            onStatusAction={setSelectedUser}
            onPageChange={(page) => {
              startTransition(() => {
                router.replace(createAdminUsersHref(searchParams, { page }), { scroll: false });
              });
            }}
          />
        )}
      </Card>

      <AdminUserStatusDialog
        user={selectedUser}
        open={Boolean(selectedUser)}
        pending={statusMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
        }}
        onConfirm={(input) =>
          statusMutation.mutate(input, {
            onSuccess: () => setSelectedUser(null),
          })
        }
      />
    </div>
  );
}

export { AdminUsersPage };
