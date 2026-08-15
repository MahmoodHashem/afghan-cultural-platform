import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function CategoryDetailLoading() {
  return (
    <main
      className="min-h-screen bg-background"
      aria-busy="true"
      aria-label="در حال بارگذاری جزئیات دسته‌بندی"
    >
      <section className="content-container pt-30 pb-16 sm:pt-34">
        <Skeleton className="h-4 w-56 rounded-full" />

        <div className="mt-7 grid gap-7 rounded-[28px] border border-border bg-card p-5 sm:p-7 lg:grid-cols-[1fr_320px] lg:items-center">
          <div className="space-y-4">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-12 w-56 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full max-w-2xl rounded-full" />
              <Skeleton className="h-4 w-3/4 max-w-xl rounded-full" />
            </div>
            <Skeleton className="h-5 w-32 rounded-full" />
          </div>
          <Skeleton className="h-44 rounded-[24px]" />
        </div>

        <div className="mt-10 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-7 w-44 rounded-full" />
              <Skeleton className="h-4 w-80 max-w-full rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 rounded-full" />
              <Skeleton className="h-9 w-24 rounded-full" />
              <Skeleton className="h-9 w-24 rounded-full" />
            </div>
          </div>
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

export default CategoryDetailLoading;
