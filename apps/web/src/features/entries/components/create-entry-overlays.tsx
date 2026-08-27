"use client";

import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

import { TiptapDocument } from "@/components/common/tiptap-document";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { ContributionTaxonomyData } from "@/features/entries/api/contribution-taxonomy-api";
import type { CreateEntryFormValues } from "@/features/entries/schemas/create-entry-schema";
import {
  geographicScopeLabels,
  sourceTypeLabels,
} from "@/features/entries/schemas/create-entry-schema";
import type { StagedImage } from "@/features/entries/types/create-entry-form";
import { useIsMobile } from "@/hooks/use-mobile";

type ReadinessIssue = {
  field: keyof CreateEntryFormValues;
  label: string;
  section: "writing" | "details";
};

function EntryPreviewDialog({
  open,
  onOpenChange,
  values,
  images,
  taxonomy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: CreateEntryFormValues;
  images: StagedImage[];
  taxonomy: ContributionTaxonomyData;
}) {
  const isMobile = useIsMobile();
  const category = taxonomy.categories.find((item) => item.id === values.categoryId)?.name;
  const contentType = taxonomy.contentTypes.find((item) => item.id === values.contentTypeId)?.name;
  const province = taxonomy.provinces.find((item) => item.id === values.provinceId)?.name;
  const tags = taxonomy.tags.filter((item) => values.tagIds.includes(item.id));

  const previewContent = (
    <article className="mx-auto max-w-2xl space-y-8 px-5 py-8 sm:px-8">
      <header className="space-y-4">
        <div className="flex flex-wrap gap-2 text-[12px] text-muted-foreground">
          {contentType ? <span>{contentType}</span> : null}
          {category ? <span>· {category}</span> : null}
          <span>· {geographicScopeLabels[values.geographicScope]}</span>
          {province ? <span>· {province}</span> : null}
        </div>
        <h1 className="text-[30px] font-bold leading-[1.5] text-foreground sm:text-[42px]">
          {values.title.trim() || "عنوان مطلب"}
        </h1>
        <p className="text-[16px] leading-8 text-muted-foreground">
          {values.summary.trim() || "خلاصه مطلب در اینجا دیده می‌شود."}
        </p>
      </header>

      {images[0] ? (
        <figure className="-mx-5 overflow-hidden border-y border-border sm:mx-0 sm:rounded-xl sm:border">
          <div className="relative aspect-4/3 bg-muted">
            <Image
              src={images[0].previewUrl}
              alt={images[0].altText || "پیش‌نمایش تصویر مطلب"}
              fill
              unoptimized
              sizes="(min-width: 640px) 680px, 100vw"
              className="object-cover"
            />
          </div>
          {images[0].caption ? (
            <figcaption className="px-4 py-3 text-[12px] text-muted-foreground">
              {images[0].caption}
            </figcaption>
          ) : null}
        </figure>
      ) : null}

      <TiptapDocument content={values.contentJson} />

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2 border-t border-border pt-5">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-primary/8 px-3 py-1 text-[12px] text-primary"
            >
              {tag.name}
            </span>
          ))}
        </div>
      ) : null}

      {values.sources.length > 0 ? (
        <section className="space-y-3 border-t border-border pt-6">
          <h2 className="text-xl font-bold">منابع</h2>
          {values.sources.map((source, index) => (
            <div key={source.id ?? `${source.type}-${index}`} className="text-[14px] leading-7">
              <p className="font-semibold">{source.title || `منبع ${index + 1}`}</p>
              <p className="text-muted-foreground">{sourceTypeLabels[source.type]}</p>
            </div>
          ))}
        </section>
      ) : null}
    </article>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
        <DrawerContent dir="rtl" className="max-h-[96dvh] border-border">
          <DrawerHeader className="border-b border-border px-5 pb-4 text-start">
            <DrawerTitle>پیش‌نمایش مطلب</DrawerTitle>
            <DrawerDescription>این پیش‌نمایش ذخیره یا منتشر نمی‌شود.</DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
            {previewContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="block h-[90dvh] min-w-xl max-w-3xl overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 z-10 border-b border-border bg-card/95 px-5 py-4 backdrop-blur-xl">
          <DialogTitle>پیش‌نمایش مطلب</DialogTitle>
          <DialogDescription>این پیش‌نمایش ذخیره یا منتشر نمی‌شود.</DialogDescription>
        </DialogHeader>
        {previewContent}
      </DialogContent>
    </Dialog>
  );
}

function SubmissionReadinessDrawer({
  open,
  onOpenChange,
  issues,
  isBusy,
  submitLabel,
  onSelectIssue,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issues: ReadinessIssue[];
  isBusy: boolean;
  submitLabel: string;
  onSelectIssue: (issue: ReadinessIssue) => void;
  onConfirm: () => void;
}) {
  const ready = issues.length === 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent dir="rtl" className="max-h-[86dvh] border-border">
        <DrawerHeader className="px-5 text-start">
          <DrawerTitle>{ready ? "مطلب آماده ارسال است" : "چند مورد باقی مانده است"}</DrawerTitle>
          <DrawerDescription>
            {ready
              ? "پس از ارسال، مطلب تا پایان بررسی قابل ویرایش نیست."
              : "برای ادامه، موارد زیر را کامل کنید."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 overflow-y-auto px-5 py-4">
          {ready ? (
            <div className="flex items-center gap-3 rounded-xl bg-primary/8 p-4 text-[14px] text-primary">
              <CheckCircleIcon className="size-6 shrink-0" aria-hidden="true" />
              عنوان، خلاصه، متن و جزئیات اصلی کامل شده‌اند.
            </div>
          ) : (
            <div className="divide-y divide-border rounded-xl border border-border">
              {issues.map((issue) => (
                <button
                  key={issue.field}
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start text-[14px] outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/40"
                  onClick={() => onSelectIssue(issue)}
                >
                  <span className="flex items-center gap-2">
                    <ExclamationTriangleIcon
                      className="size-5 text-terracotta"
                      aria-hidden="true"
                    />
                    {issue.label}
                  </span>
                  <ChevronLeftIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
        </div>
        <DrawerFooter className="px-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button disabled={!ready || isBusy} onClick={onConfirm}>
            <PaperAirplaneIcon aria-hidden="true" />
            {isBusy ? "در حال ارسال..." : submitLabel}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function UnsavedEntryDialog({
  open,
  onOpenChange,
  onLeave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeave: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>بدون ذخیره خارج می‌شوید؟</AlertDialogTitle>
          <AlertDialogDescription>تغییرات ذخیره‌نشده از بین می‌روند.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ادامه نوشتن</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onLeave}>
            خروج بدون ذخیره
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export type { ReadinessIssue };
export { EntryPreviewDialog, SubmissionReadinessDrawer, UnsavedEntryDialog };
