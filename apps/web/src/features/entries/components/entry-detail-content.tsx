import { CalendarDaysIcon, MapPinIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { createTiptapHeadings, TiptapDocument } from "@/components/common/tiptap-document";
import type { PageBreadcrumbItem } from "@/components/layout/page-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EntryComments } from "@/features/engagement/components/entry-comments";
import type { EntryCommentListResponse } from "@/features/engagement/types/entry-engagement";
import { EntryActionRail } from "@/features/entries/components/entry-action-rail";
import { EntryDetailBreadcrumb } from "@/features/entries/components/entry-detail-breadcrumb";
import { EntryDetailHeaderContext } from "@/features/entries/components/entry-detail-header-context";
import { EntryTableOfContents } from "@/features/entries/components/entry-table-of-contents";
import { CommunityModerationActions } from "@/features/moderation/components/community-moderation-actions";
import { formatPersianDate } from "@/lib/utils/formatters";
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
    <main data-entry-detail className="min-h-screen bg-background pb-24 lg:pb-0">
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
        <section
          data-entry-intro
          className="border-b border-border bg-card pt-[calc(4.5rem+env(safe-area-inset-top))] pb-6 sm:pt-28 sm:pb-10"
        >
          <div className="content-container">
            <div className="hidden lg:block">
              <EntryDetailBreadcrumb
                entryPath={`/entries/${encodeURIComponent(entry.slug)}`}
                entryTitle={entry.title}
                fallbackItems={breadcrumbItems}
              />
            </div>

            <div className="grid gap-6 lg:mt-8 lg:grid-cols-[1fr_420px] lg:items-end lg:gap-8">
              <div className="space-y-4 sm:space-y-5">
                <div className="flex flex-wrap gap-2">
                  <Badge className="rounded-full bg-primary-light px-2.5 text-[11px] text-primary sm:text-[12px]">
                    {entry.category.name}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full px-2.5 text-[11px] sm:text-[12px]"
                  >
                    {entry.contentType.name}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full px-2.5 text-[11px] sm:text-[12px]"
                  >
                    {getEntryLocationLabel(entry)}
                  </Badge>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <h1 className="max-w-4xl text-[29px] font-bold leading-[1.55] text-foreground sm:text-[52px] sm:leading-[1.35]">
                    {entry.title}
                  </h1>
                  <p className="max-w-3xl text-[15px] leading-8 text-muted-foreground sm:text-[18px] sm:leading-9">
                    {entry.summary}
                  </p>
                </div>
                <EntryMeta entry={entry} />
              </div>

              {heroImage ? (
                <figure className="-mx-4 overflow-hidden border-y border-border bg-background sm:mx-0 sm:rounded-[28px] sm:border shadow-[0_2px_10px_rgba(0,0,0,.05)]">
                  <div className="relative aspect-4/3">
                    <Image
                      src={heroImage.secureUrl}
                      alt={heroImage.altText}
                      fill
                      priority
                      sizes="(min-width: 1024px) 420px, 100vw"
                      className="object-cover"
                    />
                  </div>
                  {heroImage.caption || heroImage.photographerOrSource ? (
                    <figcaption className="px-4 py-3 text-[13px] leading-6 text-muted-foreground">
                      {heroImage.caption ?? heroImage.photographerOrSource}
                    </figcaption>
                  ) : null}
                </figure>
              ) : null}
            </div>
          </div>
        </section>

        <section className="content-container grid gap-8 py-7 sm:py-10 lg:grid-cols-[56px_minmax(0,760px)_320px] lg:items-start lg:justify-between">
          <EntryActionRail
            entryId={entry.id}
            title={entry.title}
            initialComments={comments}
            likeCount={entry.likeCount}
            bookmarkCount={entry.bookmarkCount}
          />

          <div className="min-w-0 space-y-10">
            <TiptapDocument content={entry.contentJson} />

            {entry.images.length > 1 ? <ImageGallery images={entry.images.slice(1)} /> : null}
            {entry.youtubeVideo ? <YouTubeEmbed entry={entry} /> : null}
            {entry.sources.length > 0 ? <SourcesList entry={entry} /> : null}
            <div className="divide-y divide-border rounded-xl border border-border bg-card lg:hidden">
              <TaxonomyCard entry={entry} />
              {entry.tags.length > 0 ? <TagsCard entry={entry} /> : null}
              {entry.incomingReferences.length > 0 ? <IncomingReferences entry={entry} /> : null}
            </div>
            <CommunityModerationActions entryId={entry.id} />
            <EntryComments
              entryId={entry.id}
              initialComments={comments}
              renderedAt={commentsRenderedAt}
            />
          </div>

          <aside className="hidden space-y-5 divide-y divide-border rounded-lg bg-card p-3 lg:sticky lg:top-24 lg:block">
            {tableOfContents.length > 0 ? <EntryTableOfContents items={tableOfContents} /> : null}
            <TaxonomyCard entry={entry} />
            {entry.tags.length > 0 ? <TagsCard entry={entry} /> : null}
            {entry.incomingReferences.length > 0 ? <IncomingReferences entry={entry} /> : null}
          </aside>
        </section>
      </article>
    </main>
  );
}

