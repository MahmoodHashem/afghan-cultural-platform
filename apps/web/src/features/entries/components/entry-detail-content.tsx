import { CalendarDaysIcon, MapPinIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { PageHero } from "@/components/common/page-hero";
import { SectionHead } from "@/components/common/section-head";
import { createTiptapHeadings, TiptapDocument } from "@/components/common/tiptap-document";
import type { PageBreadcrumbItem } from "@/components/layout/page-breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EntryComments } from "@/features/engagement/components/entry-comments";
import type { EntryCommentListResponse } from "@/features/engagement/types/entry-engagement";
import { EntryActionRail } from "@/features/entries/components/entry-action-rail";
import { EntryDetailBreadcrumb } from "@/features/entries/components/entry-detail-breadcrumb";
import { EntryDetailHeaderContext } from "@/features/entries/components/entry-detail-header-context";
import { EntryTableOfContents } from "@/features/entries/components/entry-table-of-contents";
import { CommunityModerationActions } from "@/features/moderation/components/community-moderation-actions";
import { cn } from "@/lib/utils";
import { formatPersianDate } from "@/lib/utils/formatters";
import { createUserInitials, getUserAvatarColorClass } from "@/lib/utils/user";
import type { PublicEntryDetail } from "../types/public-entry";
import { getEntryLocationLabel } from "../utils/geography";

function EntryDetailContent({
  entry,
  comments,
  breadcrumbItems,
}: {
  entry: PublicEntryDetail;
  comments: EntryCommentListResponse;
  breadcrumbItems: PageBreadcrumbItem[];
}) {
  const heroImage = entry.images[0] ?? entry.coverImage;
  const tableOfContents = createTiptapHeadings(entry.contentJson);
  const commentsRenderedAt = new Date().toISOString();

  return (
    <main data-entry-detail className="min-h-screen bg-paper pb-24 lg:pb-0">
      <EntryDetailHeaderContext
        title={entry.title}
        backHref="/explore"
        hasTableOfContents={tableOfContents.length > 0}
      />
      {tableOfContents.length > 0 ? (
        <div className="lg:hidden">
          <EntryTableOfContents items={tableOfContents} variant="drawer" />
        </div>
      ) : null}
      <article>
        <section data-entry-intro>
          <PageHero
            overlap={Boolean(heroImage)}
            breadcrumb={
              <div className="hidden lg:block">
                <EntryDetailBreadcrumb
                  entryPath={`/entries/${encodeURIComponent(entry.slug)}`}
                  entryTitle={entry.title}
                  fallbackItems={breadcrumbItems}
                  tone="onDark"
                />
              </div>
            }
            title={
              <span className="block max-w-[26ch] text-[24px] leading-[1.75] sm:text-[31px] sm:leading-[1.8]">
                {entry.title}
              </span>
            }
            description={entry.summary}
            word={entry.category.name}
            actions={
              <div className="w-full space-y-5">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="glass">{entry.category.name}</Badge>
                  <Badge variant="glass">{entry.contentType.name}</Badge>
                  <Badge variant="glass">{getEntryLocationLabel(entry)}</Badge>
                </div>
                <EntryMeta entry={entry} />
              </div>
            }
          />

          {heroImage ? (
            <figure className="relative z-10 mx-auto -mt-56 mb-2 w-[min(100%-2rem,var(--container-article))] rounded-[26px_26px_26px_10px] bg-surface p-3 pb-11 shadow-figure sm:-mt-60">
              <span
                aria-hidden="true"
                className="absolute -top-2 end-10 z-10 h-16 w-3.5 bg-primary [clip-path:polygon(0_0,100%_0,100%_100%,50%_calc(100%-8px),0_100%)]"
              />
              <div className="relative aspect-[15/8] overflow-hidden rounded-[16px_16px_16px_4px] border border-line bg-media-ph">
                <Image
                  src={heroImage.secureUrl}
                  alt={heroImage.altText}
                  fill
                  priority
                  sizes="(min-width: 1024px) 780px, 100vw"
                  className="object-cover"
                />
              </div>
              {heroImage.caption || heroImage.photographerOrSource ? (
                <figcaption className="absolute inset-x-4 bottom-2.5 truncate text-center text-[12px] leading-6 text-faint">
                  {heroImage.caption ?? heroImage.photographerOrSource}
                </figcaption>
              ) : null}
            </figure>
          ) : null}
        </section>

        <section className="content-container grid gap-8 py-8 sm:py-10 lg:grid-cols-[56px_minmax(0,1fr)_minmax(0,320px)] lg:items-start lg:gap-10">
          <EntryActionRail
            entryId={entry.id}
            title={entry.title}
            summary={entry.summary}
            initialComments={comments}
            likeCount={entry.likeCount}
            bookmarkCount={entry.bookmarkCount}
          />

          <div className="min-w-0 space-y-12">
            <TiptapDocument content={entry.contentJson} />

            {entry.images.length > 1 ? <ImageGallery images={entry.images.slice(1)} /> : null}
            {entry.youtubeVideo ? <YouTubeEmbed entry={entry} /> : null}
            {entry.sources.length > 0 ? <SourcesList entry={entry} /> : null}
            <div className="space-y-4 lg:hidden">
              <TaxonomyCard entry={entry} />
              {entry.tags.length > 0 ? <TagsCard entry={entry} /> : null}
              {entry.incomingReferences.length > 0 ? <IncomingReferences entry={entry} /> : null}
            </div>
            <ContributeNote />
            <CommunityModerationActions entryId={entry.id} />
            <EntryComments
              entryId={entry.id}
              initialComments={comments}
              renderedAt={commentsRenderedAt}
            />
          </div>

          <aside className="hidden space-y-4 lg:sticky lg:top-24 lg:block">
            {tableOfContents.length > 0 ? (
              <div className="rounded-card border border-line-soft bg-surface shadow-card">
                <EntryTableOfContents items={tableOfContents} />
              </div>
            ) : null}
            <TaxonomyCard entry={entry} />
            {entry.tags.length > 0 ? <TagsCard entry={entry} /> : null}
            {entry.incomingReferences.length > 0 ? <IncomingReferences entry={entry} /> : null}
          </aside>
        </section>
      </article>
    </main>
  );
}

/** Invites readers to add what they know: corrections, sources or a related story. */
function ContributeNote() {
  return (
    <aside className="flex flex-wrap items-center gap-4 rounded-card border-[1.5px] border-dashed border-line bg-surface/60 px-5 py-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-ink">
        <PencilSquareIcon className="size-5" aria-hidden="true" />
      </span>
      <p className="min-w-0 flex-1 text-[12.5px] leading-[1.9] text-faint">
        <b className="block text-[14px] text-ink">شما هم چیزی از این موضوع می‌دانید؟</b>
        روایت، عکس یا منبعی دارید که این مطلب را کامل‌تر می‌کند؟ آن را برای دیگران ثبت کنید.
      </p>
      <Link href="/entries/new" className={buttonVariants({ variant: "pill" })}>
        نوشتن مطلب مرتبط
      </Link>
    </aside>
  );
}

function EntryMeta({ entry }: { entry: PublicEntryDetail }) {
  return (
    <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-white/75">
      <div className="inline-flex items-center gap-2">
        <Avatar size="default" className="size-7 bg-white/12 ring-1 ring-white/25">
          {entry.author.profileImageUrl ? (
            <AvatarImage src={entry.author.profileImageUrl} alt="" />
          ) : null}
          <AvatarFallback
            className={cn("text-[10px] font-bold", getUserAvatarColorClass(entry.author.id))}
          >
            {createUserInitials(entry.author.displayName)}
          </AvatarFallback>
        </Avatar>
        <dt className="sr-only">نویسنده</dt>
        <dd className="font-bold text-white">{entry.author.displayName}</dd>
      </div>
      <div className="inline-flex items-center gap-1.5">
        <CalendarDaysIcon className="size-4" aria-hidden="true" />
        <dt className="sr-only">تاریخ انتشار</dt>
        <dd>{formatPersianDate(entry.publishedAt)}</dd>
      </div>
      <div className="inline-flex items-center gap-1.5">
        <MapPinIcon className="size-4" aria-hidden="true" />
        <dt className="sr-only">موقعیت</dt>
        <dd>{getEntryLocationLabel(entry)}</dd>
      </div>
    </dl>
  );
}

function ImageGallery({ images }: { images: PublicEntryDetail["images"] }) {
  return (
    <section className="space-y-4">
      <SectionHead title="تصاویر بیشتر" size="prose" />
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0">
        {images.map((image) => (
          <figure
            key={image.id}
            className="w-[86vw] max-w-sm shrink-0 snap-center overflow-hidden rounded-bubble-md border border-line-soft bg-surface shadow-card sm:w-auto sm:max-w-none"
          >
            <div className="relative aspect-4/3">
              <Image
                src={image.secureUrl}
                alt={image.altText}
                fill
                sizes="(min-width: 1024px) 380px, 100vw"
                className="object-cover"
              />
            </div>
            {image.caption || image.photographerOrSource ? (
              <figcaption className="px-4 py-3 text-[12px] leading-6 text-faint">
                {image.caption ?? image.photographerOrSource}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </section>
  );
}

function YouTubeEmbed({ entry }: { entry: PublicEntryDetail }) {
  const video = entry.youtubeVideo;

  if (!video) {
    return null;
  }

  return (
    <section className="space-y-4">
      <SectionHead title="ویدیوی مرتبط" size="prose" />
      <div className="overflow-hidden rounded-card border border-line-soft bg-surface shadow-card">
        <iframe
          src={`https://www.youtube.com/embed/${video.videoId}`}
          title={video.title ?? `ویدیوی مرتبط با ${entry.title}`}
          className="aspect-video w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        {video.title || video.description ? (
          <div className="space-y-2 p-4">
            {video.title ? <h3 className="text-[15px] font-bold text-ink">{video.title}</h3> : null}
            {video.description ? (
              <p className="text-[13px] leading-7 text-copy">{video.description}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SourcesList({ entry }: { entry: PublicEntryDetail }) {
  return (
    <section className="space-y-4">
      <SectionHead title="منابع" size="prose" />
      <div className="space-y-3">
        {entry.sources.map((source) => (
          <Card key={source.id} size="sm">
            <CardContent className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="chip">{sourceTypeLabel(source.type)}</Badge>
                {source.publicationDate ? (
                  <span className="text-[12px] text-faint">{source.publicationDate}</span>
                ) : null}
              </div>
              <h3 className="text-[14.5px] font-bold text-ink">
                {source.websiteUrl ? (
                  <a
                    href={source.websiteUrl}
                    className="text-brand-ink underline decoration-1 underline-offset-4"
                    rel="noreferrer"
                  >
                    {source.title ?? source.websiteUrl}
                  </a>
                ) : (
                  (source.title ?? "منبع بدون عنوان")
                )}
              </h3>
              {source.authorOrProvider ? (
                <p className="text-[13px] text-copy">{source.authorOrProvider}</p>
              ) : null}
              {source.bookOrArticleDetails || source.explanation ? (
                <p className="text-[13px] leading-7 text-copy">
                  {source.bookOrArticleDetails ?? source.explanation}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function TaxonomyCard({ entry }: { entry: PublicEntryDetail }) {
  const items = [
    ["محدوده جغرافیایی", getEntryLocationLabel(entry)],
    ["ولایت", entry.province?.name],
    ["ولسوالی", entry.district?.name],
    ["موقعیت", entry.villageOrLocation],
    ["موضوع", entry.category.name],
    ["نوع محتوا", entry.contentType.name],
  ].filter(([, value]) => Boolean(value));

  return (
    <article className="space-y-3 rounded-card border border-line-soft bg-surface p-5 shadow-card">
      <SectionHead title="جزئیات مطلب" size="prose" as="h2" />
      <dl className="space-y-3">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="flex items-start justify-between gap-4 border-b border-line-soft pb-2 text-[13px] last:border-0 last:pb-0"
          >
            <dt className="text-faint">{label}</dt>
            <dd className="text-start font-bold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function TagsCard({ entry }: { entry: PublicEntryDetail }) {
  return (
    <article className="space-y-3 rounded-card border border-line-soft bg-surface p-5 shadow-card">
      <SectionHead title="برچسب‌ها" size="prose" as="h2" />
      <div className="flex flex-wrap gap-2">
        {entry.tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/explore?tagSlug=${encodeURIComponent(tag.slug)}`}
            className="rounded-full border border-line bg-surface px-3 py-1 text-[12.5px] font-medium text-copy transition-colors duration-200 hover:border-brand hover:bg-brand-soft hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </article>
  );
}

function IncomingReferences({ entry }: { entry: PublicEntryDetail }) {
  return (
    <ReferenceCard title="مطالب مرتبط">
      {entry.incomingReferences.map((reference) => (
        <Link
          key={reference.id}
          href={`/entries/${encodeURIComponent(reference.sourceEntry.slug)}`}
          className="group block rounded-bubble-sm px-2.5 py-2 transition-colors duration-200 hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span className="block text-[13.5px] font-bold text-ink group-hover:text-brand-ink">
            {reference.sourceEntry.title}
          </span>
          <span className="mt-1 line-clamp-2 text-[12px] leading-6 text-faint">
            {reference.sourceEntry.summary}
          </span>
        </Link>
      ))}
    </ReferenceCard>
  );
}

function ReferenceCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3 rounded-card border border-line-soft bg-surface p-5 shadow-card">
      <SectionHead title={title} size="prose" as="h2" />
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function sourceTypeLabel(type: string) {
  const labels: Record<string, string> = {
    BOOK: "کتاب",
    ARTICLE: "مقاله",
    WEBSITE: "وب‌سایت",
    INTERVIEW: "مصاحبه",
    ORAL_HISTORY: "روایت شفاهی",
    PERSONAL_EXPERIENCE: "تجربه شخصی",
    OTHER: "دیگر",
  };

  return labels[type] ?? "منبع";
}

export { EntryDetailContent };
