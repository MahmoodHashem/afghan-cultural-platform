"use client";

import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { PublicEntryListQuery } from "../api/public-entries-api";
import type { TaxonomyItem } from "../types/public-entry";
import { ExploreFilterForm } from "./explore-filter-form";

type ExploreFilterSheetProps = {
  taxonomy: {
    provinces: TaxonomyItem[];
    categories: TaxonomyItem[];
    contentTypes: TaxonomyItem[];
    tags: TaxonomyItem[];
  };
  query: Required<Pick<PublicEntryListQuery, "page" | "limit" | "sort">> &
  Omit<PublicEntryListQuery, "page" | "limit" | "sort">;
};

function ExploreFilterSheet({ taxonomy, query }: ExploreFilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-[14px] font-semibold text-foreground shadow-[0_2px_10px_rgba(0,0,0,.04)] transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
        aria-label="باز کردن فیلترها"
      >
        <AdjustmentsHorizontalIcon className="size-4" aria-hidden="true" />
        فیلترها
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(88vw,380px)] overflow-y-auto bg-background p-0">
        <SheetHeader className="border-b border-border px-5 py-4 text-right">
          <SheetTitle>فیلتر مطالب</SheetTitle>
          <SheetDescription>
            نتایج را بر اساس موضوع، ولایت و نوع محتوا دقیق‌تر کنید.
          </SheetDescription>
        </SheetHeader>
        <div className="p-4">
          <ExploreFilterForm
            taxonomy={taxonomy}
            query={query}
            variant="sheet"
            autoApply={false}
            onApplied={() => setIsOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { ExploreFilterSheet };
