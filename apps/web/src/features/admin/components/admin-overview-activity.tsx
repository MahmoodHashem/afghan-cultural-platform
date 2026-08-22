import { ClockIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  AdminActivityTone,
  AdminActivityViewModel,
} from "@/features/admin/types/admin-overview";
import { formatAdminRelativeTime } from "@/features/admin/utils/admin-overview-formatters";
import { cn } from "@/lib/utils";
import { formatPersianDate } from "@/lib/utils/formatters";
import { createUserInitials } from "@/lib/utils/user";

const activityToneClasses: Record<AdminActivityTone, string> = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  orange: "bg-amber-500",
  red: "bg-red-500",
  neutral: "bg-muted-foreground",
};

function AdminOverviewActivity({ activities }: { activities: AdminActivityViewModel[] }) {
  return (
    <Card className="rounded-xl shadow-[0_2px_10px_rgba(0,0,0,.035)]">
      <CardHeader className="flex-row items-center justify-between gap-4 border-b border-border px-5 pb-4">
        <CardTitle className="flex items-center gap-2 text-[16px]">
          <ClockIcon className="size-5 text-muted-foreground" aria-hidden="true" />
          فعالیت‌های اخیر
        </CardTitle>
        <Link
          href="/admin/audit"
          className="text-[12px] font-semibold text-primary outline-none hover:text-primary-hover focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          مشاهده همه
        </Link>
      </CardHeader>
      <CardContent className="px-5 pt-0">
        {activities.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-72 text-[12px] text-muted-foreground">فعالیت</TableHead>
                <TableHead className="min-w-44 text-[12px] text-muted-foreground">کاربر</TableHead>
                <TableHead className="min-w-36 text-[12px] text-muted-foreground">نوع</TableHead>
                <TableHead className="min-w-28 text-[12px] text-muted-foreground">زمان</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="min-w-72 whitespace-normal py-3 text-[13px] leading-6 text-foreground">
                    {activity.description}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarFallback className="bg-muted text-[10px] text-muted-foreground">
                          {createUserInitials(activity.actorName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-32 truncate text-[12px] text-foreground">
                        {activity.actorName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="inline-flex items-center gap-2 text-[12px] text-muted-foreground">
                      <span
                        className={cn("size-1.5 rounded-full", activityToneClasses[activity.tone])}
                        aria-hidden="true"
                      />
                      {activity.label}
                    </span>
                  </TableCell>
                  <TableCell
                    className="py-3 text-[12px] text-muted-foreground"
                    title={formatPersianDate(activity.createdAt)}
                  >
                    {formatAdminRelativeTime(activity.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex min-h-36 items-center justify-center text-center">
            <p className="text-[13px] text-muted-foreground">هنوز فعالیتی ثبت نشده است.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { AdminOverviewActivity };
