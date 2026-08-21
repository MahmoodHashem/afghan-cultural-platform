import type { GeographicScope, PublicEntrySort } from "@/features/entries/api/public-entries-api";

type SearchParamValue = string | string[] | undefined;

function getOptionalSearchParam(value: SearchParamValue) {
  const stringValue = Array.isArray(value) ? value[0] : value;

  return stringValue?.trim() || undefined;
}

function getPositiveIntegerSearchParam(value: SearchParamValue, fallback: number) {
  const stringValue = getOptionalSearchParam(value);
  const parsedValue = stringValue ? Number(stringValue) : Number.NaN;

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}

function getPublicEntrySort(value: SearchParamValue): PublicEntrySort {
  const sort = getOptionalSearchParam(value);

  if (sort === "oldest" || sort === "recentlyUpdated") {
    return sort;
  }

  return "newest";
}

function getGeographicScope(value: SearchParamValue): GeographicScope | undefined {
  const geographicScope = getOptionalSearchParam(value);

  if (
    geographicScope === "PROVINCE" ||
    geographicScope === "NATIONAL" ||
    geographicScope === "NONE"
  ) {
    return geographicScope;
  }

  return undefined;
}

export {
  getGeographicScope,
  getOptionalSearchParam,
  getPositiveIntegerSearchParam,
  getPublicEntrySort,
};
