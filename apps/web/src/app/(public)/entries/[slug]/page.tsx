import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageTransition } from "@/components/layout/page-transition";
import { EngagementAccessProvider } from "@/features/engagement/components/engagement-access-provider";
import {
  getPublicEntryComments,
  getPublishedEntryBySlug,
} from "@/features/entries/api/public-entries-api";
import { EntryDetailContent } from "@/features/entries/components/entry-detail-content";
import { EntryScrollControls } from "@/features/entries/components/entry-scroll-controls";
import { createEntryDetailBreadcrumbItems } from "@/features/entries/utils/entry-breadcrumb";
import { createCanonicalPath, publicOpenGraphDefaults } from "@/lib/seo/metadata";

type EntryDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: EntryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getPublishedEntryBySlug(slug);

  if (!entry) {
    return {
      title: "مطلب پیدا نشد",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: entry.seo.title,
    description: entry.seo.summary,
    alternates: {
      canonical: createCanonicalPath("entries", entry.seo.canonicalSlug),
    },
    openGraph: {
      ...publicOpenGraphDefaults,
      title: entry.seo.title,
      description: entry.seo.summary,
      images: entry.seo.image ? [entry.seo.image] : ["/images/HERAT02.jpg"],
      publishedTime: entry.seo.publishedAt,
      modifiedTime: entry.seo.modifiedAt,
      authors: [entry.seo.author],
    },
  };
}

export default async function EntryDetailPage({ params }: EntryDetailPageProps) {
  const { slug } = await params;
  const entry = await getPublishedEntryBySlug(slug);

  if (!entry) {
    notFound();
  }

  const comments = await getPublicEntryComments(entry.id, entry.commentCount);
  const breadcrumbItems = createEntryDetailBreadcrumbItems(entry.title);

  return (
    <>
      <PageTransition>
        <EngagementAccessProvider
          entryId={entry.id}
          entryPath={`/entries/${encodeURIComponent(entry.slug)}`}
        >
          <EntryDetailContent entry={entry} comments={comments} breadcrumbItems={breadcrumbItems} />
        </EngagementAccessProvider>
      </PageTransition>
      <EntryScrollControls />
    </>
  );
}
