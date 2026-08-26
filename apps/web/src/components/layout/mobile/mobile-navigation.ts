import {
  HomeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PlusIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

type MobileNavKey = "home" | "explore" | "create" | "provinces" | "profile";

type MobileNavItem = {
  key: MobileNavKey;
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  protected: boolean;
  prominent?: boolean;
};

type MobileRouteContext = {
  kind: "home" | "explore" | "province" | "category" | "entry" | "profile";
  title: string;
  backHref?: string;
  backLabel?: string;
};

const mobileNavigation: MobileNavItem[] = [
  { key: "home", label: "خانه", href: "/", icon: HomeIcon, protected: false },
  {
    key: "explore",
    label: "مطالب",
    href: "/explore",
    icon: MagnifyingGlassIcon,
    protected: false,
  },
  {
    key: "create",
    label: "افزودن",
    href: "/entries/new",
    icon: PlusIcon,
    protected: true,
    prominent: true,
  },
  {
    key: "provinces",
    label: "ولایت‌ها",
    href: "/provinces",
    icon: MapPinIcon,
    protected: false,
  },
  {
    key: "profile",
    label: "حساب",
    href: "/profile",
    icon: UserCircleIcon,
    protected: true,
  },
];

function getMobileRouteContext(pathname: string): MobileRouteContext | null {
  if (pathname === "/") return { kind: "home", title: "میراث افغانستان" };
  if (pathname === "/explore") return { kind: "explore", title: "مطالب" };
  if (pathname === "/provinces") return { kind: "province", title: "ولایت‌ها" };
  if (pathname.startsWith("/provinces/")) {
    return {
      kind: "province",
      title: "ولایت",
      backHref: "/provinces",
      backLabel: "بازگشت به ولایت‌ها",
    };
  }
  if (pathname === "/categories") return { kind: "category", title: "موضوع‌ها" };
  if (pathname.startsWith("/categories/")) {
    return {
      kind: "category",
      title: "موضوع",
      backHref: "/categories",
      backLabel: "بازگشت به موضوع‌ها",
    };
  }
  if (
    pathname.startsWith("/entries/") &&
    pathname !== "/entries/new" &&
    !pathname.endsWith("/edit")
  ) {
    return {
      kind: "entry",
      title: "مطلب",
      backHref: "/explore",
      backLabel: "بازگشت به مطالب",
    };
  }
  if (pathname === "/profile") return { kind: "profile", title: "حساب کاربری" };

  return null;
}

function isMobileNavItemActive(key: MobileNavKey, pathname: string) {
  if (key === "home") return pathname === "/";
  if (key === "provinces") return pathname.startsWith("/provinces");
  if (key === "profile") return pathname === "/profile";
  if (key === "create") return pathname === "/entries/new" || pathname.endsWith("/edit");

  return (
    pathname === "/explore" ||
    pathname.startsWith("/categories") ||
    (pathname.startsWith("/entries/") && pathname !== "/entries/new")
  );
}

export type { MobileNavItem, MobileNavKey, MobileRouteContext };
export { getMobileRouteContext, isMobileNavItemActive, mobileNavigation };
