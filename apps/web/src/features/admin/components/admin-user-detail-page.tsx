"use client";

import { ArrowRightIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AdminRevokeSessionsDialog,
  AdminUserStatusDialog,
} from "@/features/admin/components/admin-user-action-dialogs";
import {
  AdminUserRecords,
  type AdminUserRecordTab,
} from "@/features/admin/components/admin-user-records";
import { AdminUserSummary } from "@/features/admin/components/admin-user-summary";
import {
  useAdminUser,
  useRevokeAdminUserSessions,
  useUpdateAdminUserStatus,
} from "@/features/admin/hooks/use-admin-users";
import { getAdminUserErrorMessage } from "@/features/admin/utils/admin-user-errors";
import { useAuthStore } from "@/stores/auth-store";

function AdminUserDetailPage({ userId }: { userId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userQuery = useAdminUser(userId);
  const statusMutation = useUpdateAdminUserStatus(userId);
  const revokeMutation = useRevokeAdminUserSessions(userId);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [, startTransition] = useTransition();
  const tab = parseTab(searchParams.get("tab"));
  const page = parsePage(searchParams.get("page"));

  if (userQuery.isLoading) return <AdminUserDetailSkeleton />;

  if (userQuery.isError || !userQuery.data) {
    return (
      <div className="space-y-5">
        <Button variant="ghost" render={<Link href="/admin/users" />} className="w-fit">
          <ArrowRightIcon className="size-4" aria-hidden="true" />
          بازگشت به کاربران
        </Button>
        <Card
          className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-xl px-6 text-center"
          role="alert"
        >
          <ExclamationTriangleIcon className="size-8 text-destructive" aria-hidden="true" />
          <div className="space-y-1">
            <h1 className="text-[18px] font-semibold">اطلاعات کاربر در دسترس نیست</h1>
            <p className="text-[13px] text-muted-foreground">
              {getAdminUserErrorMessage(userQuery.error)}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => void userQuery.refetch()}>
            تلاش دوباره
          </Button>
        </Card>
      </div>
    );
  }

  const user = userQuery.data;
  const replaceRecordQuery = (nextTab: AdminUserRecordTab, nextPage: number) => {
    const params = new URLSearchParams();
    if (nextTab !== "entries") params.set("tab", nextTab);
    if (nextPage > 1) params.set("page", String(nextPage));
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `/admin/users/${userId}?${query}` : `/admin/users/${userId}`, {
        scroll: false,
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Button variant="ghost" render={<Link href="/admin/users" />} className="w-fit -ms-3">
          <ArrowRightIcon className="size-4" aria-hidden="true" />
          بازگشت به کاربران
        </Button>
        <div>
          <h1 className="text-[28px] font-bold leading-10 text-foreground sm:text-[34px]">
            جزئیات کاربر
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            اطلاعات حساب، مشارکت‌ها و تاریخچه اقدام‌های مدیریتی
          </p>
        </div>
      </div>

      <AdminUserSummary
        user={user}
        isCurrentUser={user.id === currentUserId}
        onStatusAction={() => setStatusDialogOpen(true)}
        onRevokeSessions={() => setRevokeDialogOpen(true)}
      />

      <AdminUserRecords
        userId={userId}
        tab={tab}
        page={page}
        onTabChange={(nextTab) => replaceRecordQuery(nextTab, 1)}
        onPageChange={(nextPage) => replaceRecordQuery(tab, nextPage)}
      />

      <AdminUserStatusDialog
        user={user}
        open={statusDialogOpen}
        pending={statusMutation.isPending}
        onOpenChange={setStatusDialogOpen}
        onConfirm={(input) =>
          statusMutation.mutate(input, { onSuccess: () => setStatusDialogOpen(false) })
        }
      />
      <AdminRevokeSessionsDialog
        user={user}
        open={revokeDialogOpen}
        pending={revokeMutation.isPending}
        onOpenChange={setRevokeDialogOpen}
        onConfirm={() =>
          revokeMutation.mutate(undefined, { onSuccess: () => setRevokeDialogOpen(false) })
        }
      />
    </div>
  );
}

function AdminUserDetailSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="در حال بارگذاری اطلاعات کاربر">
      <Skeleton className="h-9 w-36" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(["one", "two", "three", "four"] as const).map((item) => (
          <Skeleton key={item} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Skeleton className="h-60 rounded-xl" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}

function parseTab(value: string | null): AdminUserRecordTab {
  return value === "reviews" || value === "activity" ? value : "entries";
}

function parsePage(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export { AdminUserDetailPage };
