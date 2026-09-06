import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ExploreLoading() {
  return (
    <main
      className="min-h-screen bg-background"
      aria-busy="true"
      aria-label="در حال بارگذاری محتوا"
    >
      <section className="border-b border-border bg-card pt-22 pb-7 sm:pt-26 sm:pb-8">
        <div className="content-container">
          <Skeleton className="h-4 w-36 rounded-full" />
        </div>
      </section>

      <section className="content-container gap-6 py-6 sm:py-7">
        <div className="space-y-5">
          <Skeleton className="h-10 w-full rounded-full" />
          <div className="hidden items-center gap-3 md:flex">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-10 w-32 rounded-lg" />
            ))}
          </div>
          <div className="border-b border-border px-1 pt-1 pb-3">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
            <div className="mt-3 flex gap-2 overflow-hidden md:hidden">
              <Skeleton className="h-7 w-24 shrink-0 rounded-full" />
              <Skeleton className="h-7 w-28 shrink-0 rounded-full" />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} className="overflow-hidden rounded-2xl border-border bg-card p-0">
                <Skeleton className="aspect-[4/3] rounded-none" />
                <CardContent className="space-y-3 p-4">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-full rounded-full" />
                  <Skeleton className="h-4 w-full rounded-full" />
                  <Skeleton className="h-4 w-2/3 rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default ExploreLoading;
