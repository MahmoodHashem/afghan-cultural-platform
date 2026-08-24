import { Skeleton } from "@/components/ui/skeleton";

function CommentListSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={compact ? "space-y-5 py-4" : "rounded-xl border border-border bg-card p-5"}
      role="status"
    >
      <span className="sr-only">در حال بارگذاری دیدگاه‌ها</span>
      {[1, 2].map((item) => (
        <div key={item} className="flex gap-3 border-b border-border py-5 last:border-0">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export { CommentListSkeleton };
