import { Skeleton } from "@/components/ui/skeleton";

const queueSkeletonKeys = ["first", "second", "third", "fourth", "fifth"] as const;

function ModerationQueueSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <span className="sr-only">صف بررسی در حال بارگذاری است.</span>
      {queueSkeletonKeys.map((key) => (
        <div key={key} className="rounded-xl border border-border bg-card p-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_1fr_1fr_150px] lg:items-center">
            <div className="space-y-2">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-9 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ModerationReviewSkeleton() {
  return (
    <div className="content-container space-y-8 pb-16">
      <div className="space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-full max-w-3xl" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,760px)_320px]">
        <div className="space-y-5 rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-11/12" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="mt-8 h-56 w-full" />
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    </div>
  );
}

export { ModerationQueueSkeleton, ModerationReviewSkeleton };
