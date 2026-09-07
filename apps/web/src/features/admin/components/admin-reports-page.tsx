"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminReportsTable } from "@/features/admin/components/admin-reports-table";
import { AdminReportsToolbar } from "@/features/admin/components/admin-reports-toolbar";
import type { AdminPaginationMeta } from "@/features/admin/types/admin-users";
import {
  type AdminReportsQuery,
  createAdminReportsHref,
  parseAdminReportsQuery,
} from "@/features/admin/utils/admin-reports-url";
import { useReportsQueue } from "@/features/moderation/hooks/use-content-moderation";

const EMPTY_META: AdminPaginationMeta = { page: 1, limit: 20, total: 0, totalPages: 0 };

function AdminReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = parseAdminReportsQuery(searchParams);
  const reportsQuery = useReportsQueue(query);
  const [isNavigating, startTransition] = useTransition();
  const [pageDirection, setPageDirection] = useState<-1 | 0 | 1>(0);

  const updateQuery = useCallback(
    (updates: Partial<AdminReportsQuery>) => {
      setPageDirection(0);
      startTransition(() => {
        router.replace(createAdminReportsHref(searchParams, { page: 1, ...updates }), {
          scroll: false,
        });
      });
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="گزارش‌ها"
        description="بررسی گزارش‌های مطالب و دیدگاه‌ها و ثبت تصمیم‌های نظارتی"
      />
      <Card className="gap-0 overflow-hidden rounded-xl py-0">
        <AdminReportsToolbar
          query={query}
          total={reportsQuery.data?.meta.total ?? 0}
          pending={isNavigating || reportsQuery.isFetching}
          onChange={updateQuery}
          onClear={() => {
            setPageDirection(0);
            startTransition(() => router.replace("/admin/reports", { scroll: false }));
          }}
        />
        {reportsQuery.isError ? (
          <section
            className="flex min-h-72 flex-col items-center justify-center gap-4 px-6 text-center"
            role="alert"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ExclamationTriangleIcon className="size-5" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <h2 className="text-[16px] font-semibold">فهرست گزارش‌ها بارگذاری نشد</h2>
              <p className="text-[13px] text-muted-foreground">
                ارتباط با سرور برقرار نشد. دوباره تلاش کنید.
              </p>
            </div>
            <Button variant="outline" onClick={() => void reportsQuery.refetch()}>
              تلاش دوباره
            </Button>
          </section>
        ) : (
          <AdminReportsTable
            reports={reportsQuery.data?.data ?? []}
            meta={reportsQuery.data?.meta ?? EMPTY_META}
            loading={reportsQuery.isLoading}
            updating={reportsQuery.isFetching && !reportsQuery.isLoading}
            pageDirection={pageDirection}
            onPageChange={(page) => {
              setPageDirection(page > query.page ? -1 : 1);
              startTransition(() => {
                router.replace(createAdminReportsHref(searchParams, { page }), { scroll: false });
              });
            }}
          />
        )}
      </Card>
    </div>
  );
}

export { AdminReportsPage };
