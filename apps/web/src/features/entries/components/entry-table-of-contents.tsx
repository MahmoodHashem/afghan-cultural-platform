"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TableOfContentsItem = {
  id: string;
  title: string;
  level: 2 | 3;
};

function EntryTableOfContents({ items }: { items: TableOfContentsItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [isExpanded, setIsExpanded] = useState(false);

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
            <ol className="max-h-80 space-y-1 overflow-y-auto pe-1">
              {items.map((item) => {
                const isActive = item.id === activeId;

                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      aria-current={isActive ? "location" : undefined}
                      className={cn(
                        "block rounded-xl py-2 text-[14px] leading-7 transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35",
                        item.level === 3 ? "ps-4 pe-2" : "px-2 font-semibold",
                        isActive
                          ? "border border-primary/20  text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-primary",
                      )}
                    >
                      {item.title}
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        </nav>
      </div>
    </article>
  );
}

export type { TableOfContentsItem };
export { EntryTableOfContents };
