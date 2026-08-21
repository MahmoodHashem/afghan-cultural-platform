import { createPersianPathSegment, normalizePersianRouteSegment } from "@/lib/utils/persian";
import type { TaxonomyItem } from "../types/public-entry";

function findTaxonomyItemByRouteSegment(items: TaxonomyItem[], segment: string) {
  const normalizedSegment = normalizePersianRouteSegment(segment);

  return items.find((item) => {
    return (
      normalizePersianRouteSegment(item.slug) === normalizedSegment ||
      normalizePersianRouteSegment(item.name) === normalizedSegment ||
      normalizePersianRouteSegment(createPersianPathSegment(item.name)) === normalizedSegment
    );
  });
}

function taxonomyItemHref(basePath: "/provinces" | "/categories", item: TaxonomyItem) {
  return `${basePath}/${encodeURIComponent(createPersianPathSegment(item.name))}`;
}

export { findTaxonomyItemByRouteSegment, taxonomyItemHref };
