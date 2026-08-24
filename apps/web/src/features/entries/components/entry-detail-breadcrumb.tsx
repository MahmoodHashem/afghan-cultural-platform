"use client";

import { useEffect, useState } from "react";

import { PageBreadcrumb, type PageBreadcrumbItem } from "@/components/layout/page-breadcrumb";
import {
  createEntryBreadcrumbStorageKey,
  createEntryDetailBreadcrumbItems,
  parseEntryBreadcrumbContext,
} from "@/features/entries/utils/entry-breadcrumb";

type EntryDetailBreadcrumbProps = {
  entryPath: string;
  entryTitle: string;
  fallbackItems: PageBreadcrumbItem[];
};

function EntryDetailBreadcrumb({
  entryPath,
  entryTitle,
  fallbackItems,
}: EntryDetailBreadcrumbProps) {
  const [items, setItems] = useState(fallbackItems);

  useEffect(() => {
    try {
      const storedContext = window.sessionStorage.getItem(
        createEntryBreadcrumbStorageKey(entryPath),
      );
      const parents = parseEntryBreadcrumbContext(storedContext);

      setItems(
        parents.length > 0 ? createEntryDetailBreadcrumbItems(entryTitle, parents) : fallbackItems,
      );
    } catch {
      setItems(fallbackItems);
    }
  }, [entryPath, entryTitle, fallbackItems]);

  return <PageBreadcrumb items={items} />;
}

export { EntryDetailBreadcrumb };
