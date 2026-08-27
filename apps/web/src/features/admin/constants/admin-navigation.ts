import type { ForwardRefExoticComponent, HTMLAttributes, RefAttributes } from "react";
import { BookmarkSquareIcon } from "@/components/icons/animated/bookmark-square";
import { ClockIcon } from "@/components/icons/animated/clock";
import { Cog6ToothIcon } from "@/components/icons/animated/cog-6-tooth";
import { DocumentDuplicateIcon } from "@/components/icons/animated/document-duplicate";
import { DocumentTextIcon } from "@/components/icons/animated/document-text";
import { FlagIcon } from "@/components/icons/animated/flag";
import { MapPinIcon } from "@/components/icons/animated/map-pin";
import { ShieldCheckIcon } from "@/components/icons/animated/shield-check";
import { Squares2X2Icon } from "@/components/icons/animated/squares-2x2";
import { TagIcon } from "@/components/icons/animated/tag";
import { UsersIcon } from "@/components/icons/animated/users";
import type { AnimatedIconHandle } from "@/hooks/use-animated-icon";

type AdminNavIcon = ForwardRefExoticComponent<
  HTMLAttributes<HTMLDivElement> & { size?: number } & RefAttributes<AnimatedIconHandle>
>;

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
