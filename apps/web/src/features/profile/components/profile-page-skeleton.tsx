import { Skeleton } from "@/components/ui/skeleton";

const profileEntryLoadingKeys = ["first", "second", "third", "fourth"] as const;

function ProfilePageSkeleton() {
  return (
    <section className="content-container space-y-7 pb-16" aria-label="در حال بارگذاری پروفایل">
      <div className="rounded-[28px] border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-5 w-full max-w-lg" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </div>
      <div className="space-y-3">
        {profileEntryLoadingKeys.map((key) => (
          <div
            key={`profile-entry-loading-${key}`}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <Skeleton className="h-7 w-2/3" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-1/2" />
              </div>
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export { ProfilePageSkeleton };
