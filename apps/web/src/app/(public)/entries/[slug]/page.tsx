import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageTransition } from "@/components/layout/page-transition";
import {
  getPublicEntryReviews,
  getPublishedEntryBySlug,
} from "@/features/entries/api/public-entries-api";
import { EntryDetailContent } from "@/features/entries/components/entry-detail-content";
import {
  createEntryDetailBreadcrumbItems,
  type EntryBreadcrumbSearchParams,
} from "@/features/entries/utils/entry-breadcrumb";

type EntryDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<EntryBreadcrumbSearchParams>;
};

export async function generateMetadata({ params }: EntryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getPublishedEntryBySlug(slug);

  if (!entry) {
    return {
      title: "مطلب پیدا نشد | میراث افغانستان",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${entry.seo.title} | میراث افغانستان`,
    description: entry.seo.summary,
    openGraph: {
      title: entry.seo.title,
      description: entry.seo.summary,
      images: entry.seo.image ? [entry.seo.image] : ["/images/HERAT02.jpg"],
      publishedTime: entry.seo.publishedAt,
      modifiedTime: entry.seo.modifiedAt,
      authors: [entry.seo.author],
    },
  };
}

export default async function EntryDetailPage({ params, searchParams }: EntryDetailPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const entry = await getPublishedEntryBySlug(slug);

  if (!entry) {
    notFound();
  }

  const reviews = await getPublicEntryReviews(entry.id);
  const breadcrumbItems = createEntryDetailBreadcrumbItems(entry.title, resolvedSearchParams);

  return (
    <PageTransition>
      <EntryDetailContent entry={entry} reviews={reviews} breadcrumbItems={breadcrumbItems} />
    </PageTransition>
  );
}
