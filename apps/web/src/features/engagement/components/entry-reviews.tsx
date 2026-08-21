"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { BaseSyntheticEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { type FieldErrors, type UseFormRegister, useForm } from "react-hook-form";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useEngagementAccess } from "@/features/engagement/hooks/use-engagement-access";
import {
  useCreateEntryReview,
  useDeleteEntryReview,
  useEntryReviews,
  useUpdateEntryReview,
} from "@/features/engagement/hooks/use-entry-reviews";
import {
  type EntryReviewFormValues,
  entryReviewSchema,
} from "@/features/engagement/schemas/entry-review-schema";
import type { PublicReview } from "@/features/entries/types/public-entry";
import { isApiError } from "@/lib/api/api-error";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";

type EntryReviewsProps = {
  entryId: string;
  initialReviews: PublicReview[];
};

function EntryReviews({ entryId, initialReviews }: EntryReviewsProps) {
  const { status, user, canContribute, ensureVerifiedAccess } = useEngagementAccess();
  const reviewsQuery = useEntryReviews(entryId, initialReviews);
  const reviews = reviewsQuery.data ?? [];
  const currentReview = useMemo(
    () => reviews.find((review) => review.author.id === user?.id) ?? null,
    [reviews, user?.id],
  );
  const createReview = useCreateEntryReview(entryId);
  const updateReview = useUpdateEntryReview(entryId);
  const deleteReview = useDeleteEntryReview(entryId, currentReview?.id ?? null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const submitLock = useRef(false);
  const deleteLock = useRef(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<EntryReviewFormValues>({
    resolver: zodResolver(entryReviewSchema),
    defaultValues: { body: currentReview?.body ?? "" },
  });
  const isSaving = createReview.isPending || updateReview.isPending;
  const isReviewsLoading = reviews.length === 0 && reviewsQuery.isFetching;

  useEffect(() => {
    reset({ body: currentReview?.body ?? "" });
  }, [currentReview?.body, reset]);

  async function submitReview(values: EntryReviewFormValues) {
    if (submitLock.current || !ensureVerifiedAccess("review")) {
      return;
    }

    submitLock.current = true;

    try {
      const review = currentReview
        ? await updateReview.mutateAsync(values.body)
        : await createReview.mutateAsync(values.body);

      reset({ body: review.body });
    } catch (error) {
      if (isApiError(error)) {
        const bodyError = error.fieldErrors.find((fieldError) => fieldError.field === "body");

        if (bodyError) {
          setError("body", { type: "server", message: bodyError.message }, { shouldFocus: true });
        }
      }
    } finally {
      submitLock.current = false;
    }
  }

  async function confirmDelete() {
    if (deleteLock.current) {
      return;
    }

    deleteLock.current = true;

    try {
      await deleteReview.mutateAsync();
      reset({ body: "" });
      setDeleteDialogOpen(false);
    } catch {
      // The mutation owns the controlled Persian error toast.
    } finally {
      deleteLock.current = false;
    }
  }

  return (
    <section id="entry-comments" className="scroll-mt-32 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[26px] font-bold text-foreground">دیدگاه‌های خوانندگان</h2>
        <span className="rounded-full bg-muted px-3 py-1 text-[13px] font-semibold text-muted-foreground">
          {formatPersianNumber(reviews.length)} دیدگاه
        </span>
      </div>

      <ReviewComposer
        status={status}
        canContribute={canContribute}
        hasCurrentReview={Boolean(currentReview)}
        isSaving={isSaving}
        isDeleting={deleteReview.isPending}
        errors={errors}
        register={register}
        onSubmit={handleSubmit(submitReview)}
        onRequestAccess={() => ensureVerifiedAccess("review")}
        onRequestDelete={() => setDeleteDialogOpen(true)}
      />

      {isReviewsLoading ? <ReviewsSkeleton /> : null}
      {reviewsQuery.isError ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-[14px] text-foreground"
        >
          <span>دیدگاه‌ها به‌روز نشد. دوباره تلاش کنید.</span>
          <Button type="button" variant="outline" size="sm" onClick={() => reviewsQuery.refetch()}>
            تلاش دوباره
          </Button>
        </div>
      ) : null}

      {!isReviewsLoading && reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} isOwner={review.author.id === user?.id} />
          ))}
        </div>
      ) : null}

      {!isReviewsLoading && !reviewsQuery.isError && reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-[14px] leading-7 text-muted-foreground">
          هنوز دیدگاهی نوشته نشده است. شما اولین نفر باشید.
        </div>
      ) : null}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border border-border bg-card p-5 text-foreground shadow-[0_24px_70px_rgba(31,41,55,0.16)]">
          <AlertDialogHeader className="place-items-start text-start">
            <AlertDialogTitle className="text-[18px] font-bold">دیدگاه حذف شود؟</AlertDialogTitle>
            <AlertDialogDescription className="text-[14px] leading-7">
              پس از حذف، این دیدگاه دیگر زیر مطلب نمایش داده نمی‌شود.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="-mx-5 -mb-5 border-border bg-muted/40 px-5 py-4 sm:justify-start">
            <AlertDialogCancel disabled={deleteReview.isPending}>انصراف</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              variant="destructive"
              disabled={deleteReview.isPending}
              onClick={confirmDelete}
            >
              {deleteReview.isPending ? "در حال حذف..." : "حذف دیدگاه"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

type ReviewComposerProps = {
  status: "initializing" | "authenticated" | "unauthenticated";
  canContribute: boolean;
  hasCurrentReview: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  errors: FieldErrors<EntryReviewFormValues>;
  register: UseFormRegister<EntryReviewFormValues>;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  onRequestAccess: () => void;
  onRequestDelete: () => void;
};

function ReviewComposer({
  status,
  canContribute,
  hasCurrentReview,
  isSaving,
  isDeleting,
  errors,
  register,
  onSubmit,
  onRequestAccess,
  onRequestDelete,
}: ReviewComposerProps) {
  if (status === "initializing") {
    return <Skeleton className="h-36 rounded-2xl" aria-label="در حال آماده‌سازی دیدگاه" />;
  }

  if (!canContribute) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 text-[14px] leading-7 text-muted-foreground">
        <p>
          {status === "unauthenticated"
            ? "برای نوشتن دیدگاه وارد حساب خود شوید."
            : "برای نوشتن دیدگاه باید ایمیل حساب شما تأیید شده باشد."}
        </p>
        <Button type="button" variant="outline" className="mt-3" onClick={onRequestAccess}>
          {status === "unauthenticated" ? "ورود / ثبت‌نام" : "راهنمای تأیید ایمیل"}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label htmlFor="entry-review-body" className="text-[15px] font-semibold text-foreground">
          {hasCurrentReview ? "ویرایش دیدگاه شما" : "دیدگاه شما"}
        </label>
        {hasCurrentReview ? <Badge variant="outline">دیدگاه شما</Badge> : null}
      </div>
      <Textarea
        id="entry-review-body"
        rows={5}
        placeholder="دیدگاه کوتاه و محترمانه خود را بنویسید..."
        aria-invalid={Boolean(errors.body)}
        aria-describedby={errors.body ? "entry-review-error" : undefined}
        {...register("body")}
      />
      {errors.body ? (
        <p id="entry-review-error" role="alert" className="text-[13px] text-destructive">
          {errors.body.message}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSaving || isDeleting}>
          {isSaving ? "در حال ذخیره..." : hasCurrentReview ? "ذخیره تغییرات" : "ثبت دیدگاه"}
        </Button>
        {hasCurrentReview ? (
          <Button
            type="button"
            variant="ghost"
            disabled={isSaving || isDeleting}
            onClick={onRequestDelete}
          >
            حذف دیدگاه
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function ReviewCard({ review, isOwner }: { review: PublicReview; isOwner: boolean }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-foreground">{review.author.displayName}</h3>
            {isOwner ? <Badge variant="outline">دیدگاه شما</Badge> : null}
          </div>
          <p className="text-[12px] text-muted-foreground">{formatPersianDate(review.createdAt)}</p>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-[15px] leading-8 text-muted-foreground">
        {review.body}
      </p>
    </article>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-3" role="status">
      <span className="sr-only">در حال بارگذاری دیدگاه‌ها</span>
      {[1, 2].map((item) => (
        <div key={item} className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ))}
    </div>
  );
}

export { EntryReviews };
