import { Skeleton } from "@/components/ui/skeleton";

const cardKeys = ["first", "second", "third", "fourth", "fifth", "sixth"] as const;

/** Mirrors the explore layout: navy page hero, toolbar, filter bar and the archive grid. */
function ExploreLoading() {
  return (
    <main
      className="min-h-screen bg-paper"
      aria-busy="true"
      aria-label="در حال بارگذاری محتوا"
    >
      <section className="bg-linear-155 from-hero-navy to-hero-navy-deep pt-[calc(4.125rem+2.5rem)] pb-10 sm:pt-[calc(4.125rem+3rem)] sm:pb-14">
        <div className="content-container space-y-4">
          <Skeleton className="h-3 w-32 rounded-full bg-white/10" />
          <Skeleton className="h-10 w-80 max-w-full rounded-full bg-white/12" />
          <Skeleton className="h-4 w-full max-w-xl rounded-full bg-white/10" />
          <Skeleton className="h-11.5 w-48 rounded-full bg-white/12" />
        </div>
      </section>

      <section className="content-container py-8 sm:py-10">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11.5 flex-1 md:max-w-[420px]" />
            <Skeleton className="hidden h-11 w-72 rounded-full md:block" />
          </div>
          <Skeleton className="hidden h-16 rounded-card md:block" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cardKeys.map((key, index) => (
              <div
                key={key}
                className={
                  index === 0
                    ? "overflow-hidden rounded-card border border-line bg-surface sm:col-span-2"
                    : "overflow-hidden rounded-card border border-line bg-surface"
                }
              >
                <Skeleton className="aspect-video rounded-none" />
                <div className="space-y-3 p-4">
                  <Skeleton className="h-5 w-4/5 rounded-full" />
                  <Skeleton className="h-4 w-full rounded-full" />
                  <Skeleton className="h-4 w-2/3 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default ExploreLoading;
