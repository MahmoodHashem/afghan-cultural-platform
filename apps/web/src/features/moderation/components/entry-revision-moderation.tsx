"use client";

import { CalendarDaysIcon, TagIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { TiptapDocument } from "@/components/common/tiptap-document";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  useRevisionModerationDecision,
  useRevisionModerationDetail,
  useRevisionModerationQueue,
} from "@/features/moderation/hooks/use-entry-revisions";
import type { ModerationDecision } from "@/features/moderation/types/moderation";
import { cn } from "@/lib/utils";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";
import { ModerationDecisionDialog } from "./moderation-decision-dialog";
import {
  ModerationImageGallery,
  ModerationSources,
  ModerationVideo,
} from "./moderation-review-page";

function EntryRevisionQueue() {
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const query = useRevisionModerationQueue(page);

  return (
    <section className="content-container space-y-7 pb-16">
      <PageBreadcrumb items={[{ label: "خانه", href: "/" }, { label: "ویرایش‌های منتشرشده" }]} />
      <header className="space-y-2">
        <p className="text-[13px] font-semibold text-primary">مدیریت محتوا</p>
        <h1 className="text-[30px] font-bold text-foreground sm:text-[38px]">ویرایش‌های منتشرشده</h1>
        <p className="text-[15px] leading-8 text-muted-foreground">
          تغییرات پیشنهادی نویسندگان را بدون تأثیر بر نسخه فعلی سایت بررسی کنید.
        </p>
      </header>
      {query.isLoading ? (
        <div className="rounded-xl border border-border p-8 text-muted-foreground">
          در حال دریافت ویرایش‌ها...
        </div>
      ) : null}
      {query.isError ? (
        <div className="rounded-xl border border-destructive/20 p-8 text-destructive">
          صف ویرایش‌ها باز نشد.
        </div>
      ) : null}
      {query.data?.data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          ویرایشی در انتظار بررسی نیست.
        </div>
      ) : null}
      <div className="space-y-3">
        {query.data?.data.map((revision) => (
          <article
            key={revision.revisionId}
            className="grid gap-4 rounded-xl border border-border bg-card p-4 lg:grid-cols-[1fr_auto_auto] lg:items-center"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-foreground">{revision.title}</h2>
                <Badge variant="outline">ویرایش منتشرشده</Badge>
              </div>
              <p className="mt-2 line-clamp-1 text-[13px] text-muted-foreground">
                {revision.summary}
              </p>
            </div>
            <div className="space-y-1 text-[13px] text-muted-foreground">
              <span className="flex items-center gap-2">
                <UserCircleIcon className="size-4" />
                {revision.author?.displayName}
              </span>
              <span className="flex items-center gap-2">
                <CalendarDaysIcon className="size-4" />
                {revision.updatedAt ? formatPersianDate(revision.updatedAt) : "نامشخص"}
              </span>
            </div>
            <Link
              href={`/moderator/revisions/${revision.revisionId}`}
              className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
            >
              بررسی تغییرات
            </Link>
          </article>
        ))}
      </div>
      {query.data && query.data.meta.totalPages > 1 ? (
        <nav className="flex justify-center gap-3" aria-label="صفحه‌بندی ویرایش‌ها">
          <Link
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full",
              page <= 1 && "pointer-events-none opacity-50",
            )}
            href={`/moderator/revisions?page=${Math.max(1, page - 1)}`}
          >
            قبلی
          </Link>
          <span className="py-2 text-[13px] text-muted-foreground">
            {formatPersianNumber(page)} از {formatPersianNumber(query.data.meta.totalPages)}
          </span>
          <Link
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full",
              page >= query.data.meta.totalPages && "pointer-events-none opacity-50",
            )}
            href={`/moderator/revisions?page=${Math.min(query.data.meta.totalPages, page + 1)}`}
          >
            بعدی
          </Link>
        </nav>
      ) : null}
    </section>
  );
}

