"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { href: "/moderator", label: "بررسی مطالب", exact: true },
  { href: "/moderator/corrections", label: "پیشنهادهای اصلاح" },
  { href: "/moderator/reports", label: "گزارش‌ها" },
  { href: "/moderator/history", label: "تاریخچه بررسی" },
];

function ModeratorNavigation() {
  const pathname = usePathname();

  return (
    <div className="content-container mb-7 overflow-x-auto" dir="rtl">
      <nav
        className="flex min-w-max gap-1 rounded-xl border border-border bg-card p-1"
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
                "rounded-lg px-4 py-2 text-[13px] font-semibold text-muted-foreground transition-colors",
                active && "bg-primary-light text-primary",
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
