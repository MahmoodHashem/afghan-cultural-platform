import { PageHeroSkeleton } from "@/components/common/page-hero-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

const topicKeys = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

function CategoriesLoading() {
  return (
    <main
      className="min-h-screen bg-paper"
      aria-busy="true"
      aria-label="در حال بارگذاری موضوع‌ها"
    >
      <PageHeroSkeleton />
      <section className="content-container py-10 sm:py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {topicKeys.map((key) => (
            <Skeleton key={key} className="min-h-52 rounded-bubble" />
          ))}
        </div>
      </section>
    </main>
  );
}

export default CategoriesLoading;
