"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminAddModeratorDialog } from "@/features/admin/components/admin-add-moderator-dialog";
import { AdminModeratorsTable } from "@/features/admin/components/admin-moderators-table";
import { AdminModeratorsToolbar } from "@/features/admin/components/admin-moderators-toolbar";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminUserRoleDialog } from "@/features/admin/components/admin-user-role-dialog";
import { useAdminUsers, useUpdateAdminUserRole } from "@/features/admin/hooks/use-admin-users";
import type { AdminUserListItem } from "@/features/admin/types/admin-users";
import {
  type AdminModeratorsQuery,
  createAdminModeratorsHref,
  parseAdminModeratorsQuery,
} from "@/features/admin/utils/admin-moderators-url";

const EMPTY_META = { page: 1, limit: 20, total: 0, totalPages: 0 };

function AdminModeratorsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = parseAdminModeratorsQuery(searchParams);
  const moderatorsQuery = useAdminUsers({ ...query, role: "MODERATOR" });
  const [addOpen, setAddOpen] = useState(false);
  const [roleUser, setRoleUser] = useState<AdminUserListItem | null>(null);
  const [targetRole, setTargetRole] = useState<"USER" | "MODERATOR">("USER");
  const roleMutation = useUpdateAdminUserRole(roleUser?.id ?? "");
  const [isNavigating, startTransition] = useTransition();
  const [pageDirection, setPageDirection] = useState<-1 | 0 | 1>(0);

  const updateQuery = useCallback(
    (updates: Partial<AdminModeratorsQuery>) => {
      setPageDirection(0);
      startTransition(() => {
        router.replace(createAdminModeratorsHref(searchParams, { page: 1, ...updates }), {
          scroll: false,
        });
      });
    },
    [router, searchParams],
  );

  function selectCandidate(user: AdminUserListItem) {
    setAddOpen(false);
    window.requestAnimationFrame(() => {
      setRoleUser(user);
      setTargetRole("MODERATOR");
    });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="ناظران"
        description="مدیریت دسترسی ناظران و مشاهده فعالیت حساب‌های مسئول بررسی محتوا"
      />

      <Card className="gap-0 overflow-hidden rounded-xl py-0">
        <AdminModeratorsToolbar
          query={query}
          total={moderatorsQuery.data?.meta.total ?? 0}
          pending={isNavigating || moderatorsQuery.isFetching}
          onChange={updateQuery}
          onClear={() => {
            setPageDirection(0);
            startTransition(() => router.replace("/admin/moderators", { scroll: false }));
          }}
          onAdd={() => setAddOpen(true)}
        />

        {moderatorsQuery.isError ? (
          <section
            className="flex min-h-72 flex-col items-center justify-center gap-4 px-6 text-center"
            role="alert"
          >
            <ExclamationTriangleIcon className="size-8 text-destructive" aria-hidden="true" />
            <div className="space-y-1">
              <h2 className="text-[16px] font-semibold">فهرست ناظران بارگذاری نشد</h2>
              <p className="text-[13px] text-muted-foreground">
                ارتباط با سرور برقرار نشد. دوباره تلاش کنید.
              </p>
            </div>
            <Button variant="outline" onClick={() => void moderatorsQuery.refetch()}>
              تلاش دوباره
            </Button>
          </section>
        ) : (
          <AdminModeratorsTable
            moderators={moderatorsQuery.data?.data ?? []}
            meta={moderatorsQuery.data?.meta ?? EMPTY_META}
            loading={moderatorsQuery.isLoading}
            updating={moderatorsQuery.isFetching && !moderatorsQuery.isLoading}
            pageDirection={pageDirection}
            onDemote={(user) => {
              setRoleUser(user);
              setTargetRole("USER");
            }}
            onPageChange={(page) => {
              setPageDirection(page > (query.page ?? 1) ? -1 : 1);
              startTransition(() => {
                router.replace(createAdminModeratorsHref(searchParams, { page }), {
                  scroll: false,
                });
              });
            }}
          />
        )}
      </Card>

      <AdminAddModeratorDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSelect={selectCandidate}
      />
      <AdminUserRoleDialog
        user={roleUser}
        targetRole={targetRole}
        open={Boolean(roleUser)}
        pending={roleMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setRoleUser(null);
        }}
        onConfirm={async (reason) => {
          await roleMutation.mutateAsync({ role: targetRole, reason });
          setRoleUser(null);
        }}
      />
    </div>
  );
}

export { AdminModeratorsPage };
