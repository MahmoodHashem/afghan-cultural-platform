import { Skeleton } from "@/components/ui/skeleton";

export default function NewEntryLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-border bg-card/94 pt-[env(safe-area-inset-top)] backdrop-blur-md md:top-5 md:mx-auto md:max-w-5xl md:rounded-full md:pt-0">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 md:h-auto md:py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-5xl px-4 pt-8 pb-28 sm:px-6 sm:py-10 lg:px-8">
        <div className="bg-background px-0 py-6 sm:px-8 lg:px-14">
          <Skeleton className="mb-8 h-12 w-3/4" />
          <Skeleton className="mb-12 h-28 w-full" />
          <Skeleton className="h-[62dvh] w-full md:h-[72vh]" />
        </div>
      </main>
    </div>
  );
}
