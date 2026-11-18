import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the writing studio: floating toolbar, the writing sheet and the guide column. */
export default function NewEntryLoading() {
  return (
    <div className="min-h-screen bg-paper" aria-busy="true">
      <div className="sticky top-[max(0.5rem,env(safe-area-inset-top))] z-40 mx-2 rounded-full border border-line-soft bg-header shadow-header md:top-5 md:mx-6 lg:mx-auto lg:max-w-288">
        <div className="flex h-14 items-center justify-between px-3 md:h-16">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-full" />
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-32 rounded-full" />
          </div>
        </div>
      </div>
      <main className="content-container grid gap-8 pt-5 pb-28 max-sm:px-3 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
        <div className="rounded-[28px_28px_28px_8px] border-line-soft bg-surface px-4 py-6 sm:border sm:px-10 sm:py-10 sm:shadow-card lg:px-14">
          <Skeleton className="mb-8 h-12 w-3/4 rounded-full" />
          <Skeleton className="mb-12 h-20 w-full" />
          <Skeleton className="h-[62dvh] w-full md:h-[56vh]" />
        </div>
        <div className="hidden space-y-4 lg:block">
          <Skeleton className="h-28 rounded-[22px_22px_22px_6px]" />
          <Skeleton className="h-64 rounded-card" />
          <Skeleton className="h-48 rounded-card" />
        </div>
      </main>
    </div>
  );
}
