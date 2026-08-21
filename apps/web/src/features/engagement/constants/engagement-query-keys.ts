const engagementQueryKeys = {
  all: ["entry-engagement"] as const,
  entry: (entryId: string) => [...engagementQueryKeys.all, entryId] as const,
  like: (entryId: string) => [...engagementQueryKeys.entry(entryId), "like"] as const,
  bookmark: (entryId: string) => [...engagementQueryKeys.entry(entryId), "bookmark"] as const,
  reviews: (entryId: string) => [...engagementQueryKeys.entry(entryId), "reviews"] as const,
};

export { engagementQueryKeys };
