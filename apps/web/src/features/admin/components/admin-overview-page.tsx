"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import { Button } from "@/components/ui/button";
import { AdminOverviewActivity } from "@/features/admin/components/admin-overview-activity";
import { AdminOverviewAttention } from "@/features/admin/components/admin-overview-attention";
import { AdminOverviewGrowthChart } from "@/features/admin/components/admin-overview-growth-chart";
import { AdminOverviewSkeleton } from "@/features/admin/components/admin-overview-skeleton";
import { AdminOverviewStatsGrid } from "@/features/admin/components/admin-overview-stats";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { useAdminOverview } from "@/features/admin/hooks/use-admin-overview";

function AdminOverviewPage() {
  const overview = useAdminOverview();

  return (
    <div className="space-y-6">
      <AdminPageHeader title="نمای کلی" description="وضعیت کلی پلتفرم" />

      {overview.isLoading ? <AdminOverviewSkeleton /> : null}

      {overview.isError ? (
        <section
          className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card px-6 text-center"
          role="alert"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ExclamationTriangleIcon className="size-6" aria-hidden="true" />
          </span>
          <div className="space-y-1.5">
            <h2 className="text-[16px] font-semibold text-foreground">نمای کلی بارگذاری نشد</h2>
            <p className="text-[13px] text-muted-foreground">
              ارتباط با سرور برقرار نشد. کمی بعد دوباره تلاش کنید.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => void overview.refetch()}>
            تلاش دوباره
          </Button>
        </section>
      ) : null}

      {overview.data ? (
        <>
          <AdminOverviewStatsGrid stats={overview.data.stats} />
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
            <AdminOverviewGrowthChart data={overview.data.growth} />
            <AdminOverviewAttention data={overview.data.attention} />
          </section>
          <AdminOverviewActivity activities={overview.data.recentActivity} />
        </>
      ) : null}
    </div>
  );
}

export { AdminOverviewPage };
