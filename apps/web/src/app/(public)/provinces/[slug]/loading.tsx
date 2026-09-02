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

        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)] lg:items-center lg:gap-12">
          <div>
            <Skeleton className="h-4 w-28 rounded-full" />
            <Skeleton className="mt-3 h-13 w-40 rounded-lg" />
            <div className="mt-5 max-w-3xl space-y-3">
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-[92%] rounded-full" />
              <Skeleton className="h-4 w-[85%] rounded-full" />
            </div>
            <div className="mt-6 flex flex-wrap gap-7 border-t border-border pt-5">
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-5 rounded-md" />
                <Skeleton className="h-5 w-28 rounded-full" />
              </div>
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-5 rounded-md" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
          </div>
          <Skeleton className="aspect-[4/3] rounded-xl sm:aspect-[16/10] lg:aspect-[4/3]" />
        </div>

        <div className="mt-11 border-y border-border bg-card/55 py-7 sm:mt-14 sm:py-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-7 w-52 rounded-lg" />
              <Skeleton className="h-4 w-32 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg sm:w-72" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Skeleton key={item} className="h-11 rounded-lg" />
            ))}
          </div>
        </div>

        <div className="mt-11 space-y-6 sm:mt-14">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded-full" />
            <Skeleton className="h-8 w-64 rounded-lg" />
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-3 overflow-hidden lg:flex-1">
              {[1, 2, 3, 4, 5].map((item) => (
                <Skeleton key={item} className="h-10 w-28 shrink-0 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-10 w-full rounded-full lg:w-72" />
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
