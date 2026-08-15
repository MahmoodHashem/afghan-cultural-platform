import { Skeleton } from "@/components/ui/skeleton";

function CategoriesLoading() {
  return (
    <main className="min-h-screen bg-background" aria-busy="true" aria-label="در حال بارگذاری صفحه">
      <section className="content-container pt-32 pb-16 sm:pt-36">
        <div className="max-w-3xl space-y-5">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-12 w-full max-w-xl rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full max-w-2xl rounded-full" />
            <Skeleton className="h-4 w-4/5 max-w-xl rounded-full" />
          </div>
          <Skeleton className="h-10 w-40 rounded-full" />
        </div>
      </section>
    </main>
  );
}

export default CategoriesLoading;
