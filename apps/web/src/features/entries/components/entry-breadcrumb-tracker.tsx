"use client";

import { useEffect } from "react";

import {
  createEntryBreadcrumbStorageKey,
  parseEntryBreadcrumbContext,
} from "@/features/entries/utils/entry-breadcrumb";

const breadcrumbContextAttribute = "data-entry-breadcrumb-context";

function EntryBreadcrumbTracker() {
  useEffect(() => {
    function rememberEntryBreadcrumb(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || !(event.target instanceof Element)) {
        return;
      }

      const link = event.target.closest<HTMLAnchorElement>(`a[${breadcrumbContextAttribute}]`);
      const serializedContext = link?.getAttribute(breadcrumbContextAttribute) ?? null;
      const parents = parseEntryBreadcrumbContext(serializedContext);

      if (!link || parents.length === 0) {
        return;
      }

      const destination = new URL(link.href, window.location.href);

      if (
        destination.origin !== window.location.origin ||
        !destination.pathname.startsWith("/entries/")
      ) {
        return;
      }

      try {
        window.sessionStorage.setItem(
          createEntryBreadcrumbStorageKey(destination.pathname),
          JSON.stringify(parents),
        );
      } catch {
        // Navigation remains available when storage is disabled.
      }
    }

    document.addEventListener("click", rememberEntryBreadcrumb, true);

    return () => document.removeEventListener("click", rememberEntryBreadcrumb, true);
  }, []);

  return null;
}

export { EntryBreadcrumbTracker };
