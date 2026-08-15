import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function CategoriesLoading() {
  return (
    <main
      className="min-h-screen bg-background"
      aria-busy="true"
      aria-label="در حال بارگذاری دسته‌بندی‌ها"
    >
      <section className="content-container pt-32 pb-16 sm:pt-36">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <Skeleton className="mx-auto h-5 w-28 rounded-full" />
          <Skeleton className="mx-auto h-12 w-full max-w-xl rounded-2xl" />
          <Skeleton className="mx-auto h-4 w-full max-w-2xl rounded-full" />
          <Skeleton className="mx-auto h-4 w-3/4 max-w-xl rounded-full" />
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <Card key={item} className="rounded-2xl border-border bg-card">
              <CardContent className="space-y-4 p-5">
                <Skeleton className="size-12 rounded-2xl" />
                <Skeleton className="h-6 w-32 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full rounded-full" />
                  <Skeleton className="h-4 w-3/4 rounded-full" />
                </div>
                <Skeleton className="h-4 w-20 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

export default CategoriesLoading;
