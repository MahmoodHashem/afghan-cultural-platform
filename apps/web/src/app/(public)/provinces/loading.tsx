import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ProvincesLoading() {
  return (
    <main
      className="min-h-screen bg-background"
      aria-busy="true"
      aria-label="در حال بارگذاری ولایت‌ها"
    >
      <section className="content-container pt-32 pb-16 sm:pt-36">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <Skeleton className="mx-auto h-5 w-24 rounded-full" />
          <Skeleton className="mx-auto h-12 w-full max-w-xl rounded-2xl" />
          <Skeleton className="mx-auto h-4 w-full max-w-2xl rounded-full" />
          <Skeleton className="mx-auto h-4 w-3/4 max-w-xl rounded-full" />
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <Card key={item} className="overflow-hidden rounded-2xl border-border bg-card p-0">
              <Skeleton className="aspect-[4/3] rounded-none" />
              <CardContent className="space-y-3 p-4">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-4 w-32 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

export default ProvincesLoading;
