"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminEntriesTable } from "@/features/admin/components/admin-entries-table";
import { AdminEntriesToolbar } from "@/features/admin/components/admin-entries-toolbar";
import { AdminEntryLifecycleDialog } from "@/features/admin/components/admin-entry-lifecycle-dialog";
import { AdminEntryStatusTabs } from "@/features/admin/components/admin-entry-status-tabs";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import {
  useAdminEntries,
  useAdminEntryLifecycle,
  useAdminEntryTaxonomy,
} from "@/features/admin/hooks/use-admin-entries";
import type { AdminEntriesQuery, AdminEntryListItem } from "@/features/admin/types/admin-entries";
import {
  createAdminEntriesHref,
  parseAdminEntriesQuery,
} from "@/features/admin/utils/admin-entries-url";

const EMPTY_META = { page: 1, limit: 20, total: 0, totalPages: 0 };

function AdminEntriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = parseAdminEntriesQuery(searchParams);
  const entriesQuery = useAdminEntries(query);
  const taxonomyQuery = useAdminEntryTaxonomy();
  const [selectedEntry, setSelectedEntry] = useState<AdminEntryListItem | null>(null);
  const lifecycleAction = selectedEntry?.status === "ARCHIVED" ? "restore" : "archive";
  const lifecycleMutation = useAdminEntryLifecycle(selectedEntry?.id ?? "", lifecycleAction);
  const [isNavigating, startTransition] = useTransition();
  const [pageDirection, setPageDirection] = useState<-1 | 0 | 1>(0);

  const updateQuery = useCallback(
    (updates: Partial<AdminEntriesQuery>) => {
      setPageDirection(0);
      startTransition(() =>
        router.replace(createAdminEntriesHref(searchParams, { page: 1, ...updates }), {
          scroll: false,
        }),
      );
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="مطالب"
        description="مشاهده همه مطالب و پیگیری وضعیت آن‌ها در چرخه انتشار"
      />
      <Card className="gap-0 overflow-hidden rounded-xl py-0">
        <AdminEntryStatusTabs
          value={query.status}
          counts={entriesQuery.data?.statusCounts ?? []}
          disabled={isNavigating}
          onChange={(status) => updateQuery({ status })}
        />
        <AdminEntriesToolbar
          query={query}
          total={entriesQuery.data?.meta.total ?? 0}
          taxonomy={taxonomyQuery.data}
          pending={isNavigating || entriesQuery.isFetching}
          onChange={updateQuery}
          onClear={() => {
            setPageDirection(0);
            startTransition(() => router.replace("/admin/entries", { scroll: false }));
          }}
        />
        {entriesQuery.isError ? (
          <section
            className="flex min-h-72 flex-col items-center justify-center gap-4 px-6 text-center"
            role="alert"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ExclamationTriangleIcon className="size-5" />
            </span>
            <div className="space-y-1">
              <h2 className="text-[16px] font-semibold">فهرست مطالب بارگذاری نشد</h2>
              <p className="text-[13px] text-muted-foreground">
                فعلاً دسترسی به این بخش ممکن نیست. دوباره تلاش کنید.
              </p>
            </div>
            <Button variant="outline" onClick={() => void entriesQuery.refetch()}>
              تلاش دوباره
            </Button>
          </section>
        ) : (
          <AdminEntriesTable
            entries={entriesQuery.data?.data ?? []}
            meta={entriesQuery.data?.meta ?? EMPTY_META}
            loading={entriesQuery.isLoading}
            updating={entriesQuery.isFetching && !entriesQuery.isLoading}
            pageDirection={pageDirection}
            onLifecycle={setSelectedEntry}
            onPageChange={(page) => {
              setPageDirection(page > (query.page ?? 1) ? -1 : 1);
              startTransition(() =>
                router.replace(createAdminEntriesHref(searchParams, { page }), { scroll: false }),
              );
            }}
          />
        )}
      </Card>
      <AdminEntryLifecycleDialog
        entry={selectedEntry}
        open={Boolean(selectedEntry)}
        pending={lifecycleMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setSelectedEntry(null);
        }}
        onConfirm={(reason) =>
          lifecycleMutation.mutate({ reason }, { onSuccess: () => setSelectedEntry(null) })
        }
      />
    </div>
  );
}

export { AdminEntriesPage };
