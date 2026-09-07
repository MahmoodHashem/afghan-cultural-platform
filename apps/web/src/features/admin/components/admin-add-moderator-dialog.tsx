"use client";

import { MagnifyingGlassIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { type ReactNode, useDeferredValue, useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminEmailVerificationBadge } from "@/features/admin/components/admin-user-badges";
import { useAdminUsers } from "@/features/admin/hooks/use-admin-users";
import type { AdminUserListItem } from "@/features/admin/types/admin-users";
import { createUserInitials, getUserAvatarColorClass } from "@/lib/utils/user";

function AdminAddModeratorDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (user: AdminUserListItem) => void;
}) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const canSearch = open && deferredSearch.length >= 2;
  const usersQuery = useAdminUsers(
    {
      page: 1,
      limit: 10,
      search: deferredSearch,
      role: "USER",
      status: "ACTIVE",
      emailVerified: true,
      sortBy: "displayName",
      sortDirection: "asc",
    },
    canSearch,
  );

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl" dir="rtl">
        <DialogHeader className="border-b border-border px-5 py-5 text-start">
          <DialogTitle className="text-[18px] font-semibold">انتخاب ناظر جدید</DialogTitle>
          <DialogDescription className="text-[13px] leading-7">
            از میان کاربران فعال با ایمیل تأییدشده جست‌وجو کنید.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-5">
          <label
            htmlFor="admin-moderator-candidate-search"
            className="flex h-10 items-center gap-2 rounded-lg border border-input px-3 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/35"
          >
            <MagnifyingGlassIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">جست‌وجوی کاربر واجد شرایط</span>
            <Input
              id="admin-moderator-candidate-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="نام یا ایمیل کاربر..."
              autoFocus
              dir="auto"
              className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            />
          </label>

          <div
            className="min-h-60 overflow-y-auto rounded-lg border border-border"
            aria-live="polite"
          >
            {!canSearch ? (
              <CandidateState
                icon={<MagnifyingGlassIcon />}
                title="نام یا ایمیل را جست‌وجو کنید"
                description="برای آغاز جست‌وجو دست‌کم دو حرف بنویسید."
              />
            ) : null}
            {canSearch && usersQuery.isLoading ? <CandidateSkeleton /> : null}
            {canSearch && usersQuery.isError ? (
              <CandidateState
                title="جست‌وجو انجام نشد"
                description="ارتباط با سرور برقرار نشد. دوباره تلاش کنید."
                action={
                  <Button variant="outline" size="sm" onClick={() => void usersQuery.refetch()}>
                    تلاش دوباره
                  </Button>
                }
              />
            ) : null}
            {canSearch && usersQuery.data?.data.length === 0 ? (
              <CandidateState
                icon={<UserPlusIcon />}
                title="کاربر واجد شرایطی پیدا نشد"
                description="تنها کاربران فعال با ایمیل تأییدشده نمایش داده می‌شوند."
              />
            ) : null}
            {canSearch && !usersQuery.isError
              ? usersQuery.data?.data.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-start transition-colors last:border-b-0 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    onClick={() => onSelect(user)}
                  >
                    <Avatar className="size-10">
                      {user.profileImageUrl ? (
                        <AvatarImage src={user.profileImageUrl} alt="" />
                      ) : null}
                      <AvatarFallback className={getUserAvatarColorClass(user.id)}>
                        {createUserInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold">
                        {user.displayName}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground" dir="ltr">
                        {user.email}
                      </span>
                    </span>
                    <AdminEmailVerificationBadge verified={user.emailVerified} />
                  </button>
                ))
              : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CandidateState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-60 flex-col items-center justify-center gap-3 px-6 text-center">
      {icon ? <span className="size-7 text-muted-foreground [&>svg]:size-full">{icon}</span> : null}
      <div className="space-y-1">
        <p className="text-[14px] font-semibold">{title}</p>
        <p className="text-[12px] leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

function CandidateSkeleton() {
  return (
    <div className="space-y-1 p-3" role="status" aria-label="در حال جست‌وجوی کاربران">
      {["one", "two", "three"].map((item) => (
        <div key={item} className="flex items-center gap-3 px-1 py-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

export { AdminAddModeratorDialog };
