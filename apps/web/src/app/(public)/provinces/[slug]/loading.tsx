import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ProvinceDetailLoading() {
  return (
    <main
      className="min-h-screen bg-background"
      aria-busy="true"
      aria-label="در حال بارگذاری صفحه ولایت"
    >
      <section className="content-container pt-30 pb-16 sm:pt-34">
        <Skeleton className="h-4 w-44 rounded-full" />

        <div className="mt-7 grid gap-7 rounded-[28px] border border-border bg-card p-5 sm:p-7 lg:grid-cols-[1fr_420px] lg:items-center">
          <div className="space-y-5">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-12 w-40 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full max-w-2xl rounded-full" />
              <Skeleton className="h-4 w-2/3 max-w-xl rounded-full" />
            </div>
            <div className="grid max-w-md grid-cols-2 gap-3">
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </div>
          </div>
          <Skeleton className="min-h-[220px] rounded-[24px] lg:min-h-[260px]" />
        </div>

        <div className="mt-10 space-y-6">
          <Skeleton className="mx-auto h-8 w-64 rounded-full" />
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Skeleton key={item} className="h-10 w-28 shrink-0 rounded-full" />
            ))}
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <Card key={item} className="overflow-hidden rounded-2xl border-border bg-card p-0">
                <Skeleton className="aspect-[4/3] rounded-none" />
                <CardContent className="space-y-3 p-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
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

export default ProvinceDetailLoading;
