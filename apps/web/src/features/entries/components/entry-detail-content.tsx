import {
  ArrowRightIcon,
  CalendarDaysIcon,
  LinkIcon,
  MapPinIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EntryFeedback } from "@/features/entries/components/reviews/entry-feedback";
import { cn } from "@/lib/utils";
import type { PublicEntryDetail, PublicReview } from "../types/public-entry";

type TiptapNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: TiptapMark[];
  content?: TiptapNode[];
};

type TiptapMark = {
  type?: string;
  attrs?: Record<string, unknown>;
};

function EntryDetailContent({
  entry,
  reviews,
}: {
  entry: PublicEntryDetail;
  reviews: PublicReview[];
}) {
  const heroImage = entry.images[0] ?? entry.coverImage;

  return (
    <main className="min-h-screen bg-background">
      <article>
        <section className="border-b border-border bg-card pt-24 pb-10 sm:pt-28">
          <div className="content-container">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-primary transition-colors hover:text-primary-hover"
            >
              <ArrowRightIcon className="size-4" aria-hidden="true" />
              بازگشت به کاوش محتوا
            </Link>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  <Badge className="rounded-full bg-primary-light text-primary">
                    {entry.category.name}
                  </Badge>
                  <Badge variant="outline" className="rounded-full">
                    {entry.contentType.name}
                  </Badge>
                  <Badge variant="outline" className="rounded-full">
                    {locationLabel(entry)}
                  </Badge>
                </div>
                <div className="space-y-4">
                  <h1 className="max-w-4xl text-[38px] font-bold leading-[1.35] text-foreground sm:text-[52px]">
                    {entry.title}
                  </h1>
                  <p className="max-w-3xl text-[18px] leading-9 text-muted-foreground">
                    {entry.summary}
                  </p>
                </div>
                <EntryMeta entry={entry} />
              </div>

              {heroImage ? (
                <figure className="overflow-hidden rounded-[28px] border border-border bg-background shadow-[0_2px_10px_rgba(0,0,0,.05)]">
                  <div className="relative aspect-[4/3]">
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

        <section className="content-container grid gap-10 py-10 lg:grid-cols-[minmax(0,760px)_320px] lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-10">
            <TiptapDocument content={entry.contentJson} />

            {entry.images.length > 1 ? <ImageGallery images={entry.images.slice(1)} /> : null}
            {entry.youtubeVideo ? <YouTubeEmbed entry={entry} /> : null}
            {entry.sources.length > 0 ? <SourcesList entry={entry} /> : null}
            <EntryFeedback
              entryId={entry.id}
              entryTitle={entry.title}
              averageRating={entry.averageRating}
              ratingCount={entry.ratingCount}
            />
            <PublicReviewsList reviews={reviews} />
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24">
            <TaxonomyCard entry={entry} />
            {entry.tags.length > 0 ? <TagsCard entry={entry} /> : null}
            {entry.outgoingReferences.length > 0 ? <OutgoingReferences entry={entry} /> : null}
            {entry.incomingReferences.length > 0 ? <IncomingReferences entry={entry} /> : null}
          </aside>
        </section>
      </article>
    </main>
  );
}

function PublicReviewsList({ reviews }: { reviews: PublicReview[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[26px] font-bold text-foreground">دیدگاه‌های خوانندگان</h2>
        <span className="rounded-full bg-muted px-3 py-1 text-[13px] font-semibold text-muted-foreground">
          {formatNumber(reviews.length)} دیدگاه
        </span>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-foreground">{review.author.displayName}</h3>
                  <p className="text-[12px] text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[15px] leading-8 text-muted-foreground">{review.body}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-[14px] leading-7 text-muted-foreground">
          هنوز دیدگاهی برای این مدخل ثبت نشده است. اگر این محتوا برایتان مفید بود، نخستین دیدگاه را
          بنویسید.
        </div>
      )}
    </section>
  );
}

function EntryMeta({ entry }: { entry: PublicEntryDetail }) {
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-3 text-[14px] text-muted-foreground">
      <div className="inline-flex items-center gap-2">
        <UserCircleIcon className="size-5" aria-hidden="true" />
        <dt className="sr-only">نویسنده</dt>
        <dd>{entry.author.displayName}</dd>
      </div>
      <div className="inline-flex items-center gap-2">
        <CalendarDaysIcon className="size-5" aria-hidden="true" />
        <dt className="sr-only">تاریخ انتشار</dt>
        <dd>{formatDate(entry.publishedAt)}</dd>
      </div>
      <div className="inline-flex items-center gap-2">
        <MapPinIcon className="size-5" aria-hidden="true" />
        <dt className="sr-only">موقعیت</dt>
        <dd>{locationLabel(entry)}</dd>
      </div>
    </dl>
  );
}

function TiptapDocument({ content }: { content: unknown }) {
  const root = isTiptapNode(content) ? content : undefined;
  const children = root?.content ?? [];

  if (children.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-muted-foreground">
        متن کامل این مدخل هنوز برای نمایش آماده نیست.
      </div>
    );
  }

  return (
    <div className="article-container mx-0 max-w-none space-y-5 text-[18px] leading-9 text-foreground">
      {children.map((node, index) => renderNode(node, index))}
    </div>
  );
}

