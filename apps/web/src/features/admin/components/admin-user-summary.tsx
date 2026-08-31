"use client";

import {
  BookmarkIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  HandThumbUpIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AdminEmailVerificationBadge,
  AdminUserRoleBadge,
  AdminUserStatusBadge,
} from "@/features/admin/components/admin-user-badges";
import { adminAuthMethodLabels } from "@/features/admin/constants/admin-user-meta";
import type { AdminUserDetail } from "@/features/admin/types/admin-users";
import { cn } from "@/lib/utils";
import { formatPersianDate, formatPersianNumber } from "@/lib/utils/formatters";
import { createUserInitials, getUserAvatarColorClass } from "@/lib/utils/user";

function AdminUserSummary({
  user,
  isCurrentUser,
  onStatusAction,
  onRevokeSessions,
}: {
  user: AdminUserDetail;
  isCurrentUser: boolean;
  onStatusAction: () => void;
  onRevokeSessions: () => void;
}) {
  const stats = [
    { label: "همه مطالب", value: user.stats.entries.total, icon: DocumentTextIcon },
    { label: "دیدگاه‌ها", value: user.stats.comments, icon: ChatBubbleLeftRightIcon },
    { label: "ذخیره‌ها", value: user.stats.bookmarks, icon: BookmarkIcon },
    { label: "پسندها", value: user.stats.likes, icon: HandThumbUpIcon },
  ];

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar className="size-15">
            {user.profileImageUrl ? <AvatarImage src={user.profileImageUrl} alt="" /> : null}
            <AvatarFallback className={cn("text-lg font-bold", getUserAvatarColorClass(user.id))}>
              {createUserInitials(user.displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-[20px] font-bold text-foreground">{user.displayName}</h2>
              <AdminUserRoleBadge role={user.role} />
              <AdminUserStatusBadge status={user.status} />
            </div>
            <p className="truncate text-[13px] text-muted-foreground" dir="ltr">
              {user.email}
            </p>
            <AdminEmailVerificationBadge verified={user.emailVerified} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onRevokeSessions}>
            <ShieldCheckIcon className="size-4" aria-hidden="true" />
            پایان نشست‌ها
          </Button>
          <Button
            type="button"
            variant={user.status === "ACTIVE" ? "destructive" : "default"}
            disabled={isCurrentUser}
            title={isCurrentUser ? "نمی‌توانید وضعیت حساب خودتان را تغییر دهید" : undefined}
            onClick={onStatusAction}
          >
            <NoSymbolIcon className="size-4" aria-hidden="true" />
            {user.status === "ACTIVE" ? "تعلیق حساب" : "فعال‌سازی حساب"}
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="آمار فعالیت کاربر">
        {stats.map((item) => (
          <Card key={item.label} className="gap-0 rounded-xl py-0 shadow-none">
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-[12px] text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-[24px] font-bold text-foreground">
                  {formatPersianNumber(item.value)}
                </p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/8 text-primary">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.8fr)]">
        <Card className="rounded-xl shadow-none">
          <CardHeader>
            <CardTitle className="text-[16px]">اطلاعات حساب</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-x-8 gap-y-5 text-[13px] sm:grid-cols-2">
            <AccountFact label="تاریخ عضویت" value={formatPersianDate(user.createdAt)} />
            <AccountFact
              label="آخرین ورود"
              value={user.lastLoginAt ? formatPersianDate(user.lastLoginAt) : "ثبت نشده"}
            />
            <AccountFact
              label="روش‌های ورود"
              value={
                user.authMethods.map((method) => adminAuthMethodLabels[method]).join("، ") ||
                "نامشخص"
              }
            />
            <AccountFact label="ولایت" value={user.province?.name ?? "ثبت نشده"} />
            <AccountFact
              label="نشست‌های فعال"
              value={`${formatPersianNumber(user.stats.activeSessions)} نشست`}
            />
            <AccountFact
              label="تعلیق"
              value={user.suspendedAt ? formatPersianDate(user.suspendedAt) : "سابقه فعالی ندارد"}
            />
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-none">
          <CardHeader>
            <CardTitle className="text-[16px]">مشارکت و بازخورد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-[13px]">
            <SummaryLine label="گزارش‌های فرستاده‌شده" value={user.stats.reportsSubmitted} />
            <SummaryLine label="پیشنهادهای اصلاح" value={user.stats.correctionsSubmitted} />
            <SummaryLine label="مطالب منتشرشده" value={user.stats.entries.published} />
            <SummaryLine label="مطالب در انتظار بررسی" value={user.stats.entries.pendingReview} />
            {user.biography ? (
              <div className="border-t border-border pt-4">
                <p className="mb-1 text-[12px] text-muted-foreground">معرفی کوتاه</p>
                <p className="line-clamp-3 leading-6 text-foreground">{user.biography}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AccountFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{formatPersianNumber(value)}</span>
    </div>
  );
}

export { AdminUserSummary };
