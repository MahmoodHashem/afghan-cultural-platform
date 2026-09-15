const adminAuditQueryKeys = {
  all: ["admin", "audit"] as const,
  lists: () => [...adminAuditQueryKeys.all, "list"] as const,
  list: (query: unknown) => [...adminAuditQueryKeys.lists(), query] as const,
};

export { adminAuditQueryKeys };
