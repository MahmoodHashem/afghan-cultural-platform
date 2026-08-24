import type { PageBreadcrumbItem } from "@/components/layout/page-breadcrumb";

const entryBreadcrumbStoragePrefix = "entry-breadcrumb:";

type EntryBreadcrumbParent = {
  label: string;
  href: string;
};

type EntryBreadcrumbContext = EntryBreadcrumbParent | EntryBreadcrumbParent[];

function createEntryHref(entry: { slug: string }) {
  return `/entries/${encodeURIComponent(entry.slug)}`;
}

function createEntryDetailBreadcrumbItems(
  entryTitle: string,
  breadcrumbParents: EntryBreadcrumbParent[] = [],
): PageBreadcrumbItem[] {
  const parents = normalizeBreadcrumbParents(breadcrumbParents);

  return [
    { label: "خانه", href: "/" },
    ...(parents.length > 0 ? parents : [{ label: "مطالب", href: "/explore" }]),
    { label: entryTitle },
  ];
}

function serializeEntryBreadcrumbContext(context?: EntryBreadcrumbContext) {
  if (!context) {
    return undefined;
  }

  const parents = normalizeBreadcrumbParents(Array.isArray(context) ? context : [context]);

  return parents.length > 0 ? JSON.stringify(parents) : undefined;
}

function parseEntryBreadcrumbContext(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return normalizeBreadcrumbParents(
      parsed.flatMap((parent): EntryBreadcrumbParent[] => {
        if (!parent || typeof parent !== "object") {
          return [];
        }

        const candidate = parent as Record<string, unknown>;

        return typeof candidate.label === "string" && typeof candidate.href === "string"
          ? [{ label: candidate.label, href: candidate.href }]
          : [];
      }),
    );
  } catch {
    return [];
  }
}

function createEntryBreadcrumbStorageKey(pathname: string) {
  return `${entryBreadcrumbStoragePrefix}${pathname}`;
}

function normalizeBreadcrumbParents(parents: EntryBreadcrumbParent[]) {
  return parents
    .map((parent) => ({
      label: parent.label.trim(),
      href: parent.href.trim(),
    }))
    .filter(
      (parent) => parent.label && parent.label.length <= 80 && isSafeInternalHref(parent.href),
    )
    .slice(0, 3);
}

function isSafeInternalHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//") && !href.includes("\\");
}

export type { EntryBreadcrumbContext, EntryBreadcrumbParent };
export {
  createEntryBreadcrumbStorageKey,
  createEntryDetailBreadcrumbItems,
  createEntryHref,
  parseEntryBreadcrumbContext,
  serializeEntryBreadcrumbContext,
};
