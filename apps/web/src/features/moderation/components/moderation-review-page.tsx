"use client";

import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { TiptapDocument } from "@/components/common/tiptap-document";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  useModerationDecision,
  useModerationSubmission,
} from "@/features/moderation/hooks/use-moderation";
import type {
  ModerationDecision,
  ModerationSnapshot,
  ModerationSnapshotSource,
  ModerationSubmission,
} from "@/features/moderation/types/moderation";
import {
  getModerationErrorMessage,
  isStaleModerationError,
} from "@/features/moderation/utils/moderation-errors";
import { cn } from "@/lib/utils";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";
import { useAuthStore } from "@/stores/auth-store";
import { ModerationDecisionDialog } from "./moderation-decision-dialog";
import { ModerationReviewSkeleton } from "./moderation-skeletons";

function ModerationReviewPage({ entryId }: { entryId: string }) {
  const submissionQuery = useModerationSubmission(entryId);

  if (submissionQuery.isLoading) {
    return <ModerationReviewSkeleton />;
  }

  if (submissionQuery.isError) {
    return (
      <ReviewErrorState
        message={getModerationErrorMessage(submissionQuery.error)}
        onRetry={() => void submissionQuery.refetch()}
      />
    );
  }

  if (!submissionQuery.data?.snapshot) {
    return (
      <ReviewErrorState
        message="نسخه فرستاده‌شده این مطلب کامل نیست و فعلاً قابل بررسی نیست."
        onRetry={() => void submissionQuery.refetch()}
      />
    );
  }

  return <ModerationReviewContent submission={submissionQuery.data} />;
}

function ModerationReviewContent({ submission }: { submission: ModerationSubmission }) {
  const snapshot = submission.snapshot as ModerationSnapshot;
  const coverImage = snapshot.images[0];

  return (
    <article className="content-container space-y-8 pb-16">
      <PageBreadcrumb
        items={[
          { label: "خانه", href: "/" },
          { label: "صف بررسی", href: "/moderator" },
          { label: snapshot.title },
        ]}
      />

      <header className="grid gap-7 border-b border-border pb-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full bg-primary-light text-primary">
              {snapshot.category.name}
            </Badge>
            <Badge variant="outline" className="rounded-full">
              {snapshot.contentType.name}
            </Badge>
            <Badge variant="outline" className="rounded-full">
              {getSnapshotLocation(snapshot)}
            </Badge>
          </div>
          <div className="space-y-3">
            <h1 className="text-[34px] font-bold leading-[1.4] text-foreground sm:text-[44px]">
              {snapshot.title}
            </h1>
            <p className="max-w-3xl text-[17px] leading-9 text-muted-foreground">
              {snapshot.summary}
            </p>
          </div>
          <SubmissionMeta submission={submission} />
        </div>

        {coverImage ? (
          <figure className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="relative aspect-4/3">
              <Image
                src={coverImage.secureUrl}
                alt={coverImage.altText}
                fill
                priority
                sizes="(min-width: 1024px) 360px, 100vw"
                className="object-cover"
              />
            </div>
            {coverImage.caption || coverImage.photographerOrSource ? (
              <figcaption className="px-4 py-3 text-[13px] leading-6 text-muted-foreground">
                {coverImage.caption ?? coverImage.photographerOrSource}
              </figcaption>
            ) : null}
          </figure>
        ) : null}
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,760px)_320px] lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-10">
          <TiptapDocument content={snapshot.contentJson} />
          {snapshot.images.length > 1 ? (
            <ModerationImageGallery images={snapshot.images.slice(1)} />
          ) : null}
          {snapshot.youtubeVideo ? <ModerationVideo snapshot={snapshot} /> : null}
          {snapshot.sources.length > 0 ? <ModerationSources sources={snapshot.sources} /> : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <ModerationActions submission={submission} />
          <SubmissionDetails snapshot={snapshot} submission={submission} />
        </aside>
      </div>
    </article>
  );
}

