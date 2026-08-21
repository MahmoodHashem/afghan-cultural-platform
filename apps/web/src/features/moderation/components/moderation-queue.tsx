"use client";

import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  FunnelIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition } from "react";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ContributionTaxonomyData } from "@/features/entries/api/contribution-taxonomy-api";
import { useModerationQueue } from "@/features/moderation/hooks/use-moderation";
import type {
  ModerationQueueQuery,
  ModerationSubmission,
} from "@/features/moderation/types/moderation";
import {
  createModerationQueueHref,
  parseModerationQueueQuery,
} from "@/features/moderation/utils/moderation-query";
import { cn } from "@/lib/utils";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";
import { ModerationQueueSkeleton } from "./moderation-skeletons";

const ALL_VALUE = "__all__";

function ModerationQueue({ taxonomy }: { taxonomy: ContributionTaxonomyData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isNavigationPending, startTransition] = useTransition();
  const query = useMemo(() => parseModerationQueueQuery(searchParams), [searchParams]);
  const submissions = useModerationQueue(query);

  function updateQuery(updates: Partial<ModerationQueueQuery>) {
    startTransition(() => {
      router.replace(createModerationQueueHref(query, { ...updates, page: 1 }), {
        scroll: false,
      });
    });
  }

  return (
    <section className="content-container space-y-7 pb-16">
      <PageBreadcrumb items={[{ label: "خانه", href: "/" }, { label: "بررسی مطالب" }]} />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-[13px] font-semibold text-primary">مدیریت محتوا</p>
          <h1 className="text-[30px] font-bold leading-10 text-foreground sm:text-[38px]">
            صف بررسی مطالب
          </h1>
          <p className="max-w-2xl text-[15px] leading-8 text-muted-foreground">
            نسخه فرستاده‌شده هر مطلب را بخوانید و نتیجه بررسی را ثبت کنید.
          </p>
        </div>
        <div className="rounded-full border border-border bg-card px-4 py-2 text-[13px] font-semibold text-muted-foreground">
          {submissions.isLoading
            ? "در حال شمارش..."
            : `${formatPersianNumber(submissions.data?.meta.total ?? 0)} مطلب در صف`}
        </div>
      </header>

      <ModerationFilters
        query={query}
        taxonomy={taxonomy}
        isPending={isNavigationPending}
        onChange={updateQuery}
      />

      {submissions.isLoading ? <ModerationQueueSkeleton /> : null}
      {submissions.isError ? (
        <ModerationQueueError onRetry={() => void submissions.refetch()} />
      ) : null}
      {submissions.data?.data.length === 0 ? <ModerationQueueEmpty /> : null}
      {submissions.data && submissions.data.data.length > 0 ? (
        <>
          <div className={cn("space-y-3", isNavigationPending && "opacity-60")}>
            {submissions.data.data.map((submission) => (
              <ModerationQueueRow key={submission.id} submission={submission} />
            ))}
          </div>
          <ModerationPagination query={query} meta={submissions.data.meta} />
        </>
      ) : null}
    </section>
  );
}

