"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { href: "/moderator", label: "بررسی مطالب", exact: true },
  { href: "/moderator/revisions", label: "ویرایش‌های منتشرشده" },
  { href: "/moderator/corrections", label: "پیشنهادهای اصلاح" },
  { href: "/moderator/reports", label: "گزارش‌ها" },
  { href: "/moderator/history", label: "تاریخچه بررسی" },
];

function ModeratorNavigation() {
  const pathname = usePathname();

  return (
    <div className="content-container relative z-10 -mt-9 overflow-x-auto py-2">
      <nav
        className="flex w-max gap-1 rounded-full border border-line-soft bg-surface p-1.5 shadow-lift"
        aria-label="بخش‌های بررسی محتوا"
      >
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href || pathname.startsWith("/moderator/submissions")
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-2 text-[13px] font-bold text-copy transition-colors outline-none hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-ring",
                active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export { ModeratorNavigation };
