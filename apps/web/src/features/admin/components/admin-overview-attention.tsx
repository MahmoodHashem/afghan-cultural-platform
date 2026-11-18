import {
  ArrowLeftIcon,
  BellAlertIcon,
  ClockIcon,
  FlagIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminOverviewAttention as AdminOverviewAttentionData } from "@/features/admin/types/admin-overview";
import { cn } from "@/lib/utils";
import { formatPersianNumber } from "@/lib/utils/formatters";

function AdminOverviewAttention({ data }: { data: AdminOverviewAttentionData }) {
  const items = [
    {
      title: `${formatPersianNumber(data.openReports)} گزارش باز`,
      description:
        data.staleReports > 0
          ? `${formatPersianNumber(data.staleReports)} مورد بیش از ۳ روز باز مانده است`
          : "گزارش قدیمی وجود ندارد",
      href: "/moderator/reports",
      icon: FlagIcon,
      tone: "red",
      count: data.openReports,
    },
    {
      title: `${formatPersianNumber(data.pendingCorrections)} پیشنهاد اصلاح`,
      description: "در انتظار بررسی ناظر",
      href: "/moderator/corrections",
      icon: PencilSquareIcon,
      tone: "orange",
      count: data.pendingCorrections,
    },
    {
      title: `${formatPersianNumber(data.pendingSubmissions)} مطلب در انتظار بررسی`,
      description: "ارسال‌شده از سوی نویسندگان",
      href: "/moderator",
      icon: ClockIcon,
      tone: "blue",
      count: data.pendingSubmissions,
    },
  ] as const;
  const visibleItems = items.filter((item) => item.count > 0);

  return (
    <Card className="rounded-control shadow-card">
      <CardHeader className="px-5">
        <CardTitle className="flex items-center gap-2 text-[16px]">
          <BellAlertIcon className="size-5 text-copy" aria-hidden="true" />
          نیازمند توجه
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5">
        {visibleItems.length > 0 ? (
          <ul className="divide-y divide-line-soft">
            {visibleItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex min-h-16 items-center gap-3 rounded-control px-1 py-3 outline-none transition-colors hover:bg-paper focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-control",
                      item.tone === "red" && "bg-brand-soft text-brand-ink",
                      item.tone === "orange" && "bg-tint-sand text-saffron-deep dark:text-gold",
                      item.tone === "blue" && "bg-tint-navy text-lapis dark:text-copy",
                    )}
                    aria-hidden="true"
                  >
                    <item.icon className="size-4.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-ink">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-copy">
                      {item.description}
                    </span>
                  </span>
                  <ArrowLeftIcon
                    className="size-4 shrink-0 text-copy transition-transform group-hover:-translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex min-h-52 flex-col items-center justify-center gap-2 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand-ink">
              <BellAlertIcon className="size-5" aria-hidden="true" />
            </span>
            <p className="text-[13px] font-semibold text-ink">موردی نیازمند توجه نیست</p>
            <p className="text-[12px] text-copy">همه صف‌های بررسی به‌روز هستند.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { AdminOverviewAttention };
