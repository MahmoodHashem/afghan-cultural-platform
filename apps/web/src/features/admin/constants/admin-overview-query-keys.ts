const adminOverviewQueryKeys = {
  all: ["admin", "overview"] as const,
  detail: () => [...adminOverviewQueryKeys.all, "detail"] as const,
};

export { adminOverviewQueryKeys };
