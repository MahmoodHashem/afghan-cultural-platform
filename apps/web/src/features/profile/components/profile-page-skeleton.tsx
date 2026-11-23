import { Skeleton } from "@/components/ui/skeleton";

const profileStatKeys = ["entries", "comments", "bookmarks"] as const;

/** Mirrors the profile dashboard: navy header with avatar and stats, pill tabs, entry cards. */
function ProfilePageSkeleton() {
  return (
    <section className="pb-16 lg:pb-20" aria-label="در حال بارگذاری پروفایل" aria-busy="true">
      <section className="bg-linear-155 from-hero-navy to-hero-navy-deep pt-[calc(3.5rem+env(safe-area-inset-top)+1.75rem)] pb-16 lg:pt-[calc(4.125rem+3rem)] lg:pb-20">
        <div className="content-container grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">
            <Skeleton className="size-27 rounded-full bg-white/12 lg:size-31" />
            <div className="flex flex-col items-center gap-2.5 sm:items-start">
              <Skeleton className="h-4 w-24 rounded-full bg-white/10" />
              <Skeleton className="h-9 w-56 rounded-full bg-white/12" />
              <Skeleton className="h-4 w-44 rounded-full bg-white/10" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-9 w-32 rounded-full bg-white/12" />
                <Skeleton className="h-9 w-28 rounded-full bg-white/12" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {profileStatKeys.map((key) => (
              <Skeleton
                key={key}
                className="h-19 min-w-24 rounded-[18px_18px_18px_6px] bg-white/10"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="content-container relative z-10 -mt-7 space-y-5 max-lg:px-4">
        <Skeleton className="mx-auto h-12 w-72 max-w-full rounded-full bg-surface shadow-lift lg:mx-0" />
        <Skeleton className="h-11 rounded-full" />
        <div className="flex flex-col items-center gap-3 rounded-card border-[1.5px] border-line bg-surface px-6 py-12 text-center">
          <Skeleton className="h-20 w-28 rounded-card" />
          <Skeleton className="h-6 w-52 max-w-full rounded-full" />
          <div className="flex w-full max-w-md flex-col items-center gap-2">
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-4/5 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-10 w-32 rounded-full" />
        </div>
      </section>
    </section>
  );
}

export { ProfilePageSkeleton };
