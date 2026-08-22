import { ClockIcon, DocumentTextIcon, FlagIcon, UsersIcon } from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

import { Card, CardContent } from "@/components/ui/card";
import type { AdminOverviewStats } from "@/features/admin/types/admin-overview";
import { cn } from "@/lib/utils";
import { formatPersianNumber } from "@/lib/utils/formatters";

type StatCardTone = "teal" | "blue" | "orange" | "red";

const toneClasses: Record<StatCardTone, { icon: string; surface: string; detail: string }> = {
  teal: {
    icon: "text-primary",
    surface: "bg-primary/10",
    detail: "text-primary",
  },
  blue: {
    icon: "text-blue-600",
    surface: "bg-blue-50",
    detail: "text-blue-600",
  },
  orange: {
    icon: "text-amber-600",
    surface: "bg-amber-50",
    detail: "text-amber-600",
  },
  red: {
    icon: "text-red-600",
    surface: "bg-red-50",
    detail: "text-red-600",
  },
};

function AdminOverviewStatsGrid({ stats }: { stats: AdminOverviewStats }) {
  const items: Array<{
    title: string;
    value: number;
    detail: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    tone: StatCardTone;
  }> = [
    {
      title: "کاربران",
      value: stats.users.total,
      detail: `${formatPersianNumber(stats.users.last30Days)} کاربر در ۳۰ روز اخیر`,
      icon: UsersIcon,
      tone: "teal",
    },
    {
      title: "مطالب منتشرشده",
      value: stats.publishedEntries.total,
      detail: `${formatPersianNumber(stats.publishedEntries.last30Days)} مطلب در ۳۰ روز اخیر`,
      icon: DocumentTextIcon,
      tone: "blue",
    },
    {
      title: "در انتظار بررسی",
      value: stats.pendingReview,
      detail: stats.pendingReview > 0 ? "نیازمند بررسی" : "صف بررسی خالی است",
      icon: ClockIcon,
      tone: "orange",
    },
    {
      title: "گزارش‌های باز",
      value: stats.openReports,
      detail:
        stats.staleReports > 0
          ? `${formatPersianNumber(stats.staleReports)} مورد قدیمی‌تر از ۳ روز`
          : "گزارش قدیمی وجود ندارد",
      icon: FlagIcon,
      tone: "red",
    },
  ];

  return (
    <section aria-label="آمار کلی" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <AdminStatCard key={item.title} {...item} />
      ))}
    </section>
  );
}

function AdminStatCard({
  title,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  title: string;
  value: number;
  detail: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone: StatCardTone;
}) {
  const classes = toneClasses[tone];

  return (
    <Card className="min-h-36 justify-center rounded-xl shadow-[0_2px_10px_rgba(0,0,0,.035)]">
      <CardContent className="flex items-center justify-between gap-4 px-5">
        <div className="min-w-0 space-y-2">
          <p className="text-[13px] font-semibold text-muted-foreground">{title}</p>
          <p className="text-[30px] font-bold leading-none text-foreground tabular-nums">
            {formatPersianNumber(value)}
          </p>
          <p className={cn("text-[12px] leading-5", classes.detail)}>{detail}</p>
        </div>
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-full",
            classes.surface,
            classes.icon,
          )}
          aria-hidden="true"
        >
          <Icon className="size-6" />
        </span>
      </CardContent>
    </Card>
  );
}

export { AdminOverviewStatsGrid };
