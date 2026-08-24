"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCorrection,
  useCorrectionDecision,
  useReport,
  useResolveReport,
} from "@/features/moderation/hooks/use-content-moderation";
import type { ReportResolutionAction } from "@/features/moderation/types/content-moderation";
import {
  correctionSectionLabels,
  reportActionLabels,
  reportReasonLabels,
} from "@/features/moderation/utils/content-moderation-labels";
import { formatPersianDate } from "@/lib/utils/formatters";

function CorrectionReview({ correctionId }: { correctionId: string }) {
  const router = useRouter();
  const query = useCorrection(correctionId);
  const mutation = useCorrectionDecision();
  const [comments, setComments] = useState("");
  const correction = query.data?.data;

  if (query.isLoading) return <DetailSkeleton />;
  if (query.isError || !correction) return <DetailError onRetry={() => query.refetch()} />;

  async function decide(decision: "ACCEPT" | "REJECT") {
    if (mutation.isPending || (decision === "REJECT" && comments.trim().length < 3)) return;
    try {
      await mutation.mutateAsync({ id: correctionId, decision, comments });
      router.push("/moderator/corrections");
    } catch {
      // Mutation displays the normalized error.
    }
  }

  return (
    <DetailShell
      breadcrumb="پیشنهاد اصلاح"
      title={correction.entry.title}
      subtitle={`${correctionSectionLabels[correction.section]} · فرستاده‌شده توسط ${correction.submittedBy.displayName}`}
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <ComparisonPanel title="متن فعلی" text={correction.originalText} tone="muted" />
        <ComparisonPanel
          title="پیشنهاد کاربر"
          text={correction.proposedCorrection}
          tone="primary"
        />
      </div>
      <ContextBlock title="دلیل پیشنهاد" text={correction.reason} />
      {correction.sourceText ? (
        <ContextBlock title="منبع یا توضیح تکمیلی" text={correction.sourceText} />
      ) : null}
      <Link
        href={`/entries/${encodeURIComponent(correction.entry.slug ?? "")}`}
        className="text-[14px] font-semibold text-primary hover:text-primary-hover"
      >
        دیدن مطلب منتشرشده
      </Link>
      {correction.status === "PENDING" ? (
        <ActionPanel title="ثبت نتیجه بررسی">
          <Textarea
            rows={4}
            value={comments}
            onChange={(event) => setComments(event.target.value)}
            placeholder="یادداشت بررسی؛ برای رد پیشنهاد، نوشتن دلیل لازم است..."
          />
          <div className="flex flex-wrap gap-2">
            <Button disabled={mutation.isPending} onClick={() => decide("ACCEPT")}>
              پذیرفتن اصلاح
            </Button>
            <Button
              variant="destructive"
              disabled={mutation.isPending || comments.trim().length < 3}
              onClick={() => decide("REJECT")}
            >
              رد پیشنهاد
            </Button>
          </div>
        </ActionPanel>
      ) : (
        <ResolvedState
          label={
            correction.status === "ACCEPTED"
              ? "این پیشنهاد پذیرفته شده است."
              : "این پیشنهاد رد شده است."
          }
        />
      )}
    </DetailShell>
  );
}

