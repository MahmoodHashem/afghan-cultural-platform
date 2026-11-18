import { Skeleton } from "@/components/ui/skeleton";

const cardKeys = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh"] as const;
const groupKeys = ["scope", "province", "topic", "type"] as const;

/** Mirrors the explore layout: navy hero with search, filter column and the archive grid. */
function ExploreLoading() {
  return (
    <main
      className="min-h-screen bg-background"
      aria-busy="true"
      aria-label="در حال بارگذاری محتوا"
    >
      <section className="bg-linear-155 from-hero-navy to-hero-navy-deep pt-[calc(4.125rem+2.5rem)] pb-10 sm:pt-[calc(4.125rem+3rem)] sm:pb-14">
        <div className="content-container space-y-4">
          <Skeleton className="h-3 w-32 rounded-full bg-white/10" />
          <Skeleton className="h-10 w-80 max-w-full rounded-full bg-white/12" />
          <Skeleton className="h-4 w-full max-w-xl rounded-full bg-white/10" />
          <Skeleton className="h-14 w-full max-w-xl rounded-full bg-white/14" />
          <div className="flex flex-wrap gap-2 pt-2">
            {groupKeys.map((key) => (
              <Skeleton key={key} className="h-8 w-24 rounded-full bg-white/10" />
            ))}
          </div>
        </div>
      </section>

      <section className="content-container py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[272px_minmax(0,1fr)] lg:gap-10">
          <div className="hidden space-y-3 lg:block">
            {groupKeys.map((key) => (
              <Skeleton key={key} className="h-36 rounded-card" />
            ))}
          </div>
          <div className="space-y-5">
            <Skeleton className="h-11 rounded-full" />
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {cardKeys.map((key, index) => (
                <div
                  key={key}
                  className={
                    index === 0
                      ? "overflow-hidden rounded-[20px_20px_20px_6px] border border-line-soft bg-surface sm:col-span-2 xl:col-span-3"
                      : "overflow-hidden rounded-[20px_20px_20px_6px] border border-line-soft bg-surface"
                  }
                >
                  <Skeleton className="aspect-[4/3] rounded-none" />
                  <div className="space-y-3 p-5">
                    <Skeleton className="h-3 w-20 rounded-full" />
                    <Skeleton className="h-5 w-4/5 rounded-full" />
                    <Skeleton className="h-4 w-full rounded-full" />
                    <Skeleton className="h-8 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ExploreLoading;
