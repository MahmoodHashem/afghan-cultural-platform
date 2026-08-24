import type { EntryCommentSort } from "@/features/engagement/types/entry-engagement";

const engagementQueryKeys = {
  all: ["entry-engagement"] as const,
  entry: (entryId: string) => [...engagementQueryKeys.all, entryId] as const,
  like: (entryId: string) => [...engagementQueryKeys.entry(entryId), "like"] as const,
  bookmark: (entryId: string) => [...engagementQueryKeys.entry(entryId), "bookmark"] as const,
  comments: (entryId: string) => [...engagementQueryKeys.entry(entryId), "comments"] as const,
  commentRoots: (entryId: string, sort: EntryCommentSort) =>
    [...engagementQueryKeys.comments(entryId), "roots", sort] as const,
  commentReplies: (entryId: string, parentId: string) =>
    [...engagementQueryKeys.comments(entryId), "replies", parentId] as const,
  commentInteractions: (entryId: string) =>
    [...engagementQueryKeys.comments(entryId), "interactions"] as const,
};

export { engagementQueryKeys };
