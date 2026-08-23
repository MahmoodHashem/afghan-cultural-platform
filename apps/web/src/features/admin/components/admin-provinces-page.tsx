"use client";

import { ArrowsUpDownIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminGeographyStatusDialog } from "@/features/admin/components/admin-geography-status-dialog";
import { AdminGeographyToolbar } from "@/features/admin/components/admin-geography-toolbar";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminProvincesTable } from "@/features/admin/components/admin-provinces-table";
import {
  useAdminProvinces,
  useReorderAdminProvinces,
  useSetAdminProvinceActive,
} from "@/features/admin/hooks/use-admin-provinces";
import type { AdminGeographyQuery, AdminProvince } from "@/features/admin/types/admin-provinces";
import {
  createAdminGeographyHref,
  parseAdminGeographyQuery,
} from "@/features/admin/utils/admin-provinces-url";

const ROUTE = "/admin/provinces";
const EMPTY_META = { page: 1, limit: 50, total: 0, totalPages: 0 };

function AdminProvincesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = parseAdminGeographyQuery(searchParams, 50);
  const provincesQuery = useAdminProvinces(query);
  const [statusProvince, setStatusProvince] = useState<AdminProvince | null>(null);
  const statusMutation = useSetAdminProvinceActive(statusProvince?.id ?? "");
  const reorderMutation = useReorderAdminProvinces();
  const [reorderProvinces, setReorderProvinces] = useState<AdminProvince[] | null>(null);
  const [isNavigating, startTransition] = useTransition();
  const provinces = reorderProvinces ?? provincesQuery.data?.data ?? [];
  const reorderMode = reorderProvinces !== null;
  const canReorder =
    !query.search &&
    query.isActive === undefined &&
    query.sortBy === "sortOrder" &&
    query.sortDirection === "asc" &&
    (provincesQuery.data?.meta.total ?? 0) === (provincesQuery.data?.data.length ?? 0);

  const updateQuery = useCallback(
    (updates: Partial<AdminGeographyQuery>) => {
      startTransition(() =>
        router.replace(createAdminGeographyHref(searchParams, { page: 1, ...updates }, ROUTE), {
          scroll: false,
        }),
      );
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="ولایت‌ها"
        description="اطلاعات عمومی ولایت‌ها و ولسوالی‌های مربوط به هر ولایت را مدیریت کنید."
        actions={
          reorderMode ? (
            <>
              <Button
                variant="outline"
                disabled={reorderMutation.isPending}
                onClick={() => setReorderProvinces(null)}
              >
                انصراف
              </Button>
              <Button
                disabled={reorderMutation.isPending}
                onClick={() =>
                  void reorderMutation
                    .mutateAsync({
                      items: provinces.map((province, index) => ({
                        id: province.id,
                        sortOrder: (index + 1) * 10,
                      })),
                    })
                    .then(() => setReorderProvinces(null))
                }
              >
                {reorderMutation.isPending ? "در حال ذخیره..." : "ذخیره ترتیب"}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              disabled={!canReorder || provinces.length < 2}
              onClick={() => setReorderProvinces([...(provincesQuery.data?.data ?? [])])}
            >
              <ArrowsUpDownIcon className="size-4" />
              تغییر ترتیب
            </Button>
          )
        }
      />

      <Card className="gap-0 overflow-hidden rounded-xl py-0">
        {!reorderMode ? (
          <AdminGeographyToolbar
            id="admin-province-search"
            singular="ولایت"
            query={query}
            total={provincesQuery.data?.meta.total ?? 0}
            pending={isNavigating || provincesQuery.isFetching}
            onChange={updateQuery}
            onClear={() => startTransition(() => router.replace(ROUTE, { scroll: false }))}
          />
        ) : (
          <div className="border-b border-primary/20 bg-primary/5 px-4 py-3 text-[13px] text-primary">
            با دکمه‌های بالا و پایین، ترتیب ولایت‌ها را تغییر دهید.
          </div>
        )}
        {provincesQuery.isError ? (
          <section
            className="flex min-h-72 flex-col items-center justify-center gap-4 p-6 text-center"
            role="alert"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ExclamationTriangleIcon className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">فهرست ولایت‌ها بارگذاری نشد</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                ارتباط با سرور برقرار نشد. دوباره تلاش کنید.
              </p>
            </div>
            <Button variant="outline" onClick={() => void provincesQuery.refetch()}>
              تلاش دوباره
            </Button>
          </section>
        ) : (
          <AdminProvincesTable
            provinces={provinces}
            meta={provincesQuery.data?.meta ?? EMPTY_META}
            loading={provincesQuery.isLoading}
            updating={
              (provincesQuery.isFetching && !provincesQuery.isLoading) ||
              statusMutation.isPending ||
              reorderMutation.isPending
            }
            reorderMode={reorderMode}
            onStatusAction={setStatusProvince}
            onMove={(index, direction) =>
              setReorderProvinces((current) => {
                if (!current) return current;
                const nextIndex = index + direction;
                if (nextIndex < 0 || nextIndex >= current.length) return current;
                const next = [...current];
                const [moved] = next.splice(index, 1);
                if (!moved) return current;
                next.splice(nextIndex, 0, moved);
                return next;
              })
            }
            onPageChange={(page) =>
              startTransition(() =>
                router.replace(createAdminGeographyHref(searchParams, { page }, ROUTE), {
                  scroll: false,
                }),
              )
            }
          />
        )}
      </Card>

      <AdminGeographyStatusDialog
        item={statusProvince}
        singular="ولایت"
        open={Boolean(statusProvince)}
        pending={statusMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setStatusProvince(null);
        }}
        onConfirm={() => {
          if (!statusProvince) return;
          statusMutation.mutate(!statusProvince.isActive, {
            onSuccess: () => setStatusProvince(null),
          });
        }}
      />
    </div>
  );
}

export { AdminProvincesPage };
