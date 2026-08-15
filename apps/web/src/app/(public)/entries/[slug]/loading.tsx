import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function EntryDetailLoading() {
  return (
    <main className="min-h-screen bg-background" aria-busy="true" aria-label="در حال بارگذاری مدخل">
      <article>
        <section className="border-b border-border bg-card pt-24 pb-10 sm:pt-28">
          <div className="content-container">
            <Skeleton className="h-5 w-40 rounded-full" />

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-7 w-24 rounded-full" />
                  <Skeleton className="h-7 w-28 rounded-full" />
                  <Skeleton className="h-7 w-20 rounded-full" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-14 w-full max-w-3xl rounded-2xl" />
                  <Skeleton className="h-14 w-4/5 max-w-2xl rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full max-w-2xl rounded-full" />
                    <Skeleton className="h-4 w-3/4 max-w-xl rounded-full" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Skeleton className="h-5 w-32 rounded-full" />
                  <Skeleton className="h-5 w-28 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
              </div>

              <Card className="overflow-hidden rounded-[28px] border-border bg-background">
                <Skeleton className="aspect-4/3 rounded-none" />
                <div className="p-4">
                  <Skeleton className="h-4 w-3/4 rounded-full" />
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="content-container grid gap-8 py-10 lg:grid-cols-[56px_minmax(0,760px)_320px] lg:items-start lg:justify-between">
          <aside className="hidden self-start lg:block">
            <div className="flex flex-col items-center gap-4">
              {[1, 2, 3, 4].map((item) => (
                <Skeleton key={item} className="size-12 rounded-2xl" />
              ))}
              <Skeleton className="h-36 w-2 rounded-full" />
              <Skeleton className="size-12 rounded-2xl" />
            </div>
          </aside>

          <div className="min-w-0 space-y-10">
            <div className="space-y-5">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="space-y-3">
                  {item === 2 || item === 4 ? <Skeleton className="h-9 w-2/3 rounded-xl" /> : null}
                  <Skeleton className="h-5 w-full rounded-full" />
                  <Skeleton className="h-5 w-11/12 rounded-full" />
                  <Skeleton className="h-5 w-4/5 rounded-full" />
                </div>
              ))}
            </div>

            <Card className="rounded-[24px] border-border bg-card">
              <CardContent className="space-y-5 p-5">
                <Skeleton className="h-7 w-36 rounded-full" />
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-10 w-28 rounded-full" />
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-5">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="rounded-2xl border-border bg-card">
                <CardContent className="space-y-3 p-4">
                  <Skeleton className="h-6 w-32 rounded-full" />
                  <Skeleton className="h-4 w-full rounded-full" />
                  <Skeleton className="h-4 w-4/5 rounded-full" />
                  <Skeleton className="h-4 w-3/5 rounded-full" />
                </CardContent>
              </Card>
            ))}
          </aside>
        </section>
      </article>
    </main>
  );
}

export default EntryDetailLoading;
