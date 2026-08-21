import type { TaxonomyItem } from "../types/public-entry";

function sortTaxonomyItems(items: TaxonomyItem[]) {
  return [...items].sort((first, second) => {
    const firstOrder = first.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const secondOrder = second.sortOrder ?? Number.MAX_SAFE_INTEGER;

    return firstOrder - secondOrder || first.name.localeCompare(second.name, "fa");
  });
}

export { sortTaxonomyItems };
