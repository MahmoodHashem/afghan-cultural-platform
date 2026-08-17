import type { PageBreadcrumbItem } from "@/components/layout/page-breadcrumb";

const breadcrumbLabelParam = "breadcrumbLabel";
const breadcrumbHrefParam = "breadcrumbHref";

type EntryBreadcrumbParent = {
  label: string;
  href: string;
};

type EntryBreadcrumbContext = EntryBreadcrumbParent | EntryBreadcrumbParent[];

type EntryBreadcrumbSearchParams = Record<string, string | string[] | undefined>;

function createEntryHref(entry: { slug: string }, breadcrumbParent?: EntryBreadcrumbContext) {
  const entryPath = `/entries/${encodeURIComponent(entry.slug)}`;
  const parents = normalizeBreadcrumbParents(
    Array.isArray(breadcrumbParent) ? breadcrumbParent : breadcrumbParent ? [breadcrumbParent] : [],
  );

  if (parents.length === 0) {
    return entryPath;
  }

  const searchParams = new URLSearchParams();

  for (const parent of parents) {
    searchParams.append(breadcrumbLabelParam, parent.label);
    searchParams.append(breadcrumbHrefParam, parent.href);
  }

  return `${entryPath}?${searchParams.toString()}`;
}

function createEntryDetailBreadcrumbItems(
  entryTitle: string,
  searchParams: EntryBreadcrumbSearchParams,
): PageBreadcrumbItem[] {
  const parents = normalizeBreadcrumbParents(
    zipSearchParams(
      allSearchParams(searchParams[breadcrumbLabelParam]),
      allSearchParams(searchParams[breadcrumbHrefParam]),
    ),
  );

  return [
    { label: "خانه", href: "/" },
    ...(parents.length > 0 ? parents : [{ label: "مطالب", href: "/explore" }]),
    { label: entryTitle },
  ];
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

function zipSearchParams(labels: string[], hrefs: string[]) {
  return labels.flatMap((label, index) => {
    const href = hrefs[index];

    return href ? [{ label, href }] : [];
  });
}

function allSearchParams(value: string | string[] | undefined) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function isSafeInternalHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//") && !href.includes("\\");
}

export type { EntryBreadcrumbContext, EntryBreadcrumbParent, EntryBreadcrumbSearchParams };
export { createEntryDetailBreadcrumbItems, createEntryHref };
