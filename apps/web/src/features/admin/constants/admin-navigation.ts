import {
  BookmarkSquareIcon,
  ClockIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  FlagIcon,
  MapPinIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  TagIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

type AdminNavIcon = ComponentType<SVGProps<SVGSVGElement>>;

type AdminNavItem = {
  title: string;
  href: string;
  icon: AdminNavIcon;
};

type AdminNavGroup = {
  label?: string;
  items: AdminNavItem[];
};

const adminNavigation: AdminNavGroup[] = [
  {
    items: [{ title: "نمای کلی", href: "/admin", icon: Squares2X2Icon }],
  },
  {
    label: "مدیریت",
    items: [
      { title: "کاربران", href: "/admin/users", icon: UsersIcon },
      { title: "مطالب", href: "/admin/entries", icon: DocumentTextIcon },
    ],
  },
  {
    label: "طبقه‌بندی",
    items: [
      { title: "موضوع‌ها", href: "/admin/topics", icon: TagIcon },
      { title: "نوع مطلب", href: "/admin/content-types", icon: DocumentDuplicateIcon },
      { title: "برچسب‌ها", href: "/admin/tags", icon: BookmarkSquareIcon },
      { title: "ولایت‌ها", href: "/admin/provinces", icon: MapPinIcon },
    ],
  },
  {
    label: "سیستم",
    items: [
      { title: "ناظران", href: "/admin/moderators", icon: ShieldCheckIcon },
      { title: "گزارش‌ها", href: "/admin/reports", icon: FlagIcon },
      { title: "تاریخچه فعالیت‌ها", href: "/admin/audit", icon: ClockIcon },
      { title: "تنظیمات", href: "/admin/settings", icon: Cog6ToothIcon },
    ],
  },
];

const adminNavItems = adminNavigation.flatMap((group) => group.items);

export type { AdminNavGroup, AdminNavIcon, AdminNavItem };
export { adminNavItems, adminNavigation };
