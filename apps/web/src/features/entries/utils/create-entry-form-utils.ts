import type { UseFormSetError } from "react-hook-form";

import type { ContributionTaxonomyData } from "@/features/entries/api/contribution-taxonomy-api";
import type { EntryDraftPayload, EntrySourceInput } from "@/features/entries/api/entry-drafts-api";
import type { CreateEntryFormValues } from "@/features/entries/schemas/create-entry-schema";
import { geographicScopeLabels } from "@/features/entries/schemas/create-entry-schema";
import type { SelectOption } from "../components/create-entry-select";
import type { WatchedEntryValues } from "../types/create-entry-form";

export const createEntryFieldNameMap = {
  title: "title",
  summary: "summary",
  contentJson: "contentJson",
  geographicScope: "geographicScope",
  provinceId: "provinceId",
  districtId: "districtId",
  categoryId: "categoryId",
  contentTypeId: "contentTypeId",
  villageOrLocation: "villageOrLocation",
} satisfies Partial<Record<string, keyof CreateEntryFormValues>>;

export function toSelectOptions(
  items: Array<{ id: string; name: string; slug?: string }>,
): SelectOption[] {
  return items.map((item) => ({
    value: item.id,
    label: item.name,
    description: item.slug,
  }));
}

export function toDraftPayload(values: CreateEntryFormValues): EntryDraftPayload {
  const geographicScope = values.geographicScope;

  return {
    title: values.title.trim(),
    summary: values.summary.trim(),
    contentJson: values.contentJson,
    geographicScope,
    provinceId: geographicScope === "PROVINCE" ? emptyToNull(values.provinceId) : null,
    districtId: geographicScope === "PROVINCE" ? emptyToNull(values.districtId) : null,
    categoryId: values.categoryId,
    contentTypeId: values.contentTypeId,
    villageOrLocation: emptyToNull(values.villageOrLocation),
  };
}

export function toSourceInput(source: CreateEntryFormValues["sources"][number], index: number) {
  return {
    id: source.id,
    type: source.type,
    title: emptyToUndefined(source.title),
    authorOrProvider: emptyToUndefined(source.authorOrProvider),
    publicationDate: emptyToUndefined(source.publicationDate),
    websiteUrl: normalizeWebsiteUrl(source.websiteUrl),
    bookOrArticleDetails: emptyToUndefined(source.bookOrArticleDetails),
    interviewDate: emptyToUndefined(source.interviewDate),
    explanation: emptyToUndefined(source.explanation),
    displayOrder: index,
  };
}

export function isUsefulSource(source: EntrySourceInput & { id?: string }) {
  return Boolean(
    source.id ||
      source.title ||
      source.authorOrProvider ||
      source.publicationDate ||
      source.websiteUrl ||
      source.bookOrArticleDetails ||
      source.interviewDate ||
      source.explanation,
  );
}

export function emptyToUndefined(value: string | null | undefined) {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : undefined;
}

export function validateDistrictProvince(
  values: CreateEntryFormValues,
  districts: ContributionTaxonomyData["districts"],
  setError: UseFormSetError<CreateEntryFormValues>,
) {
  if (!values.districtId || !values.provinceId) {
    return true;
  }

  const district = districts.find((item) => item.id === values.districtId);

  if (district && district.provinceId === values.provinceId) {
    return true;
  }

  setError(
    "districtId",
    {
      type: "validate",
      message: "ولسوالی باید مربوط به ولایت انتخاب‌شده باشد.",
    },
    {
      shouldFocus: true,
    },
  );

  return false;
}

export function createMetadataSummary({
  values,
  provinces,
  categories,
  contentTypes,
  tagCount,
}: {
  values: WatchedEntryValues;
  provinces: ContributionTaxonomyData["provinces"];
  categories: ContributionTaxonomyData["categories"];
  contentTypes: ContributionTaxonomyData["contentTypes"];
  tagCount: number;
}) {
  const contentTypeName = contentTypes.find((item) => item.id === values.contentTypeId)?.name;
  const categoryName = categories.find((item) => item.id === values.categoryId)?.name;
  const location =
    values.geographicScope === "PROVINCE"
      ? provinces.find((item) => item.id === values.provinceId)?.name
      : values.geographicScope
        ? geographicScopeLabels[values.geographicScope]
        : undefined;
  const tagSummary = tagCount > 0 ? `${tagCount.toLocaleString("fa-AF")} برچسب` : undefined;

  return (
    [contentTypeName, categoryName, location, tagSummary].filter(Boolean).join(" · ") ||
    "هنوز کامل نشده"
  );
}

export function getFieldErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;

    return typeof message === "string" ? message : undefined;
  }

  return undefined;
}

function normalizeWebsiteUrl(value: string | undefined) {
  const trimmedValue = emptyToUndefined(value);

  if (!trimmedValue) {
    return undefined;
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}

function emptyToNull(value: string | null | undefined) {
  return emptyToUndefined(value) ?? null;
}
