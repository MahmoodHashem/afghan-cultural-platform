import { PageHeroSkeleton } from "@/components/common/page-hero-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

const provinceKeys = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

function ProvincesLoading() {
  return (
    <main className="min-h-screen bg-paper" aria-busy="true" aria-label="در حال بارگذاری ولایت‌ها">
      <PageHeroSkeleton />
      <section className="content-container space-y-6 py-10 sm:py-12">
        <Skeleton className="h-11.5 w-full max-w-[420px]" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {provinceKeys.map((key) => (
            <Skeleton key={key} className="aspect-[4/5] rounded-arch" />
          ))}
        </div>
      </section>
    </main>
  );
}

export default ProvincesLoading;
