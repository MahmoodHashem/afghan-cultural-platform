"use client";

import {
  ArchiveBoxIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  FlagIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";

import { TiptapDocument } from "@/components/common/tiptap-document";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminEntryLifecycleDialog } from "@/features/admin/components/admin-entry-lifecycle-dialog";
import { AdminEntryStatusBadge } from "@/features/admin/components/admin-entry-status-badge";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminGeographicScopeLabels } from "@/features/admin/constants/admin-entry-meta";
import { useAdminEntry, useAdminEntryLifecycle } from "@/features/admin/hooks/use-admin-entries";
import type { AdminEntryDetail } from "@/features/admin/types/admin-entries";
import { cn } from "@/lib/utils";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";

function AdminEntryDetailPage({ entryId }: { entryId: string }) {
  const entryQuery = useAdminEntry(entryId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const entry = entryQuery.data;
  const action = entry?.status === "ARCHIVED" ? "restore" : "archive";
  const mutation = useAdminEntryLifecycle(entryId, action);

  if (entryQuery.isLoading) return <AdminEntryDetailSkeleton />;
  if (entryQuery.isError || !entry) {
    return (
      <section className="flex min-h-96 items-center justify-center">
        <div className="space-y-4 text-center">
          <h1 className="text-xl font-semibold">مطلب بارگذاری نشد</h1>
          <p className="text-sm text-muted-foreground">
            ممکن است مطلب حذف شده باشد یا فعلاً دسترسی به آن ممکن نباشد.
          </p>
          <Button variant="outline" onClick={() => void entryQuery.refetch()}>
            تلاش دوباره
          </Button>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={entry.title}
        description="مشاهده محتوا، پیوندها و تاریخچه چرخه انتشار"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <AdminEntryStatusBadge status={entry.status} />
          <span className="text-[12px] text-muted-foreground">
            آخرین ویرایش: {formatPersianDate(entry.updatedAt)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {entry.status === "PENDING_REVIEW" ? (
            <Link
              href={`/moderator/submissions/${entry.id}`}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              بررسی در صف نظارت
            </Link>
          ) : null}
          {entry.status === "PUBLISHED" ? (
            <>
              <Link
                href={`/entries/${encodeURIComponent(entry.slug)}`}
                target="_blank"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                <ArrowTopRightOnSquareIcon className="size-4" /> مشاهده عمومی
              </Link>
              <Button size="sm" variant="destructive" onClick={() => setDialogOpen(true)}>
                <ArchiveBoxIcon className="size-4" /> بایگانی
              </Button>
            </>
          ) : null}
          {entry.status === "ARCHIVED" ? (
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <ArrowPathIcon className="size-4" /> بازگردانی
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <main className="min-w-0 space-y-6">
          <article className="rounded-xl border bg-card px-5 py-8 sm:px-9 lg:px-12">
            <header className="space-y-4 border-b pb-7">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{entry.category.name}</Badge>
                <Badge variant="outline">{entry.contentType.name}</Badge>
              </div>
              <h1 className="text-3xl leading-[1.5] font-bold sm:text-4xl">{entry.title}</h1>
              <p className="text-[15px] leading-8 text-muted-foreground">{entry.summary}</p>
            </header>
            {entry.images[0] ? (
              <figure className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl bg-muted">
                <Image
                  src={entry.images[0].secureUrl}
                  alt={entry.images[0].altText}
                  fill
                  sizes="(min-width:1280px) 760px, 90vw"
                  className="object-cover"
                />
              </figure>
            ) : null}
            <div className="mt-8">
              <TiptapDocument content={entry.contentJson} />
            </div>
          </article>

          {entry.images.length > 1 ? (
            <Panel title="تصاویر">
              <div className="grid gap-3 sm:grid-cols-2">
                {entry.images.map((image) => (
                  <figure key={image.id} className="space-y-2">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={image.secureUrl}
                        alt={image.altText}
                        fill
                        sizes="(min-width:640px) 360px, 90vw"
                        className="object-cover"
                      />
                    </div>
                    {image.caption ? (
                      <figcaption className="text-[12px] text-muted-foreground">
                        {image.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            </Panel>
          ) : null}
          {entry.sources.length ? (
            <Panel title="منابع">
              <ol className="space-y-3">
                {entry.sources.map((source, index) => (
                  <li key={source.id} className="rounded-lg border p-3 text-[13px] leading-7">
                    <strong>
                      {formatPersianNumber(index + 1)}.{" "}
                      {source.title ?? source.authorOrProvider ?? "منبع بدون عنوان"}
                    </strong>
                    {source.authorOrProvider ? (
                      <span className="block text-muted-foreground">{source.authorOrProvider}</span>
                    ) : null}
                    {source.websiteUrl ? (
                      <a
                        href={source.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        dir="ltr"
                        className="block truncate text-primary hover:underline"
                      >
                        {source.websiteUrl}
                      </a>
                    ) : null}
                  </li>
                ))}
              </ol>
            </Panel>
          ) : null}
          {entry.youtubeVideo ? (
            <Panel title="ویدیوی مرتبط">
              <a
                href={entry.youtubeVideo.url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary hover:underline"
              >
                {entry.youtubeVideo.title ?? `YouTube: ${entry.youtubeVideo.videoId}`}
              </a>
              {entry.youtubeVideo.description ? (
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {entry.youtubeVideo.description}
                </p>
              ) : null}
            </Panel>
          ) : null}
          <ReferencesPanel entry={entry} />
        </main>

        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <MetadataPanel entry={entry} />
          <CountsPanel entry={entry} />
          <HistoryPanel entry={entry} />
        </aside>
      </div>
      <AdminEntryLifecycleDialog
        entry={entry}
        open={dialogOpen}
        pending={mutation.isPending}
        onOpenChange={setDialogOpen}
        onConfirm={(reason) =>
          mutation.mutate({ reason }, { onSuccess: () => setDialogOpen(false) })
        }
      />
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="text-[16px]">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function MetadataPanel({ entry }: { entry: AdminEntryDetail }) {
  const location =
    entry.geographicScope === "PROVINCE"
      ? [entry.province?.name, entry.district?.name, entry.villageOrLocation]
          .filter(Boolean)
          .join("، ")
      : adminGeographicScopeLabels[entry.geographicScope];
  const rows = [
    ["نویسنده", entry.author.displayName],
    ["موضوع", entry.category.name],
    ["نوع مطلب", entry.contentType.name],
    ["محدوده", location || "ثبت نشده"],
    ["ارسال", entry.submittedAt ? formatPersianDate(entry.submittedAt) : "ثبت نشده"],
    ["انتشار", entry.publishedAt ? formatPersianDate(entry.publishedAt) : "منتشر نشده"],
    ["بایگانی", entry.archivedAt ? formatPersianDate(entry.archivedAt) : "-"],
  ];
  return (
    <Panel title="مشخصات مطلب">
      <dl className="space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 text-[12px]">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-end font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      {entry.tags.length ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <Badge key={tag.id} variant="outline">
              {tag.name}
            </Badge>
          ))}
        </div>
      ) : null}
      <Link
        href={`/admin/users/${entry.author.id}`}
        className="mt-4 block text-[12px] text-primary hover:underline"
      >
        مشاهده حساب نویسنده
      </Link>
    </Panel>
  );
}

function CountsPanel({ entry }: { entry: AdminEntryDetail }) {
  const items = [
    [EyeIcon, "بازدید", entry.viewCount],
    [HeartIcon, "پسند", entry.counts.likes],
    [ChatBubbleLeftRightIcon, "دیدگاه", entry.counts.reviews],
    [FlagIcon, "گزارش باز", entry.counts.openReports],
  ] as const;
  return (
    <Panel title="بازخورد">
      <div className="grid grid-cols-2 gap-3">
        {items.map(([Icon, label, value]) => (
          <div key={label} className="rounded-lg bg-muted/50 p-3">
            <Icon className="mb-2 size-4 text-muted-foreground" />
            <strong className="block">{formatPersianNumber(value)}</strong>
            <span className="text-[11px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function HistoryPanel({ entry }: { entry: AdminEntryDetail }) {
  return (
    <Panel title="تاریخچه بررسی">
      <div className="space-y-4">
        {entry.moderationHistory.length ? (
          entry.moderationHistory.map((item) => (
            <div key={item.id} className="border-s-2 border-primary/25 ps-3 text-[12px]">
              <strong>{item.moderator.displayName}</strong>
              <span className="mt-1 block text-muted-foreground">
                {item.previousStatus} ← {item.nextStatus}
              </span>
              {item.comments ? <p className="mt-1 leading-6">{item.comments}</p> : null}
              <time className="mt-1 block text-[11px] text-muted-foreground">
                {formatPersianDate(item.createdAt)}
              </time>
            </div>
          ))
        ) : (
          <p className="text-[12px] text-muted-foreground">هنوز سابقه‌ای ثبت نشده است.</p>
        )}
      </div>
      {entry.contentVersions.length ? (
        <div className="mt-5 border-t pt-4">
          <p className="mb-3 text-[12px] font-semibold">نسخه‌های ثبت‌شده</p>
          <ul className="space-y-2">
            {entry.contentVersions.map((version) => (
              <li
                key={version.id}
                className="flex justify-between text-[11px] text-muted-foreground"
              >
                <span>نسخه {formatPersianNumber(version.versionNumber)}</span>
                <time>{formatPersianDate(version.createdAt)}</time>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Panel>
  );
}

function ReferencesPanel({ entry }: { entry: AdminEntryDetail }) {
  if (!entry.outgoingReferences.length && !entry.incomingReferences.length) return null;
  return (
    <Panel title="پیوندهای داخلی">
      <div className="grid gap-5 md:grid-cols-2">
        <ReferenceList
          title="پیوندهای خروجی"
          items={entry.outgoingReferences.map((item) => ({
            id: item.id,
            label: item.anchorText,
            entry: item.targetEntry,
          }))}
        />
        <ReferenceList
          title="پیوندهای ورودی"
          items={entry.incomingReferences.map((item) => ({
            id: item.id,
            label: item.anchorText,
            entry: item.sourceEntry,
          }))}
        />
      </div>
    </Panel>
  );
}

function ReferenceList({
  title,
  items,
}: {
  title: string;
  items: Array<{
    id: string;
    label: string;
    entry?: { id: string; title: string; status: string };
  }>;
}) {
  return (
    <div>
      <h3 className="mb-2 text-[13px] font-semibold">{title}</h3>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/admin/entries/${item.entry?.id}`}
                className="text-[12px] text-primary hover:underline"
              >
                {item.entry?.title ?? item.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[12px] text-muted-foreground">موردی ثبت نشده است.</p>
      )}
    </div>
  );
}

function AdminEntryDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <Skeleton className="h-[44rem] rounded-xl" />
        <div className="space-y-5">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export { AdminEntryDetailPage };
