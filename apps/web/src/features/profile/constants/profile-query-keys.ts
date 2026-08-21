const profileQueryKeys = {
  all: ["profile"] as const,
  owner: () => [...profileQueryKeys.all, "me"] as const,
  stats: () => [...profileQueryKeys.all, "stats"] as const,
  entries: (query: unknown) => [...profileQueryKeys.all, "entries", query] as const,
  reviews: (query: unknown) => [...profileQueryKeys.all, "reviews", query] as const,
  bookmarks: (query: unknown) => [...profileQueryKeys.all, "bookmarks", query] as const,
};

export { profileQueryKeys };