function ReportReview({ reportId }: { reportId: string }) {
  const router = useRouter();
  const query = useReport(reportId);
  const mutation = useResolveReport();
  const [notes, setNotes] = useState("");
  const report = query.data?.data;
  const actions: ReportResolutionAction[] =
    report?.targetType === "COMMENT"
      ? ["DISMISS", "HIDE_COMMENT"]
      : ["DISMISS", "HIDE_CONTENT", "ARCHIVE_CONTENT"];
  const [action, setAction] = useState<ReportResolutionAction>("DISMISS");

  if (query.isLoading) return <DetailSkeleton />;
  if (query.isError || !report) return <DetailError onRetry={() => query.refetch()} />;

  async function resolve() {
    if (mutation.isPending || notes.trim().length < 3) return;
    try {
      await mutation.mutateAsync({ id: reportId, resolutionAction: action, notes });
      router.push("/moderator/reports");
    } catch {
      // Mutation displays the normalized error.
    }
  }

  return (
    <DetailShell
      breadcrumb="گزارش"
      title={report.entry.title}
      subtitle={`${report.targetType === "COMMENT" ? "گزارش دیدگاه" : "گزارش مطلب"} · ${formatPersianDate(report.createdAt)}`}
    >
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{reportReasonLabels[report.reason]}</Badge>
        <Badge variant="outline">{report.targetType === "COMMENT" ? "دیدگاه" : "مطلب"}</Badge>
      </div>
      <ContextBlock title="توضیح گزارش" text={report.explanation} />
      {report.entryComment ? (
        <ContextBlock
          title={`دیدگاه ${report.entryComment.author.displayName}`}
          text={report.entryComment.body}
        />
      ) : (
        <ContextBlock title="خلاصه مطلب گزارش‌شده" text={report.entry.summary} />
      )}
      <Link
        href={`/entries/${encodeURIComponent(report.entry.slug ?? "")}`}
        className="text-[14px] font-semibold text-primary hover:text-primary-hover"
      >
        دیدن مطلب
      </Link>
      {report.status !== "RESOLVED" ? (
        <ActionPanel title="نتیجه بررسی گزارش">
          <Select
            items={actions.map((value) => ({ value, label: reportActionLabels[value] }))}
            value={action}
            onValueChange={(value) => value && setAction(value as ReportResolutionAction)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup>
                {actions.map((value) => (
                  <SelectItem key={value} value={value}>
                    {reportActionLabels[value]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Textarea
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="دلیل این تصمیم را کوتاه بنویسید..."
          />
          <Button disabled={mutation.isPending || notes.trim().length < 3} onClick={resolve}>
            {mutation.isPending ? "در حال ثبت..." : "ثبت نتیجه"}
          </Button>
        </ActionPanel>
      ) : (
        <ResolvedState label="این گزارش بررسی و بسته شده است." />
      )}
    </DetailShell>
  );
}

function DetailShell({
  breadcrumb,
  title,
  subtitle,
  children,
}: {
  breadcrumb: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="content-container space-y-7 pb-16">
      <PageBreadcrumb
        items={[
          { label: "خانه", href: "/" },
          { label: "بخش بررسی", href: "/moderator" },
          { label: breadcrumb },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-[30px] font-bold sm:text-[38px]">{title}</h1>
        <p className="text-[14px] text-muted-foreground">{subtitle}</p>
      </header>
      <div className="mx-auto max-w-5xl space-y-6">{children}</div>
    </section>
  );
}

function ComparisonPanel({
  title,
  text,
  tone,
}: {
  title: string;
  text: string;
  tone: "muted" | "primary";
}) {
  return (
    <section
      className={
        tone === "primary"
          ? "rounded-xl border border-primary/25 bg-primary-light/35 p-5"
          : "rounded-xl border border-border bg-card p-5"
      }
    >
      <h2 className="mb-3 text-[14px] font-bold">{title}</h2>
      <p className="max-h-[520px] overflow-y-auto whitespace-pre-wrap text-[15px] leading-8 text-muted-foreground">
        {text}
      </p>
    </section>
  );
}

function ContextBlock({ title, text }: { title: string; text: string }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-[15px] font-bold">{title}</h2>
      <p className="mt-3 whitespace-pre-wrap text-[15px] leading-8 text-muted-foreground">{text}</p>
    </section>
  );
}

function ActionPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="sticky bottom-4 space-y-4 rounded-xl border border-primary/20 bg-card p-5 shadow-[0_10px_35px_rgba(31,41,55,.10)]">
      <h2 className="font-bold">{title}</h2>
      {children}
    </section>
  );
}

function ResolvedState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-5 text-[14px] font-semibold text-muted-foreground">
      {label}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="content-container space-y-4 pb-16">
      <Skeleton className="h-8 w-72" />
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
  );
}

function DetailError({ onRetry }: { onRetry: () => unknown }) {
  return (
    <div className="content-container pb-16">
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-10 text-center">
        <p className="font-bold">این مورد باز نشد</p>
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          تلاش دوباره
        </Button>
      </div>
    </div>
  );
}

export { CorrectionReview, ReportReview };
