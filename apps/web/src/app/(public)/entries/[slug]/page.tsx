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
import { JsonLd } from "@/lib/seo/json-ld";
import { createCanonicalPath, createSocialMetadata } from "@/lib/seo/metadata";
import { createArticleStructuredData } from "@/lib/seo/structured-data";

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

  const canonicalPath = createCanonicalPath("entries", entry.seo.canonicalSlug);
  const coverImage = entry.coverImage;

  return {
    title: entry.seo.title,
    description: entry.seo.summary,
    alternates: { canonical: canonicalPath },
    ...createSocialMetadata({
      title: entry.seo.title,
      description: entry.seo.summary,
      canonicalPath,
      image: coverImage
        ? {
            url: coverImage.secureUrl,
            width: coverImage.width,
            height: coverImage.height,
            alt: coverImage.altText,
          }
        : null,
      article: {
        publishedTime: entry.seo.publishedAt,
        modifiedTime: entry.seo.modifiedAt,
        section: entry.category.name,
        tags: entry.tags.map((tag) => tag.name),
      },
    }),
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
  const canonicalPath = createCanonicalPath("entries", entry.seo.canonicalSlug);

  return (
    <>
      <JsonLd
        data={createArticleStructuredData({
          headline: entry.seo.title,
          description: entry.seo.summary,
          canonicalPath,
          authorName: entry.seo.author,
          publishedAt: entry.seo.publishedAt,
          modifiedAt: entry.seo.modifiedAt,
          images: entry.images.map((image) => image.secureUrl),
          category: entry.category.name,
          tags: entry.tags.map((tag) => tag.name),
        })}
      />
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
