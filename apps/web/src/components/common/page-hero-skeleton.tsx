import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Loading placeholder for PageHero: same navy band, offsets and rhythm. */
function PageHeroSkeleton({ withAside = false }: { withAside?: boolean }) {
  return (
    <section className="bg-linear-155 from-hero-navy to-hero-navy-deep pt-[calc(4.125rem+2.5rem)] pb-10 sm:pt-[calc(4.125rem+3rem)] sm:pb-14">
      <div
        className={cn(
          "content-container grid items-center gap-8",
          withAside && "lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]",
        )}
      >
        <div className="space-y-4">
          <Skeleton className="h-3 w-32 rounded-full bg-white/10" />
          <Skeleton className="h-10 w-80 max-w-full rounded-full bg-white/12" />
          <Skeleton className="h-4 w-full max-w-xl rounded-full bg-white/10" />
          <Skeleton className="h-4 w-2/3 max-w-md rounded-full bg-white/10" />
          <Skeleton className="h-11.5 w-48 rounded-full bg-white/12" />
        </div>
        {withAside ? (
          <Skeleton className="aspect-[4/3] w-full max-w-md justify-self-end rounded-bubble bg-white/10 max-lg:order-first" />
        ) : null}
      </div>
    </section>
  );
}

/** Grid of archive-card placeholders used by listing pages. */
function EntryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => `card-${index}`).map((key) => (
        <div key={key} className="overflow-hidden rounded-card border border-line bg-surface">
          <Skeleton className="aspect-video rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-5 w-4/5 rounded-full" />
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-2/3 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export { EntryGridSkeleton, PageHeroSkeleton };
