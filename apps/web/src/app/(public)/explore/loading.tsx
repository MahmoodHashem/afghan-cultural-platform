import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ExploreLoading() {
  return (
    <main
      className="min-h-screen bg-background"
      aria-busy="true"
      aria-label="در حال بارگذاری محتوا"
    >
      <section className="border-b border-border bg-card pt-24 pb-10 sm:pt-28">
        <div className="content-container">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div className="space-y-4">
              <Skeleton className="h-5 w-36 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-12 w-full max-w-xl rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full max-w-2xl rounded-full" />
                <Skeleton className="h-4 w-3/4 max-w-xl rounded-full" />
              </div>
            </div>
            <Card className="rounded-2xl border-border bg-background shadow-[0_2px_10px_rgba(0,0,0,.04)]">
              <CardContent className="grid grid-cols-2 gap-3 p-4">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="content-container grid gap-8 py-10 lg:grid-cols-[320px_1fr] lg:items-start">
        <aside className="space-y-4">
          <Card className="rounded-2xl border-border bg-card">
            <CardContent className="space-y-5 p-4">
              <Skeleton className="h-6 w-32 rounded-full" />
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="space-y-2">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-10 rounded-xl" />
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-5 w-44 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
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
