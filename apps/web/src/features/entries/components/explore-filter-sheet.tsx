"use client";

import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
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
  const activeFilterCount = [
    query.provinceSlug,
    query.categorySlug,
    query.contentTypeSlug,
    query.tagSlug,
  ].filter(Boolean).length;

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} showSwipeHandle>
      <DrawerTrigger
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-[13px] font-semibold text-foreground shadow-[0_2px_10px_rgba(0,0,0,.04)] transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
        aria-label="باز کردن فیلترها"
      >
        <AdjustmentsHorizontalIcon className="size-4" aria-hidden="true" />
        فیلترها
        {activeFilterCount > 0 ? (
          <Badge className="min-w-5 justify-center rounded-full px-1.5 text-[11px]">
            {activeFilterCount.toLocaleString("fa-AF")}
          </Badge>
        ) : null}
      </DrawerTrigger>
      <DrawerContent
        dir="rtl"
        className="max-h-[88svh] overflow-hidden border-border bg-background p-0"
      >
        <DrawerHeader className="border-b border-border px-5 pt-3 pb-4 text-right">
          <DrawerTitle className="text-[18px] font-bold">فیلتر مطالب</DrawerTitle>
          <DrawerDescription className="leading-6">
            نتایج را بر اساس موضوع، ولایت و نوع محتوا دقیق‌تر کنید.
          </DrawerDescription>
        </DrawerHeader>
        <ExploreFilterForm
          taxonomy={taxonomy}
          query={query}
          variant="drawer"
          autoApply={false}
          onApplied={() => setIsOpen(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}

export { ExploreFilterSheet };
