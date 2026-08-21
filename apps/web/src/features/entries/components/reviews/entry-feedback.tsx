"use client";

import { StarIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { submitRating } from "@/features/entries/api/community-feedback-api";
import { formatPersianNumber } from "@/lib/utils/formatters";
import { useAuthStore } from "@/stores/auth-store";

type EntryFeedbackProps = {
  entryId: string;
  entryTitle: string;
  averageRating: number;
  ratingCount: number;
};

function EntryFeedback({ entryId, entryTitle, averageRating, ratingCount }: EntryFeedbackProps) {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const [pendingRating, setPendingRating] = useState<number | null>(null);
  const isAuthenticated = status === "authenticated" && Boolean(user);
  const canContribute = isAuthenticated && Boolean(user?.emailVerified);

  async function handleRating(value: number) {
    if (!canContribute) {
      toast.warning("برای امتیازدهی باید وارد شوید و ایمیل خود را تأیید کنید.");
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

  return (
    <section className="space-y-5 rounded-[24px] border border-border bg-card p-5 shadow-[0_2px_10px_rgba(0,0,0,.04)]">
      <div className="space-y-2">
        <h2 className="text-[22px] font-bold text-foreground">امتیاز این مطلب</h2>
        <p className="text-[14px] leading-7 text-muted-foreground">
          امتیازها نشان می‌دهند این مطلب چقدر برای خوانندگان مفید بوده است.
        </p>
      </div>

      <div className="rounded-2xl bg-muted/60 p-4">
        <p className="text-[13px] text-muted-foreground">میانگین امتیاز</p>
        <div className="mt-2 flex items-center gap-3">
          <strong className="text-[28px] text-foreground">
            {formatPersianNumber(averageRating, { maximumFractionDigits: 1 })}
          </strong>
          <span className="text-[13px] text-muted-foreground">
            از {formatPersianNumber(ratingCount)} رأی
          </span>
        </div>
        <fieldset className="mt-4 flex gap-1" aria-label={`امتیازدهی به ${entryTitle}`}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              disabled={pendingRating !== null || status === "initializing"}
              onClick={() => handleRating(value)}
              className="rounded-full p-1.5 text-gold transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-60"
              aria-label={`${value} ستاره`}
            >
              <StarIcon className="size-6" aria-hidden="true" />
            </button>
          ))}
        </fieldset>
      </div>
    </section>
  );
}

export { EntryFeedback };
