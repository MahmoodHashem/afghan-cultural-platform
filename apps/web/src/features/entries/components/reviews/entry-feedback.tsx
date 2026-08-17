"use client";

import { StarIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitPublicReview, submitRating } from "@/features/entries/api/community-feedback-api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

type EntryFeedbackProps = {
  entryId: string;
  entryTitle: string;
  averageRating: number;
  ratingCount: number;
};

type ReviewFormValues = z.infer<typeof reviewSchema>;

const reviewSchema = z.object({
  body: z
    .string()
    .trim()
    .min(10, "دیدگاه باید حداقل ۱۰ حرف باشد.")
    .max(1200, "دیدگاه نباید بیشتر از ۱۲۰۰ حرف باشد."),
});

function EntryFeedback({ entryId, entryTitle, averageRating, ratingCount }: EntryFeedbackProps) {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const [pendingRating, setPendingRating] = useState<number | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { body: "" },
  });

  const isAuthenticated = status === "authenticated" && Boolean(user);
  const canContribute = isAuthenticated && Boolean(user?.emailVerified);

  async function handleRating(value: number) {
    if (!canContribute) {
      toast.message("برای امتیازدهی باید وارد شوید و ایمیل خود را تأیید کنید.");
      return;
    }

    setPendingRating(value);

    try {
      await submitRating(entryId, value);
      toast.success("امتیاز شما ثبت شد.");
      router.refresh();
    } catch {
      toast.error("ثبت امتیاز انجام نشد. دوباره تلاش کنید.");
    } finally {
      setPendingRating(null);
    }
  }

  async function onSubmit(values: ReviewFormValues) {
    if (!canContribute) {
      toast.message("برای ثبت دیدگاه باید وارد شوید و ایمیل خود را تأیید کنید.");
      return;
    }

    try {
      await submitPublicReview(entryId, values.body);
      toast.success("دیدگاه شما ثبت شد.");
      reset();
      router.refresh();
    } catch {
      toast.error("ثبت دیدگاه انجام نشد. دوباره تلاش کنید.");
    }
  }

  return (
    <section className="space-y-5 rounded-[24px] border border-border bg-card p-5 shadow-[0_2px_10px_rgba(0,0,0,.04)]">
      <div className="space-y-2">
        <h2 className="text-[22px] font-bold text-foreground">امتیاز و دیدگاه</h2>
        <p className="text-[14px] leading-7 text-muted-foreground">
          امتیازها نشان می‌دهند این مطلب چقدر برای خوانندگان مفید بوده است. برای اصلاح اطلاعات، از
          «پیشنهاد اصلاح» استفاده کنید.
        </p>
      </div>

      <div className="rounded-2xl bg-muted/60 p-4">
        <p className="text-[13px] text-muted-foreground">میانگین امتیاز</p>
        <div className="mt-2 flex items-center gap-3">
          <strong className="text-[28px] text-foreground">{formatRating(averageRating)}</strong>
          <span className="text-[13px] text-muted-foreground">
            از {formatNumber(ratingCount)} رأی
          </span>
        </div>
        <fieldset className="mt-4 flex gap-1" aria-label={`امتیازدهی به ${entryTitle}`}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              disabled={pendingRating !== null}
              onClick={() => handleRating(value)}
              className="rounded-full p-1.5 text-gold transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-60"
              aria-label={`${value} ستاره`}
            >
              <StarIcon className="size-6" aria-hidden="true" />
            </button>
          ))}
        </fieldset>
      </div>

      {status === "initializing" ? (
        <div className="h-20 animate-pulse rounded-2xl bg-muted" aria-hidden="true" />
      ) : canContribute ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <label htmlFor="entry-review-body" className="text-[15px] font-semibold text-foreground">
            دیدگاه شما
          </label>
          <Textarea
            id="entry-review-body"
            rows={5}
            placeholder="دیدگاه کوتاه و محترمانه خود را بنویسید..."
            aria-invalid={Boolean(errors.body)}
            aria-describedby={errors.body ? "entry-review-error" : undefined}
            {...register("body")}
          />
          {errors.body ? (
            <p id="entry-review-error" className="text-[13px] text-destructive">
              {errors.body.message}
            </p>
          ) : null}
          <Button type="submit" disabled={isSubmitting} className="rounded-full">
            {isSubmitting ? "در حال ثبت..." : "ثبت دیدگاه"}
          </Button>
        </form>
      ) : (
        <div className="rounded-2xl border border-border bg-background p-4 text-[14px] leading-7 text-muted-foreground">
          {!isAuthenticated ? (
            <>
              برای ثبت امتیاز یا دیدگاه باید وارد حساب شوید.{" "}
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "link" }), "h-auto p-0 align-baseline")}
              >
                ورود / ثبت‌نام
              </Link>
            </>
          ) : (
            "برای ثبت امتیاز یا دیدگاه باید ایمیل حساب شما تأیید شده باشد."
          )}
        </div>
      )}
    </section>
  );
}

function formatRating(value: number) {
  return new Intl.NumberFormat("fa-AF", {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-AF").format(value);
}

export { EntryFeedback };
