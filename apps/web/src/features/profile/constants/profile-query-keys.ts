const profileQueryKeys = {
  all: ["profile"] as const,
  owner: () => [...profileQueryKeys.all, "me"] as const,
  stats: () => [...profileQueryKeys.all, "stats"] as const,
  entries: (query: unknown) => [...profileQueryKeys.all, "entries", query] as const,
  reviewLists: () => [...profileQueryKeys.all, "reviews"] as const,
  reviews: (query: unknown) => [...profileQueryKeys.reviewLists(), query] as const,
  bookmarkLists: () => [...profileQueryKeys.all, "bookmarks"] as const,
  bookmarks: (query: unknown) => [...profileQueryKeys.bookmarkLists(), query] as const,
};

export { profileQueryKeys };
