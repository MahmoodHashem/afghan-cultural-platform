import type {
  ModerationQueueQuery,
  ModerationSortDirection,
} from "@/features/moderation/types/moderation";

type SearchParamsReader = {
  get: (key: string) => string | null;
};

const MODERATION_PAGE_SIZE = 15;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseModerationQueueQuery(searchParams: SearchParamsReader): ModerationQueueQuery {
  return {
    page: parsePage(searchParams.get("page")),
    limit: MODERATION_PAGE_SIZE,
    authorId: parseUuid(searchParams.get("authorId")),
    provinceId: parseUuid(searchParams.get("provinceId")),
    categoryId: parseUuid(searchParams.get("categoryId")),
    contentTypeId: parseUuid(searchParams.get("contentTypeId")),
    sortDirection: parseSortDirection(searchParams.get("sortDirection")),
  };
}

function createModerationQueueHref(
  currentQuery: ModerationQueueQuery,
  updates: Partial<ModerationQueueQuery>,
) {
  const nextQuery = { ...currentQuery, ...updates };
  const searchParams = new URLSearchParams();

  if (nextQuery.page > 1) {
    searchParams.set("page", String(nextQuery.page));
  }

  setValue(searchParams, "authorId", nextQuery.authorId);
  setValue(searchParams, "provinceId", nextQuery.provinceId);
  setValue(searchParams, "categoryId", nextQuery.categoryId);
  setValue(searchParams, "contentTypeId", nextQuery.contentTypeId);

  if (nextQuery.sortDirection !== "desc") {
    searchParams.set("sortDirection", nextQuery.sortDirection);
  }

  const queryString = searchParams.toString();
  return `/moderator${queryString ? `?${queryString}` : ""}`;
}

function parsePage(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function parseUuid(value: string | null) {
  return value && UUID_PATTERN.test(value) ? value : undefined;
}

function parseSortDirection(value: string | null): ModerationSortDirection {
  return value === "asc" ? "asc" : "desc";
}

function setValue(searchParams: URLSearchParams, key: string, value: string | undefined) {
  if (value) {
    searchParams.set(key, value);
  }
}

export { createModerationQueueHref, MODERATION_PAGE_SIZE, parseModerationQueueQuery };
