import { adminNavItems } from "@/features/admin/constants/admin-navigation";

function normalizeAdminPath(pathname: string) {
  const normalized = pathname.split("?")[0]?.replace(/\/+$/, "") || "/admin";
  return normalized === "" ? "/admin" : normalized;
}

function isAdminRouteActive(pathname: string, href: string) {
  const currentPath = normalizeAdminPath(pathname);
  const targetPath = normalizeAdminPath(href);

  if (targetPath === "/admin") {
    return currentPath === targetPath;
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

function getAdminRouteMeta(pathname: string) {
  const matchedItem = [...adminNavItems]
    .sort((first, second) => second.href.length - first.href.length)
    .find((item) => isAdminRouteActive(pathname, item.href));

  return matchedItem ?? adminNavItems[0];
}

export { getAdminRouteMeta, isAdminRouteActive, normalizeAdminPath };
