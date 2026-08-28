"use client";

import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SimpleIcon } from "simple-icons";
import { siFacebook, siTelegram, siWhatsapp, siX } from "simple-icons";
import { toast } from "sonner";
import { ClipboardDocumentIcon } from "@/components/icons/animated/clipboard-document";
import { ShareIcon } from "@/components/icons/animated/share";

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
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  createCanonicalEntryUrl,
  createEntryShareDestinations,
  type EntryShareDestination,
} from "@/features/entries/utils/entry-share";
import { useAnimatedIcon } from "@/hooks/use-animated-icon";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const destinationIcons: Record<
  EntryShareDestination["key"],
  { icon?: SimpleIcon; className: string }
> = {
  whatsapp: { icon: siWhatsapp, className: "bg-[#25D366]/12 text-[#128C4A]" },
  telegram: { icon: siTelegram, className: "bg-[#26A5E4]/12 text-[#168AC0]" },
  facebook: { icon: siFacebook, className: "bg-[#1877F2]/12 text-[#1877F2]" },
  x: { icon: siX, className: "bg-foreground/8 text-foreground" },
  email: { className: "bg-terracotta/10 text-terracotta" },
};

function EntryShareDialog({
  open,
  onOpenChange,
  title,
  summary,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  summary: string;
}) {
  const isMobile = useIsMobile();
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef<number | null>(null);
  const destinations = useMemo(
    () => createEntryShareDestinations({ title, summary, url: canonicalUrl }),
    [canonicalUrl, summary, title],
  );
  const supportsNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  useEffect(() => {
    if (!open) {
      setCopied(false);
      return;
    }

    setCanonicalUrl(createCanonicalEntryUrl(window.location.origin, window.location.pathname));
  }, [open]);

  useEffect(
    () => () => {
      if (copiedTimerRef.current !== null) window.clearTimeout(copiedTimerRef.current);
    },
    [],
  );

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setCopied(true);
      if (copiedTimerRef.current !== null) window.clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error("پیوند کپی نشد. دوباره تلاش کنید.");
    }
  }

  async function shareMore() {
    try {
      await navigator.share({ title, text: summary, url: canonicalUrl });
      onOpenChange(false);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("اشتراک‌گذاری انجام نشد. دوباره تلاش کنید.");
    }
  }

  const content = (
    <SharePanel
      canonicalUrl={canonicalUrl}
      destinations={destinations}
      copied={copied}
      supportsNativeShare={supportsNativeShare}
      onCopy={() => void copyLink()}
      onShareMore={() => void shareMore()}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
        <DrawerContent dir="rtl" className="max-h-[86dvh] border-border">
          <DrawerHeader className="border-b border-border px-5 pb-4 text-start">
            <DrawerTitle>اشتراک‌گذاری مطلب</DrawerTitle>
            <DrawerDescription>پیوند این مطلب را با دیگران شریک کنید.</DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 overflow-y-auto px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>اشتراک‌گذاری مطلب</DialogTitle>
          <DialogDescription>پیوند این مطلب را با دیگران شریک کنید.</DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5">{content}</div>
      </DialogContent>
    </Dialog>
  );
}

function SharePanel({
  canonicalUrl,
  destinations,
  copied,
  supportsNativeShare,
  onCopy,
  onShareMore,
}: {
  canonicalUrl: string;
  destinations: EntryShareDestination[];
  copied: boolean;
  supportsNativeShare: boolean;
  onCopy: () => void;
  onShareMore: () => void;
}) {
  const copyAnimation = useAnimatedIcon();
  const shareAnimation = useAnimatedIcon();

  useEffect(() => {
    if (copied) copyAnimation.playStateChange();
  }, [copied, copyAnimation.playStateChange]);

  return (
    <div className="space-y-6">
      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {destinations.map((destination) => (
          <ShareDestination key={destination.key} destination={destination} />
        ))}
        {supportsNativeShare ? (
          <button
            type="button"
            {...shareAnimation.triggerProps}
            className="group flex min-w-16 shrink-0 flex-col items-center gap-2 text-[12px] text-muted-foreground outline-none focus-visible:text-primary"
            onClick={onShareMore}
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-105">
              <ShareIcon ref={shareAnimation.iconRef} size={20} aria-hidden="true" />
            </span>
            بیشتر
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/35 p-2">
        <Input
          value={canonicalUrl}
          readOnly
          dir="ltr"
          aria-label="پیوند مطلب"
          className="h-10 min-w-0 flex-1 border-0 bg-transparent text-left shadow-none focus-visible:ring-0"
          onFocus={(event) => event.currentTarget.select()}
        />
        <Button
          type="button"
          className="shrink-0"
          onClick={onCopy}
          disabled={!canonicalUrl}
          {...copyAnimation.triggerProps}
        >
          <ClipboardDocumentIcon ref={copyAnimation.iconRef} size={20} aria-hidden="true" />
          {copied ? "کپی شد" : "کپی پیوند"}
        </Button>
      </div>
      <p className="sr-only" aria-live="polite">
        {copied ? "پیوند مطلب کپی شد." : ""}
      </p>
    </div>
  );
}

function ShareDestination({ destination }: { destination: EntryShareDestination }) {
  const iconConfig = destinationIcons[destination.key];
  const external = destination.key !== "email";

  return (
    <a
      href={destination.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer noopener" : undefined}
      className="group flex min-w-16 shrink-0 flex-col items-center gap-2 text-[12px] text-muted-foreground outline-none focus-visible:text-primary"
      aria-label={`اشتراک‌گذاری در ${destination.label}`}
    >
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-full transition-transform group-hover:scale-105",
          iconConfig.className,
        )}
      >
        {iconConfig.icon ? (
          <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
            <path d={iconConfig.icon.path} />
          </svg>
        ) : (
          <EnvelopeIcon className="size-5" aria-hidden="true" />
        )}
      </span>
      <span>{destination.label}</span>
    </a>
  );
}

export { EntryShareDialog };
