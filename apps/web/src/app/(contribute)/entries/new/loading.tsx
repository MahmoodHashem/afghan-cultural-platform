import { Skeleton } from "@/components/ui/skeleton";

export default function NewEntryLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-5 z-40 mx-auto max-w-5xl rounded-full border-b border-border bg-card/94 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
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
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="bg-background px-0 py-6 sm:px-8 lg:px-14">
          <Skeleton className="mb-8 h-12 w-3/4" />
          <Skeleton className="mb-12 h-28 w-full" />
          <Skeleton className="h-[72vh] w-full" />
        </div>
      </main>
    </div>
  );
}
