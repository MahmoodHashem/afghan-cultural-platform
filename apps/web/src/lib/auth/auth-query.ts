import type { QueryClient } from "@tanstack/react-query";

const currentUserQueryKey = ["auth", "current-user"] as const;
const privateQueryRoots = [
  "auth",
  "account",
  "dashboard",
  "moderator",
  "admin",
  "bookmarks",
  "profile",
] as const;

function setCurrentUserQuery(queryClient: QueryClient, user: unknown) {
  queryClient.setQueryData(currentUserQueryKey, user);
  void queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
}

function clearPrivateAuthQueries(queryClient: QueryClient) {
  for (const queryRoot of privateQueryRoots) {
    queryClient.removeQueries({ queryKey: [queryRoot] });
  }
}

export { clearPrivateAuthQueries, currentUserQueryKey, setCurrentUserQuery };