function SubmissionMeta({ submission }: { submission: ModerationSubmission }) {
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-3 text-[13px] text-muted-foreground">
      <div className="inline-flex items-center gap-2">
        <UserCircleIcon className="size-5" aria-hidden="true" />
        <dt className="sr-only">نویسنده</dt>
        <dd>{submission.author.displayName}</dd>
      </div>
      <div className="inline-flex items-center gap-2">
        <CalendarDaysIcon className="size-5" aria-hidden="true" />
        <dt className="sr-only">تاریخ ارسال</dt>
        <dd>{submission.submittedAt ? formatPersianDate(submission.submittedAt) : "نامشخص"}</dd>
      </div>
      <div className="inline-flex items-center gap-2">
        <ClockIcon className="size-5" aria-hidden="true" />
        <dt className="sr-only">نسخه</dt>
        <dd>
          نسخه {formatPersianNumber(submission.submittedVersion?.versionNumber ?? 0)} ·{" "}
          {submission.submittedVersion?.versionReason === "RESUBMISSION"
            ? "ارسال دوباره"
            : "نخستین ارسال"}
        </dd>
      </div>
    </dl>
  );
}

function ModerationActions({ submission }: { submission: ModerationSubmission }) {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const mutation = useModerationDecision();
  const [decision, setDecision] = useState<ModerationDecision | null>(null);
  const isOwnSubmission = currentUser?.id === submission.authorId;

  async function handleDecision(reason?: string) {
    if (!decision) {
      return;
    }

    try {
      await mutation.mutateAsync({ entryId: submission.id, decision, reason });
      setDecision(null);
      router.replace("/moderator");
    } catch (error) {
      if (isStaleModerationError(error)) {
        setDecision(null);
        router.replace("/moderator");
      }
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-[0_2px_10px_rgba(0,0,0,.04)]">
      <div className="mb-4">
        <h2 className="font-bold text-foreground">نتیجه بررسی</h2>
        <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
          تصمیم پس از تأیید سرور ثبت می‌شود.
        </p>
      </div>
      <div className="grid gap-2">
        <Button
          type="button"
          className="w-full rounded-full"
          disabled={mutation.isPending || isOwnSubmission}
          onClick={() => setDecision("APPROVE")}
        >
          <CheckCircleIcon className="size-4" aria-hidden="true" />
          تأیید و انتشار
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-full border-terracotta/25 text-terracotta hover:bg-terracotta/5 hover:text-terracotta"
          disabled={mutation.isPending}
          onClick={() => setDecision("REQUEST_CHANGES")}
        >
          درخواست تغییر
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={mutation.isPending}
          onClick={() => setDecision("REJECT")}
        >
          رد مطلب
        </Button>
      </div>
      {isOwnSubmission ? (
        <p className="mt-3 flex items-start gap-2 text-[12px] leading-6 text-terracotta">
          <ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          تأیید مطلب خودتان مجاز نیست. بررسی‌کننده دیگری باید آن را تأیید کند.
        </p>
      ) : null}
      <ModerationDecisionDialog
        decision={decision}
        entryTitle={submission.title}
        isPending={mutation.isPending}
        onOpenChange={(open) => {
          if (!open && !mutation.isPending) {
            setDecision(null);
          }
        }}
        onConfirm={handleDecision}
      />
    </section>
  );
}

function SubmissionDetails({
  snapshot,
  submission,
}: {
  snapshot: ModerationSnapshot;
  submission: ModerationSubmission;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="font-bold text-foreground">جزئیات مطلب</h2>
      <dl className="mt-4 space-y-3 text-[13px]">
        <DetailRow label="نویسنده" value={submission.author.displayName} />
        <DetailRow label="موضوع" value={snapshot.category.name} />
        <DetailRow label="نوع مطلب" value={snapshot.contentType.name} />
        <DetailRow label="موقعیت" value={getSnapshotLocation(snapshot)} />
        {snapshot.villageOrLocation ? (
          <DetailRow label="محل دقیق" value={snapshot.villageOrLocation} />
        ) : null}
        <DetailRow label="منابع" value={`${formatPersianNumber(snapshot.sources.length)} منبع`} />
        <DetailRow label="تصاویر" value={`${formatPersianNumber(snapshot.images.length)} تصویر`} />
      </dl>
      {snapshot.tags.length > 0 ? (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-[12px] font-semibold text-muted-foreground">برچسب‌ها</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {snapshot.tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="rounded-full">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-start font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function ModerationImageGallery({ images }: { images: ModerationSnapshot["images"] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-[24px] font-bold text-foreground">تصاویر</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {images.map((image) => (
          <figure
            key={image.id}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="relative aspect-4/3">
              <Image
                src={image.secureUrl}
                alt={image.altText}
                fill
                sizes="(min-width: 1024px) 360px, 100vw"
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

function ModerationVideo({
  snapshot,
}: {
  snapshot: Pick<ModerationSnapshot, "title" | "youtubeVideo">;
}) {
  const video = snapshot.youtubeVideo;

  if (!video) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-[24px] font-bold text-foreground">ویدیوی مرتبط</h2>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <iframe
          src={`https://www.youtube.com/embed/${video.videoId}`}
          title={video.title ?? `ویدیوی مرتبط با ${snapshot.title}`}
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

function ModerationSources({ sources }: { sources: ModerationSnapshotSource[] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-[24px] font-bold text-foreground">منابع</h2>
      <ol className="space-y-3">
        {sources
          .toSorted((first, second) => first.displayOrder - second.displayOrder)
          .map((source, index) => (
            <li key={source.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-light text-[12px] font-bold text-primary">
                  {formatPersianNumber(index + 1)}
                </span>
                <div className="min-w-0 space-y-1">
                  <h3 className="font-semibold text-foreground">
                    {source.websiteUrl ? (
                      <a
                        href={source.websiteUrl}
                        rel="noreferrer"
                        className="text-primary underline underline-offset-4"
                      >
                        {source.title ?? source.websiteUrl}
                      </a>
                    ) : (
                      (source.title ?? source.bookOrArticleDetails ?? "منبع بدون عنوان")
                    )}
                  </h3>
                  {source.authorOrProvider ? (
                    <p className="text-[13px] text-muted-foreground">{source.authorOrProvider}</p>
                  ) : null}
                  {source.explanation ? (
                    <p className="text-[13px] leading-7 text-muted-foreground">
                      {source.explanation}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
      </ol>
    </section>
  );
}

function getSnapshotLocation(snapshot: ModerationSnapshot) {
  if (snapshot.geographicScope === "NATIONAL") {
    return "سراسر افغانستان";
  }

  if (snapshot.geographicScope === "NONE") {
    return "بدون وابستگی به مکان";
  }

  const parts = [
    snapshot.province?.name,
    snapshot.district?.name,
    snapshot.villageOrLocation,
  ].filter(Boolean);
  return parts.join("، ") || "ولایت نامشخص";
}

function ReviewErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="content-container pb-16">
      <div className="rounded-xl border border-destructive/20 bg-card px-5 py-14 text-center">
        <ExclamationTriangleIcon className="mx-auto size-10 text-destructive" aria-hidden="true" />
        <h1 className="mt-4 text-[20px] font-bold text-foreground">مطلب باز نشد</h1>
        <p className="mx-auto mt-2 max-w-lg text-[14px] leading-7 text-muted-foreground">
          {message}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button type="button" variant="outline" className="rounded-full" onClick={onRetry}>
            تلاش دوباره
          </Button>
          <Link href="/moderator" className={cn(buttonVariants(), "rounded-full")}>
            بازگشت به صف بررسی
          </Link>
        </div>
      </div>
    </section>
  );
}

export { ModerationImageGallery, ModerationReviewPage, ModerationSources, ModerationVideo };
