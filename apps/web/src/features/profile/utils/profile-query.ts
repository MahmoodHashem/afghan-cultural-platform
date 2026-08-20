import type { EntryStatus } from "@/features/entries/api/entry-drafts-api";

type ProfileTab = "entries" | "reviews" | "bookmarks";

type ProfileQuery = {
  tab: ProfileTab;
  status?: EntryStatus;
  page: number;
};

type ProfileSearchParams = {
  get: (key: string) => string | null;
};

const PROFILE_TABS: ProfileTab[] = ["entries", "reviews", "bookmarks"];

const ENTRY_STATUS_VALUES: EntryStatus[] = [
  "DRAFT",
  "PENDING_REVIEW",
  "CHANGES_REQUESTED",
  "PUBLISHED",
  "REJECTED",
  "HIDDEN",
  "ARCHIVED",
];

function parseProfileQuery(searchParams: ProfileSearchParams): ProfileQuery {
  return {
    tab: parseProfileTab(searchParams.get("tab")),
    status: parseEntryStatus(searchParams.get("status")),
    page: parsePage(searchParams.get("page")),
  };
}

function createProfileHref(currentQuery: ProfileQuery, updates: Partial<ProfileQuery>) {
  const nextQuery = {
    ...currentQuery,
    ...updates,
  };
  const searchParams = new URLSearchParams();

  searchParams.set("tab", nextQuery.tab);

  if (nextQuery.status) {
    searchParams.set("status", nextQuery.status);
  }

  if (nextQuery.page > 1) {
    searchParams.set("page", String(nextQuery.page));
  }

  const queryString = searchParams.toString();

  return `/profile${queryString ? `?${queryString}` : ""}`;
}

function isProfileTab(value: string): value is ProfileTab {
  return PROFILE_TABS.includes(value as ProfileTab);
}

function isEntryStatus(value: string): value is EntryStatus {
  return ENTRY_STATUS_VALUES.includes(value as EntryStatus);
}

function parseProfileTab(value: string | null): ProfileTab {
  if (value && isProfileTab(value)) {
    return value;
  }

  return "entries";
}

function parseEntryStatus(value: string | null): EntryStatus | undefined {
  if (value && isEntryStatus(value)) {
    return value;
  }

  return undefined;
}

function parsePage(value: string | null) {
  const parsedPage = Number(value);

  if (Number.isInteger(parsedPage) && parsedPage > 0) {
    return parsedPage;
  }

  return 1;
}

export type { ProfileQuery, ProfileTab };
export {
  createProfileHref,
  ENTRY_STATUS_VALUES,
  isEntryStatus,
  isProfileTab,
  PROFILE_TABS,
  parseProfileQuery,
};
