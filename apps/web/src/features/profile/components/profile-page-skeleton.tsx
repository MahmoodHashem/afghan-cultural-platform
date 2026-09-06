import { Skeleton } from "@/components/ui/skeleton";

const profileEntryLoadingKeys = ["first", "second", "third", "fourth"] as const;

function ProfilePageSkeleton() {
  return (
    <section
      className="content-container mb-0 max-w-none space-y-4 rounded-none bg-background px-0 pb-8 lg:mb-10 lg:max-w-(--container-content) lg:space-y-7 lg:rounded-xl lg:bg-card lg:p-6"
      aria-label="در حال بارگذاری پروفایل"
    >
      <div className="overflow-hidden bg-card lg:bg-transparent">
        <div className="relative px-4 py-4 lg:min-h-36 lg:px-8 lg:py-6">
          <div className="flex flex-col items-center justify-center gap-3 lg:gap-4">
            <div className="relative">
              <Skeleton className="size-20 rounded-full lg:size-28" />
              <Skeleton className="absolute right-1 bottom-0 size-9 rounded-full" />
            </div>
            <div className="flex min-w-0 flex-col items-center space-y-2">
              <Skeleton className="h-8 w-44 lg:h-10 lg:w-56" />
              <Skeleton className="h-4 w-56" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-32 rounded-lg" />
                <Skeleton className="h-9 w-24 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
          </div>
        </div>
        <div className="flex w-full justify-center border-y border-border/70 py-2 lg:gap-6 lg:border-0 lg:py-0">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex flex-1 items-center justify-center gap-0 lg:flex-none">
              <div className="flex min-w-20 flex-col items-center px-2 lg:px-3">
                <Skeleton className="h-8 w-14" />
                <Skeleton className="mt-1 h-4 w-12" />
              </div>
              {item < 3 ? <div className="h-7 w-px bg-border lg:bg-slate-300" /> : null}
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-full justify-center py-2">
        <Skeleton className="h-11 w-72 max-w-full rounded-full" />
      </div>

      <div className="space-y-4 px-3 pb-4 lg:p-4">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
        {profileEntryLoadingKeys.map((key) => (
          <div
            key={`profile-entry-loading-${key}`}
            className="border-b border-border bg-card px-4 py-4 lg:rounded-xl lg:border-0"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1 space-y-3">
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
