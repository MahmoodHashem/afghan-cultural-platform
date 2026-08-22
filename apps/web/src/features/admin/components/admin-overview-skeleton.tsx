import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const STAT_PLACEHOLDERS = ["users", "entries", "pending", "reports"] as const;
const ATTENTION_PLACEHOLDERS = ["submissions", "corrections", "reports", "stale"] as const;
const ACTIVITY_PLACEHOLDERS = ["first", "second", "third", "fourth", "fifth"] as const;

function AdminOverviewSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="در حال بارگذاری نمای کلی" aria-busy="true">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_PLACEHOLDERS.map((placeholder) => (
          <Card key={placeholder} className="min-h-36 justify-center rounded-xl">
            <CardContent className="flex items-center justify-between gap-4 px-5">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="size-12 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
        <Card className="min-h-[380px] rounded-xl">
          <CardHeader className="flex-row justify-between px-5">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-8 w-32 rounded-lg" />
          </CardHeader>
          <CardContent className="px-5">
            <Skeleton className="h-[280px] w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card className="min-h-[380px] rounded-xl">
          <CardHeader className="px-5">
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent className="space-y-4 px-5">
            {ATTENTION_PLACEHOLDERS.map((placeholder) => (
              <div key={placeholder} className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="rounded-xl">
        <CardHeader className="px-5">
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="space-y-3 px-5">
          {ACTIVITY_PLACEHOLDERS.map((placeholder) => (
            <Skeleton key={placeholder} className="h-11 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export { AdminOverviewSkeleton };