function EntryMeta({ entry }: { entry: PublicEntryDetail }) {
  return (
    <dl className="flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-muted-foreground sm:gap-x-6 sm:gap-y-3 sm:text-[14px]">
      <div className="inline-flex items-center gap-2">
        <UserCircleIcon className="size-5" aria-hidden="true" />
        <dt className="sr-only">نویسنده</dt>
        <dd>{entry.author.displayName}</dd>
      </div>
      <div className="inline-flex items-center gap-2">
        <CalendarDaysIcon className="size-5" aria-hidden="true" />
        <dt className="sr-only">تاریخ انتشار</dt>
        <dd>{formatPersianDate(entry.publishedAt)}</dd>
      </div>
      <div className="inline-flex items-center gap-2">
        <MapPinIcon className="size-5" aria-hidden="true" />
        <dt className="sr-only">موقعیت</dt>
        <dd>{getEntryLocationLabel(entry)}</dd>
      </div>
    </dl>
  );
}

function ImageGallery({ images }: { images: PublicEntryDetail["images"] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-[26px] font-bold text-foreground">تصاویر بیشتر</h2>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0">
        {images.map((image) => (
          <figure
            key={image.id}
            className="w-[86vw] max-w-sm shrink-0 snap-center overflow-hidden rounded-xl border border-border bg-card sm:w-auto sm:max-w-none sm:rounded-2xl"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={image.secureUrl}
                alt={image.altText}
                fill
                sizes="(min-width: 1024px) 380px, 100vw"
                className="object-cover"
              />
            </div>
            {image.caption || image.photographerOrSource ? (
              <figcaption className="px-4 py-3 text-[13px] leading-6 text-muted-foreground">
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
      <h2 className="text-[26px] font-bold text-foreground">ویدیوی مرتبط</h2>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <iframe
          src={`https://www.youtube.com/embed/${video.videoId}`}
          title={video.title ?? `ویدیوی مرتبط با ${entry.title}`}
          className="aspect-video w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        {video.title || video.description ? (
          <div className="space-y-2 p-4">
            {video.title ? <h3 className="font-bold text-foreground">{video.title}</h3> : null}
            {video.description ? (
              <p className="text-[14px] leading-7 text-muted-foreground">{video.description}</p>
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
      <h2 className="text-[26px] font-bold text-foreground">منابع</h2>
      <div className="space-y-3">
        {entry.sources.map((source) => (
          <Card key={source.id} className="rounded-2xl border-border bg-card">
            <CardContent className="space-y-2 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full">
                  {sourceTypeLabel(source.type)}
                </Badge>
                {source.publicationDate ? (
                  <span className="text-[12px] text-muted-foreground">
                    {source.publicationDate}
                  </span>
                ) : null}
              </div>
              <h3 className="font-bold text-foreground">
                {source.websiteUrl ? (
                  <a
                    href={source.websiteUrl}
                    className="text-primary underline underline-offset-4"
                    rel="noreferrer"
                  >
                    {source.title ?? source.websiteUrl}
                  </a>
                ) : (
                  (source.title ?? "منبع بدون عنوان")
                )}
              </h3>
              {source.authorOrProvider ? (
                <p className="text-[14px] text-muted-foreground">{source.authorOrProvider}</p>
              ) : null}
              {source.bookOrArticleDetails || source.explanation ? (
                <p className="text-[14px] leading-7 text-muted-foreground">
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
    <article className="space-y-4 p-4">
      <h2 className="text-[18px] font-bold text-foreground">جزئیات مطلب</h2>
      <dl className="space-y-3">
        {items.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 text-[14px]">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-start font-semibold text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function TagsCard({ entry }: { entry: PublicEntryDetail }) {
  return (
    <article className=" space-y-4 p-4">
      <h2 className="text-[18px] font-bold text-foreground">برچسب‌ها</h2>
      <div className="flex flex-wrap gap-2">
        {entry.tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/explore?tagSlug=${encodeURIComponent(tag.slug)}`}
            className="rounded-full bg-muted px-3 py-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-primary-light hover:text-primary"
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
          className="block rounded-xl px-2 py-2 transition-colors hover:bg-muted"
        >
          <span className="block text-[14px] font-bold text-foreground">
            {reference.sourceEntry.title}
          </span>
          <span className="mt-1 line-clamp-2 text-[12px] leading-6 text-muted-foreground">
            {reference.sourceEntry.summary}
          </span>
        </Link>
      ))}
    </ReferenceCard>
  );
}

function ReferenceCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className=" space-y-3 p-4">
      <h2 className="text-[18px] font-bold text-foreground">{title}</h2>
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
