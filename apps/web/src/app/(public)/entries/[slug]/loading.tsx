import { Skeleton } from "@/components/ui/skeleton";

const lineKeys = ["a", "b", "c", "d", "e", "f", "g"] as const;
const railKeys = ["like", "comment", "save", "share"] as const;

/** Mirrors the reading page: navy hero, matted figure, then rail, prose and side column. */
function EntryDetailLoading() {
  return (
    <main className="min-h-screen bg-background" aria-busy="true" aria-label="در حال بارگذاری مطلب">
      <article>
        <section className="bg-linear-155 from-hero-navy to-hero-navy-deep pt-[calc(4.125rem+2.5rem)] pb-60 sm:pt-[calc(4.125rem+3rem)] sm:pb-64">
          <div className="content-container space-y-4">
            <Skeleton className="h-3 w-44 rounded-full bg-white/10" />
            <Skeleton className="h-10 w-full max-w-2xl rounded-full bg-white/12" />
            <Skeleton className="h-4 w-full max-w-xl rounded-full bg-white/10" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
              <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
            </div>
          </div>
        </section>
        <div className="relative z-10 mx-auto -mt-56 w-[min(100%-2rem,var(--container-article))] rounded-[26px_26px_26px_10px] bg-surface p-3 pb-11 shadow-figure sm:-mt-60">
          <Skeleton className="aspect-[15/8] rounded-[16px_16px_16px_4px]" />
        </div>

        <section className="content-container grid gap-8 py-8 sm:py-10 lg:grid-cols-[56px_minmax(0,1fr)_minmax(0,320px)] lg:gap-10">
          <div className="hidden flex-col items-center gap-3 lg:flex">
            {railKeys.map((key) => (
              <Skeleton key={key} className="size-12 rounded-bubble-sm" />
            ))}
          </div>
          <div className="space-y-4">
            {lineKeys.map((key, index) => (
              <Skeleton
                key={key}
                className={index % 3 === 2 ? "h-4 w-3/4 rounded-full" : "h-4 w-full rounded-full"}
              />
            ))}
          </div>
          <div className="hidden space-y-4 lg:block">
            <Skeleton className="h-56 rounded-card" />
            <Skeleton className="h-40 rounded-card" />
          </div>
        </section>
      </article>
    </main>
  );
}

export default EntryDetailLoading;