function renderNode(node: TiptapNode, key: number | string): ReactNode {
  const children = renderChildren(node.content);
  const textAlign = getTextAlignClass(node.attrs);

  switch (node.type) {
    case "paragraph":
      return (
        <p key={key} dir={getDirection(node.attrs)} className={cn("leading-9", textAlign)}>
          {children.length > 0 ? children : "\u00A0"}
        </p>
      );
    case "heading": {
      const level = node.attrs?.level === 3 ? 3 : 2;
      const className = cn(
        "pt-4 font-bold leading-[1.45] text-foreground",
        level === 3 ? "text-[24px]" : "text-[30px]",
        textAlign,
      );

      return level === 3 ? (
        <h3 key={key} dir={getDirection(node.attrs)} className={className}>
          {children}
        </h3>
      ) : (
        <h2 key={key} dir={getDirection(node.attrs)} className={className}>
          {children}
        </h2>
      );
    }
    case "bulletList":
      return (
        <ul key={key} className="list-disc space-y-2 pe-5 ps-0 marker:text-primary">
          {children}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={key} className="list-decimal space-y-2 pe-5 ps-0 marker:text-primary">
          {children}
        </ol>
      );
    case "listItem":
      return (
        <li key={key} className="leading-9">
          {children}
        </li>
      );
    case "blockquote":
      return (
        <blockquote
          key={key}
          className="border-s-4 border-primary bg-primary-light/50 py-4 ps-5 pe-4 text-foreground"
        >
          {children}
        </blockquote>
      );
    case "horizontalRule":
      return <hr key={key} className="border-border" />;
    case "hardBreak":
      return <br key={key} />;
    case "text":
      return applyMarks(node.text ?? "", node.marks, key);
    default:
      return null;
  }
}

function renderChildren(children: TiptapNode[] | undefined) {
  return (children ?? []).map((child, index) => renderNode(child, index)).filter(Boolean);
}

function applyMarks(text: string, marks: TiptapMark[] | undefined, key: number | string) {
  return (marks ?? []).reduce<ReactNode>((current, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong key={`${key}-bold`}>{current}</strong>;
      case "italic":
        return <em key={`${key}-italic`}>{current}</em>;
      case "underline":
        return (
          <span key={`${key}-underline`} className="underline underline-offset-4">
            {current}
          </span>
        );
      case "link": {
        const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : undefined;

        if (!href) {
          return current;
        }

        return (
          <a
            key={`${key}-link`}
            href={href}
            className="font-semibold text-primary underline underline-offset-4"
            rel="noreferrer"
          >
            {current}
          </a>
        );
      }
      case "internalEntryLink": {
        const targetSlug =
          typeof mark.attrs?.targetSlug === "string" ? mark.attrs.targetSlug : undefined;

        if (!targetSlug) {
          return current;
        }

        return (
          <Link
            key={`${key}-internal`}
            href={`/entries/${encodeURIComponent(targetSlug)}`}
            className="font-semibold text-primary underline underline-offset-4"
          >
            {current}
          </Link>
        );
      }
      default:
        return current;
    }
  }, text);
}

function ImageGallery({ images }: { images: PublicEntryDetail["images"] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-[26px] font-bold text-foreground">تصاویر بیشتر</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {images.map((image) => (
          <figure
            key={image.id}
            className="overflow-hidden rounded-2xl border border-border bg-card"
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
    ["گستره", locationLabel(entry)],
    ["ولایت", entry.province?.name],
    ["ولسوالی", entry.district?.name],
    ["موقعیت", entry.villageOrLocation],
    ["دسته‌بندی", entry.category.name],
    ["نوع محتوا", entry.contentType.name],
  ].filter(([, value]) => Boolean(value));

  return (
    <Card className="rounded-2xl border-border bg-card">
      <CardContent className="space-y-4 p-4">
        <h2 className="text-[18px] font-bold text-foreground">جزئیات مدخل</h2>
        <dl className="space-y-3">
          {items.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 text-[14px]">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-start font-semibold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function TagsCard({ entry }: { entry: PublicEntryDetail }) {
  return (
    <Card className="rounded-2xl border-border bg-card">
      <CardContent className="space-y-4 p-4">
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
      </CardContent>
    </Card>
  );
}

function OutgoingReferences({ entry }: { entry: PublicEntryDetail }) {
  return (
    <ReferenceCard title="پیوندهای درون‌متنی">
      {entry.outgoingReferences.map((reference) => (
        <Link
          key={reference.id}
          href={`/entries/${encodeURIComponent(reference.targetEntry.slug)}`}
          className="flex items-start gap-2 rounded-xl px-2 py-2 text-[14px] leading-7 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
        >
          <LinkIcon className="mt-1 size-4 shrink-0" aria-hidden="true" />
          <span>{reference.anchorText || reference.targetEntry.title}</span>
        </Link>
      ))}
    </ReferenceCard>
  );
}

function IncomingReferences({ entry }: { entry: PublicEntryDetail }) {
  return (
    <ReferenceCard title="مدخل‌های مرتبط">
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
    <Card className="rounded-2xl border-border bg-card">
      <CardContent className="space-y-3 p-4">
        <h2 className="text-[18px] font-bold text-foreground">{title}</h2>
        <div className="space-y-1">{children}</div>
      </CardContent>
    </Card>
  );
}

function isTiptapNode(value: unknown): value is TiptapNode {
  return typeof value === "object" && value !== null && "type" in value;
}

function getDirection(attrs: Record<string, unknown> | undefined) {
  return attrs?.dir === "ltr" ? "ltr" : "rtl";
}

function getTextAlignClass(attrs: Record<string, unknown> | undefined) {
  switch (attrs?.textAlign) {
    case "center":
      return "text-center";
    case "left":
      return "text-left";
    default:
      return "text-start";
  }
}

function locationLabel(entry: PublicEntryDetail) {
  if (entry.geographicScope === "NATIONAL") {
    return "سراسر افغانستان";
  }

  if (entry.geographicScope === "NONE") {
    return "بدون وابستگی جغرافیایی";
  }

  return entry.province?.name ?? "ولایت مشخص";
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-AF", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-AF").format(value);
}

export { EntryDetailContent };
