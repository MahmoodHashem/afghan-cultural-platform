"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminAuditMetadataLabels } from "@/features/admin/constants/admin-audit-meta";
import { getAdminAuditActionMeta } from "@/features/admin/mappers/admin-overview-mapper";
import type { AdminAuditItem } from "@/features/admin/types/admin-audit";
import { formatPersianDate } from "@/lib/utils/formatters";

function AdminAuditDetailsDialog({
  item,
  open,
  onOpenChange,
}: {
  item: AdminAuditItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!item) return null;
  const meta = getAdminAuditActionMeta(item.action);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl" dir="rtl">
        <DialogHeader className="border-b px-5 py-5 text-start">
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle>{meta.label}</DialogTitle>
            <Badge variant="outline">{item.actor?.displayName ?? "سیستم"}</Badge>
          </div>
          <DialogDescription>{formatPersianDate(item.createdAt)}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[65dvh] space-y-5 overflow-y-auto p-5">
          <DetailsSection title="زمینه فعالیت">
            <Detail label="انجام‌دهنده" value={item.actor?.displayName ?? "سیستم"} />
            {item.targetUser ? (
              <Detail label="کاربر مرتبط" value={item.targetUser.displayName} />
            ) : null}
            {item.entry ? (
              <Detail
                label="مطلب مرتبط"
                value={
                  <Link
                    className="font-semibold text-primary hover:text-primary-hover"
                    href={`/admin/entries/${item.entry.id}`}
                  >
                    {item.entry.title}
                  </Link>
                }
              />
            ) : null}
            {item.report ? <Detail label="گزارش" value={item.report.id} mono /> : null}
            {item.correctionSuggestion ? (
              <Detail label="پیشنهاد اصلاح" value={item.correctionSuggestion.id} mono />
            ) : null}
            {item.entryRevision ? (
              <Detail label="ویرایش مطلب" value={item.entryRevision.id} mono />
            ) : null}
          </DetailsSection>
          {item.metadata ? (
            <DetailsSection title="جزئیات ثبت‌شده">
              {Object.entries(item.metadata).map(([key, value]) => (
                <Detail
                  key={key}
                  label={adminAuditMetadataLabels[key] ?? key}
                  value={value === null ? "-" : String(value)}
                  mono={key.toLowerCase().endsWith("id")}
                />
              ))}
            </DetailsSection>
          ) : null}
        </div>
        <DialogFooter className="border-t px-5 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            بستن
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-[13px] font-semibold">{title}</h2>
      <dl className="divide-y rounded-lg border px-4">{children}</dl>
    </section>
  );
}

function Detail({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <dt className="text-[12px] text-muted-foreground">{label}</dt>
      <dd
        className={`min-w-0 break-words text-[13px] ${mono ? "font-mono" : ""}`}
        dir={mono ? "ltr" : undefined}
      >
        {value}
      </dd>
    </div>
  );
}

export { AdminAuditDetailsDialog };