function EntryRevisionReview({ revisionId }: { revisionId: string }) {
  const router = useRouter();
  const query = useRevisionModerationDetail(revisionId);
  const decisionMutation = useRevisionModerationDecision();
  const [decision, setDecision] = useState<ModerationDecision | null>(null);

  if (query.isLoading)
    return (
      <div className="content-container py-16 text-muted-foreground">
        در حال آماده‌سازی ویرایش...
      </div>
    );
  if (!query.data || query.isError)
    return <div className="content-container py-16 text-destructive">ویرایش مورد نظر باز نشد.</div>;
  const revision = query.data;

  return (
    <article className="content-container space-y-8 pb-16">
      <PageBreadcrumb
        items={[{ label: "ویرایش‌ها", href: "/moderator/revisions" }, { label: revision.title }]}
      />
      <header className="border-b border-border pb-7">
        <div className="flex flex-wrap gap-2">
          <Badge>{revision.category?.name}</Badge>
          <Badge variant="outline">{revision.contentType?.name}</Badge>
        </div>
        <h1 className="mt-4 text-[34px] font-bold leading-[1.45]">{revision.title}</h1>
        <p className="mt-3 max-w-3xl text-[16px] leading-8 text-muted-foreground">
          {revision.summary}
        </p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
          <span className="flex items-center gap-2">
            <UserCircleIcon className="size-4" aria-hidden="true" />
            {revision.author?.displayName ?? "نویسنده نامشخص"}
          </span>
          <span className="flex items-center gap-2">
            <CalendarDaysIcon className="size-4" aria-hidden="true" />
            {revision.submittedAt
              ? `ارسال‌شده در ${formatPersianDate(revision.submittedAt)}`
              : `ویرایش‌شده در ${formatPersianDate(revision.updatedAt)}`}
          </span>
          {revision.revisionVersion ? (
            <span>نسخه {formatPersianNumber(revision.revisionVersion.versionNumber)}</span>
          ) : null}
        </div>
      </header>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,760px)_320px] lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-10">
          <TiptapDocument content={revision.contentJson} />
          {revision.images?.length ? <ModerationImageGallery images={revision.images} /> : null}
          {revision.youtubeVideo ? (
            <ModerationVideo
              snapshot={{
                title: revision.title,
                youtubeVideo: revision.youtubeVideo,
              }}
            />
          ) : null}
          {revision.sources?.length ? (
            <ModerationSources
              sources={revision.sources.map((source) => ({
                ...source,
                title: source.title ?? null,
                authorOrProvider: source.authorOrProvider ?? null,
                publicationDate: source.publicationDate ?? null,
                websiteUrl: source.websiteUrl ?? null,
                bookOrArticleDetails: source.bookOrArticleDetails ?? null,
                interviewDate: source.interviewDate ?? null,
                explanation: source.explanation ?? null,
              }))}
            />
          ) : null}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="font-semibold text-foreground">جزئیات ویرایش</h2>
            <dl className="mt-4 space-y-3 text-[13px]">
              <RevisionDetail label="موضوع" value={revision.category?.name ?? "نامشخص"} />
              <RevisionDetail label="نوع مطلب" value={revision.contentType?.name ?? "نامشخص"} />
              <RevisionDetail label="موقعیت" value={getRevisionLocation(revision)} />
              <RevisionDetail
                label="آغازکننده"
                value={
                  revision.revisionCreatedBy?.displayName ??
                  revision.author?.displayName ??
                  "نامشخص"
                }
              />
              {revision.revisionRequestedBy ? (
                <RevisionDetail
                  label="درخواست‌کننده اصلاح"
                  value={revision.revisionRequestedBy.displayName}
                />
              ) : null}
            </dl>
            {revision.tags?.length ? (
              <div className="mt-4 border-t border-border pt-4">
                <p className="flex items-center gap-2 text-[12px] font-semibold text-muted-foreground">
                  <TagIcon className="size-4" aria-hidden="true" />
                  برچسب‌ها
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {revision.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline" className="rounded-full">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="font-semibold">نسخه فعلی تا زمان تأیید بدون تغییر می‌ماند.</p>
            <div className="mt-4 grid gap-2">
              <Button onClick={() => setDecision("APPROVE")}>تأیید و انتشار تغییرات</Button>
              <Button variant="outline" onClick={() => setDecision("REQUEST_CHANGES")}>
                درخواست تغییر
              </Button>
              <Button variant="destructive" onClick={() => setDecision("REJECT")}>
                رد ویرایش
              </Button>
            </div>
          </div>
          <Link
            className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
            href={`/entries/${encodeURIComponent(revision.slug)}`}
          >
            مشاهده نسخه عمومی
          </Link>
        </aside>
      </div>
      <ModerationDecisionDialog
        decision={decision}
        entryTitle={revision.title}
        isPending={decisionMutation.isPending}
        onOpenChange={(open) => !open && setDecision(null)}
        onConfirm={async (reason) => {
          if (!decision) return;
          await decisionMutation.mutateAsync({ revisionId, decision, reason });
          setDecision(null);
          router.push("/moderator/revisions");
        }}
      />
    </article>
  );
}

function RevisionDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-start font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function getRevisionLocation(revision: {
  geographicScope: "PROVINCE" | "NATIONAL" | "NONE";
  province?: { name: string } | null;
  district?: { name: string } | null;
  villageOrLocation?: string | null;
}) {
  if (revision.geographicScope === "NATIONAL") return "سراسر افغانستان";
  if (revision.geographicScope === "NONE") return "بدون وابستگی به مکان";

  const parts = [
    revision.province?.name,
    revision.district?.name,
    revision.villageOrLocation,
  ].filter(Boolean);

  return parts.length ? parts.join("، ") : "ولایت نامشخص";
}

export { EntryRevisionQueue, EntryRevisionReview };
