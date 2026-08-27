import { Skeleton } from "@/components/ui/skeleton";

const profileEntryLoadingKeys = ["first", "second", "third", "fourth"] as const;

function ProfilePageSkeleton() {
  return (
    <section
      className="content-container max-w-none space-y-4 px-0 pb-16 lg:max-w-(--container-content) lg:space-y-7"
      aria-label="در حال بارگذاری پروفایل"
    >
      <div className="border-y border-border bg-card p-4 lg:rounded-[28px] lg:border lg:p-6">
        <div className="flex flex-col items-center gap-3 lg:flex-row lg:gap-4">
          <Skeleton className="size-20 rounded-full" />
          <div className="flex-1 space-y-2 text-center lg:space-y-3 lg:text-start">
            <Skeleton className="mx-auto h-7 w-44 lg:mx-0 lg:h-8 lg:w-52" />
            <Skeleton className="mx-auto h-4 w-56 lg:mx-0 lg:h-5 lg:w-full lg:max-w-lg" />
            <Skeleton className="mx-auto h-4 w-40 lg:mx-0 lg:w-56" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 lg:mt-8 lg:gap-3">
          <Skeleton className="h-16 rounded-xl lg:h-20 lg:rounded-2xl" />
          <Skeleton className="h-16 rounded-xl lg:h-20 lg:rounded-2xl" />
          <Skeleton className="h-16 rounded-xl lg:h-20 lg:rounded-2xl" />
        </div>
      </div>
      <div className="space-y-3">
        {profileEntryLoadingKeys.map((key) => (
          <div
            key={`profile-entry-loading-${key}`}
            className="border-b border-border bg-card p-4 lg:rounded-2xl lg:border"
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