function ModerationFilters({
  query,
  taxonomy,
  isPending,
  onChange,
}: {
  query: ModerationQueueQuery;
  taxonomy: ContributionTaxonomyData;
  isPending: boolean;
  onChange: (updates: Partial<ModerationQueueQuery>) => void;
}) {
  return (
    <div className="grid gap-2 rounded-xl border border-border bg-card p-2 shadow-[0_2px_10px_rgba(0,0,0,.035)] sm:grid-cols-2 xl:grid-cols-[auto_1fr_1fr_1fr_1fr] xl:items-center">
      <div className="hidden items-center gap-2 px-3 text-[13px] font-semibold text-muted-foreground xl:flex">
        <FunnelIcon className="size-4" aria-hidden="true" />
        فیلترها
      </div>
      <FilterSelect
        label="ولایت"
        placeholder="همه ولایت‌ها"
        value={query.provinceId}
        options={taxonomy.provinces}
        disabled={isPending}
        onValueChange={(provinceId) => onChange({ provinceId })}
      />
      <FilterSelect
        label="موضوع"
        placeholder="همه موضوع‌ها"
        value={query.categoryId}
        options={taxonomy.categories}
        disabled={isPending}
        onValueChange={(categoryId) => onChange({ categoryId })}
      />
      <FilterSelect
        label="نوع مطلب"
        placeholder="همه نوع‌ها"
        value={query.contentTypeId}
        options={taxonomy.contentTypes}
        disabled={isPending}
        onValueChange={(contentTypeId) => onChange({ contentTypeId })}
      />
      <Select
        items={[
          { label: "تازه‌ترین ارسال‌ها", value: "desc" },
          { label: "قدیمی‌ترین ارسال‌ها", value: "asc" },
        ]}
        value={query.sortDirection}
        onValueChange={(value) => {
          if (value === "asc" || value === "desc") {
            onChange({ sortDirection: value });
          }
        }}
      >
        <SelectTrigger
          className="h-11 w-full border-0 bg-muted/45 px-3 shadow-none"
          disabled={isPending}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end" alignItemWithTrigger={false}>
          <SelectGroup>
            <SelectItem value="desc">تازه‌ترین ارسال‌ها</SelectItem>
            <SelectItem value="asc">قدیمی‌ترین ارسال‌ها</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function FilterSelect({
  label,
  placeholder,
  value,
  options,
  disabled,
  onValueChange,
}: {
  label: string;
  placeholder: string;
  value?: string;
  options: Array<{ id: string; name: string }>;
  disabled: boolean;
  onValueChange: (value: string | undefined) => void;
}) {
  const items = [
    { label: placeholder, value: ALL_VALUE },
    ...options.map((option) => ({ label: option.name, value: option.id })),
  ];

  return (
    <Select
      items={items}
      value={value ?? ALL_VALUE}
      onValueChange={(nextValue) =>
        onValueChange(nextValue === ALL_VALUE || nextValue === null ? undefined : nextValue)
      }
    >
      <SelectTrigger
        aria-label={label}
        className="h-11 w-full border-0 bg-muted/45 px-3 shadow-none"
        disabled={disabled}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end" alignItemWithTrigger={false} className="max-h-80">
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function ModerationQueueRow({ submission }: { submission: ModerationSubmission }) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/25">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_1fr_1fr_150px] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="line-clamp-1 text-[17px] font-bold text-foreground">
              {submission.title}
            </h2>
            <Badge className="rounded-full border border-gold/30 bg-gold/10 text-[#805E1B]">
              در انتظار بررسی
            </Badge>
          </div>
          <p className="mt-2 line-clamp-1 text-[13px] text-muted-foreground">
            {submission.category.name} · {submission.contentType.name}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <UserCircleIcon className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{submission.author.displayName}</span>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <CalendarDaysIcon className="size-4 shrink-0" aria-hidden="true" />
          {submission.submittedAt ? formatPersianDate(submission.submittedAt) : "تاریخ نامشخص"}
        </div>
        <Link
          href={`/moderator/submissions/${submission.id}`}
          className={cn(buttonVariants({ variant: "outline" }), "w-full rounded-full")}
        >
          بررسی مطلب
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

function ModerationPagination({
  query,
  meta,
}: {
  query: ModerationQueueQuery;
  meta: { page: number; totalPages: number };
}) {
  if (meta.totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center justify-center gap-3 pt-3" aria-label="صفحه‌بندی صف بررسی">
      <Link
        href={createModerationQueueHref(query, { page: Math.max(1, meta.page - 1) })}
        scroll={false}
        aria-disabled={meta.page <= 1}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "rounded-full",
          meta.page <= 1 && "pointer-events-none opacity-45",
        )}
      >
        قبلی
      </Link>
      <span className="text-[13px] text-muted-foreground">
        صفحه {formatPersianNumber(meta.page)} از {formatPersianNumber(meta.totalPages)}
      </span>
      <Link
        href={createModerationQueueHref(query, {
          page: Math.min(meta.totalPages, meta.page + 1),
        })}
        scroll={false}
        aria-disabled={meta.page >= meta.totalPages}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "rounded-full",
          meta.page >= meta.totalPages && "pointer-events-none opacity-45",
        )}
      >
        بعدی
      </Link>
    </nav>
  );
}

function ModerationQueueEmpty() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-5 py-14 text-center">
      <h2 className="text-[20px] font-bold text-foreground">صف بررسی خالی است</h2>
      <p className="mt-2 text-[14px] text-muted-foreground">در حال حاضر مطلبی منتظر بررسی نیست.</p>
    </div>
  );
}

function ModerationQueueError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-10 text-center">
      <h2 className="font-bold text-foreground">صف بررسی باز نشد</h2>
      <p className="mt-2 text-[14px] text-muted-foreground">کمی بعد دوباره تلاش کنید.</p>
      <button
        type="button"
        onClick={onRetry}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 rounded-full")}
      >
        تلاش دوباره
      </button>
    </div>
  );
}

export { ModerationQueue };
