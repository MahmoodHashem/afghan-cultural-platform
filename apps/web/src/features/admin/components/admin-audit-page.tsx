"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminAuditDetailsDialog } from "@/features/admin/components/admin-audit-details-dialog";
import { AdminAuditTable } from "@/features/admin/components/admin-audit-table";
import { AdminAuditToolbar } from "@/features/admin/components/admin-audit-toolbar";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { useAdminAudit } from "@/features/admin/hooks/use-admin-audit";
import type { AdminAuditItem, AdminAuditQuery } from "@/features/admin/types/admin-audit";
import type { AdminPaginationMeta } from "@/features/admin/types/admin-users";
import { getAdminAuditErrorMessage } from "@/features/admin/utils/admin-audit-errors";
import { createAdminAuditHref, parseAdminAuditQuery } from "@/features/admin/utils/admin-audit-url";

const EMPTY_META: AdminPaginationMeta = { page: 1, limit: 20, total: 0, totalPages: 0 };

function AdminAuditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = parseAdminAuditQuery(searchParams);
  const auditQuery = useAdminAudit(query);
  const [selected, setSelected] = useState<AdminAuditItem | null>(null);
  const [isNavigating, startTransition] = useTransition();
  const [pageDirection, setPageDirection] = useState<-1 | 0 | 1>(0);

  const updateQuery = useCallback(
    (updates: Partial<AdminAuditQuery>) => {
      setPageDirection(0);
      startTransition(() =>
        router.replace(createAdminAuditHref(searchParams, { page: 1, ...updates }), {
          scroll: false,
        }),
      );
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="تاریخچه فعالیت‌ها"
        description="ردیابی رویدادهای مهم محتوا، نظارت و مدیریت حساب‌ها"
      />
      <Card className="gap-0 overflow-hidden rounded-xl py-0">
        <AdminAuditToolbar
          query={query}
          total={auditQuery.data?.meta.total ?? 0}
          pending={isNavigating || auditQuery.isFetching}
          onChange={updateQuery}
          onClear={() => {
            setPageDirection(0);
            startTransition(() => router.replace("/admin/audit", { scroll: false }));
          }}
        />
        {auditQuery.isError ? (
          <section
            className="flex min-h-72 flex-col items-center justify-center gap-4 px-6 text-center"
            role="alert"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ExclamationTriangleIcon className="size-5" aria-hidden />
            </span>
            <div className="space-y-1">
              <h2 className="text-[16px] font-semibold">تاریخچه بارگذاری نشد</h2>
              <p className="text-[13px] text-muted-foreground">
                {getAdminAuditErrorMessage(auditQuery.error)}
              </p>
            </div>
            <Button variant="outline" onClick={() => void auditQuery.refetch()}>
              تلاش دوباره
            </Button>
          </section>
        ) : (
          <AdminAuditTable
            items={auditQuery.data?.data ?? []}
            meta={auditQuery.data?.meta ?? EMPTY_META}
            loading={auditQuery.isLoading}
            updating={auditQuery.isFetching && !auditQuery.isLoading}
            pageDirection={pageDirection}
            onInspect={setSelected}
            onPageChange={(page) => {
              setPageDirection(page > query.page ? -1 : 1);
              startTransition(() =>
                router.replace(createAdminAuditHref(searchParams, { page }), { scroll: false }),
              );
            }}
          />
        )}
      </Card>
      <AdminAuditDetailsDialog
        item={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}

export { AdminAuditPage };
