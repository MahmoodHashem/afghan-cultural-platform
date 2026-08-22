"use client";

import { FlagIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useEngagementAccess } from "@/features/engagement/hooks/use-engagement-access";
import {
  useSubmitCorrection,
  useSubmitReport,
} from "@/features/moderation/hooks/use-content-moderation";
import type {
  CorrectionSection,
  ReportReason,
} from "@/features/moderation/types/content-moderation";
import {
  correctionSectionLabels,
  reportReasonLabels,
} from "@/features/moderation/utils/content-moderation-labels";

const correctionSections = Object.entries(correctionSectionLabels).map(([value, label]) => ({
  value: value as CorrectionSection,
  label,
}));
const reportReasons = Object.entries(reportReasonLabels).map(([value, label]) => ({
  value: value as ReportReason,
  label,
}));

function CommunityModerationActions({ entryId }: { entryId: string }) {
  const { ensureVerifiedAccess } = useEngagementAccess();
  const [activeSheet, setActiveSheet] = useState<"correction" | "report" | null>(null);

  function open(action: "correction" | "report") {
    if (ensureVerifiedAccess(action)) {
      setActiveSheet(action);
    }
  }

  return (
    <section className="flex flex-wrap items-center gap-2 border-y border-border py-5">
      <span className="me-2 text-[13px] text-muted-foreground">
        در بهترشدن این مطلب سهم بگیرید:
      </span>
      <Button type="button" variant="outline" size="sm" onClick={() => open("correction")}>
        <PencilSquareIcon className="size-4" aria-hidden="true" />
        پیشنهاد اصلاح
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => open("report")}>
        <FlagIcon className="size-4" aria-hidden="true" />
        گزارش مطلب
      </Button>

      <CorrectionSheet
        entryId={entryId}
        open={activeSheet === "correction"}
        onOpenChange={(nextOpen) => setActiveSheet(nextOpen ? "correction" : null)}
      />
      <ReportSheet
        entryId={entryId}
        open={activeSheet === "report"}
        onOpenChange={(nextOpen) => setActiveSheet(nextOpen ? "report" : null)}
      />
    </section>
  );
}

function CorrectionSheet({
  entryId,
  open,
  onOpenChange,
}: {
  entryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useSubmitCorrection();
  const [section, setSection] = useState<CorrectionSection>("CONTENT");
  const [proposedCorrection, setProposedCorrection] = useState("");
  const [reason, setReason] = useState("");
  const [sourceText, setSourceText] = useState("");
  const isValid = proposedCorrection.trim().length > 0 && reason.trim().length >= 10;

  async function submit() {
    if (!isValid || mutation.isPending) return;
    try {
      await mutation.mutateAsync({ entryId, section, proposedCorrection, reason, sourceText });
      onOpenChange(false);
      setProposedCorrection("");
      setReason("");
      setSourceText("");
    } catch {
      // The mutation owns the controlled Persian error toast; values stay intact.
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg" dir="rtl">
        <SheetHeader className="border-b border-border p-5 pe-14">
          <SheetTitle className="text-[20px] font-bold">پیشنهاد اصلاح</SheetTitle>
          <SheetDescription className="leading-7">
            بخش موردنظر و متن درست را بنویسید. پیشنهاد شما پیش از اعمال بررسی می‌شود.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5 p-5">
          <FieldLabel label="بخش مطلب">
            <Select
              items={correctionSections}
              value={section}
              onValueChange={(value) => value && setSection(value as CorrectionSection)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectGroup>
                  {correctionSections.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </FieldLabel>
          <FieldLabel label="متن پیشنهادی">
            <Textarea
              rows={8}
              value={proposedCorrection}
              onChange={(event) => setProposedCorrection(event.target.value)}
              placeholder="متن درست را کامل بنویسید..."
            />
          </FieldLabel>
          <FieldLabel label="دلیل اصلاح">
            <Textarea
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="چرا این بخش باید اصلاح شود؟"
            />
          </FieldLabel>
          <FieldLabel label="منبع یا توضیح بیشتر (اختیاری)">
            <Textarea
              rows={3}
              value={sourceText}
              onChange={(event) => setSourceText(event.target.value)}
              placeholder="نام کتاب، مقاله یا نشانی منبع..."
            />
          </FieldLabel>
        </div>
        <SheetFooter className="border-t border-border bg-muted/30 p-5">
          <Button type="button" disabled={!isValid || mutation.isPending} onClick={submit}>
            {mutation.isPending ? "در حال فرستادن..." : "فرستادن پیشنهاد"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function ReportSheet({
  entryId,
  reviewId,
  open,
  onOpenChange,
}: {
  entryId: string;
  reviewId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useSubmitReport();
  const [reason, setReason] = useState<ReportReason>("INACCURATE_INFORMATION");
  const [explanation, setExplanation] = useState("");
  const isValid = explanation.trim().length >= 10;

  async function submit() {
    if (!isValid || mutation.isPending) return;
    try {
      await mutation.mutateAsync({ entryId, reviewId, reason, explanation });
      onOpenChange(false);
      setExplanation("");
    } catch {
      // Keep the explanation so the user can retry.
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md" dir="rtl">
        <SheetHeader className="border-b border-border p-5 pe-14">
          <SheetTitle className="text-[20px] font-bold">
            {reviewId ? "گزارش دیدگاه" : "گزارش مطلب"}
          </SheetTitle>
          <SheetDescription className="leading-7">
            گزارش‌ها تنها برای بررسی محتوایی استفاده می‌شوند.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5 p-5">
          <FieldLabel label="دلیل گزارش">
            <Select
              items={reportReasons}
              value={reason}
              onValueChange={(value) => value && setReason(value as ReportReason)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end" className="max-h-80">
                <SelectGroup>
                  {reportReasons.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </FieldLabel>
          <FieldLabel label="توضیح">
            <Textarea
              rows={6}
              value={explanation}
              onChange={(event) => setExplanation(event.target.value)}
              placeholder="مشکل را روشن و کوتاه توضیح دهید..."
            />
          </FieldLabel>
        </div>
        <SheetFooter className="border-t border-border bg-muted/30 p-5">
          <Button type="button" disabled={!isValid || mutation.isPending} onClick={submit}>
            {mutation.isPending ? "در حال فرستادن..." : "فرستادن گزارش"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function ReviewReportButton({ entryId, reviewId }: { entryId: string; reviewId: string }) {
  const { ensureVerifiedAccess } = useEngagementAccess();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={() => ensureVerifiedAccess("report") && setOpen(true)}
      >
        <FlagIcon className="size-4" aria-hidden="true" />
        گزارش
      </Button>
      <ReportSheet entryId={entryId} reviewId={reviewId} open={open} onOpenChange={setOpen} />
    </>
  );
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <span className="text-[13px] font-semibold text-foreground">{label}</span>
      {children}
    </div>
  );
}

export { CommunityModerationActions, ReviewReportButton };
