"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

import { OPEN_ENTRY_CONTENTS_EVENT } from "@/components/layout/mobile/mobile-shell-events";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

type TableOfContentsItem = {
  id: string;
  title: string;
  level: 2 | 3;
};

function EntryTableOfContents({
  items,
  variant = "sidebar",
}: {
  items: TableOfContentsItem[];
  variant?: "sidebar" | "drawer";
}) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));

    if (headings.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top)[0];

        if (visibleEntry?.target.id) {
          setActiveId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-18% 0px -62% 0px",
        threshold: [0, 1],
      },
    );

    for (const heading of headings) {
      observer.observe(heading);
    }

    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    if (variant !== "drawer") return;

    const openContents = () => setIsDrawerOpen(true);
    window.addEventListener(OPEN_ENTRY_CONTENTS_EVENT, openContents);
    return () => window.removeEventListener(OPEN_ENTRY_CONTENTS_EVENT, openContents);
  }, [variant]);

  if (variant === "drawer") {
    return (
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} showSwipeHandle>
        <DrawerContent
          dir="rtl"
          className="max-h-[78svh] overflow-hidden border-border bg-background"
        >
          <DrawerHeader className="border-b border-border px-5 pt-3 pb-4 text-right">
            <DrawerTitle>فهرست مطالب</DrawerTitle>
            <DrawerDescription>برای رفتن به هر بخش، عنوان آن را انتخاب کنید.</DrawerDescription>
          </DrawerHeader>
          <TableOfContentsList
            items={items}
            activeId={activeId}
            onSelect={(item) => {
              navigateToHeading(item.id, setActiveId);
              setIsDrawerOpen(false);
            }}
            className="max-h-[calc(78svh-7rem)] px-4 py-3"
          />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <article id="entry-table-of-contents" className="scroll-mt-32">
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            aria-expanded={isExpanded}
            aria-controls="entry-table-of-contents-list"
            onClick={() => setIsExpanded((current) => !current)}
            className="rounded-full w-full flex items-center justify-between"
          >
            <h2 className="text-[18px] font-bold text-foreground">فهرست مطالب</h2>

            <ChevronDownIcon
              className={cn("size-4 transition-transform", isExpanded ? "rotate-180" : null)}
              aria-hidden="true"
            />

            <span className="sr-only">
              {isExpanded ? "بستن فهرست مطالب" : "باز کردن فهرست مطالب"}
            </span>
          </Button>
        </div>
        <nav
          id="entry-table-of-contents-list"
          aria-label="فهرست مطالب"
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
            isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <TableOfContentsList
              items={items}
              activeId={activeId}
              onSelect={(item) => navigateToHeading(item.id, setActiveId)}
              className="max-h-80 pe-1"
            />
          </div>
        </nav>
      </div>
    </article>
  );
}

function TableOfContentsList({
  items,
  activeId,
  onSelect,
  className,
}: {
  items: TableOfContentsItem[];
  activeId: string;
  onSelect: (item: TableOfContentsItem) => void;
  className?: string;
}) {
  return (
    <ol className={cn("space-y-1 overflow-y-auto overscroll-contain", className)}>
      {items.map((item) => {
        const isActive = item.id === activeId;

        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={isActive ? "location" : undefined}
              onClick={(event) => {
                event.preventDefault();
                onSelect(item);
              }}
              className={cn(
                "block rounded-xl py-2 text-[14px] leading-7 transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35",
                item.level === 3 ? "ps-5 pe-3" : "px-3 font-semibold",
                isActive
                  ? "border border-primary/20 bg-primary-light/35 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary",
              )}
            >
              {item.title}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

function navigateToHeading(id: string, setActiveId: (id: string) => void) {
  const heading = document.getElementById(id);
  if (!heading) return;

  setActiveId(id);
  const destination = new URL(window.location.href);
  destination.hash = id;

  if (window.location.hash !== destination.hash) {
    window.history.pushState(window.history.state, "", destination);
  }

  heading.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start",
  });
}

export type { TableOfContentsItem };
export { EntryTableOfContents };
