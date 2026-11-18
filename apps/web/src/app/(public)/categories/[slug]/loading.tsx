import { EntryGridSkeleton, PageHeroSkeleton } from "@/components/common/page-hero-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

const tabKeys = ["a", "b", "c", "d", "e"] as const;

function CategoryDetailLoading() {
  return (
    <main
      className="min-h-screen bg-paper"
      aria-busy="true"
      aria-label="در حال بارگذاری صفحه موضوع"
    >
      <PageHeroSkeleton withAside />
      <section className="content-container space-y-6 py-10 sm:py-12">
        <Skeleton className="h-9 w-64 rounded-full" />
        <div className="flex gap-2 overflow-hidden">
          {tabKeys.map((key) => (
            <Skeleton key={key} className="h-10 w-24 shrink-0 rounded-full" />
          ))}
        </div>
        <EntryGridSkeleton />
      </section>
    </main>
  );
}

export default CategoryDetailLoading;
