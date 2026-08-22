"use client";

import {
  BellIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getAdminRouteMeta } from "@/features/admin/utils/admin-routes";
import { createUserInitials } from "@/lib/utils/user";
import { useAuthStore } from "@/stores/auth-store";

function AdminHeader() {
  const pathname = usePathname();
  const route = getAdminRouteMeta(pathname);
  const user = useAuthStore((state) => state.user);
  const prefersReducedMotion = useReducedMotion();

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center border-b border-border bg-card/95 px-4 backdrop-blur-sm md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <SidebarTrigger className="size-9 rounded-lg border border-border md:border-transparent" />
        <Breadcrumb className="hidden min-w-0 sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <span className="text-muted-foreground">پنل مدیریت</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="grid min-w-0 overflow-hidden font-semibold">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={route.href}
                    layout
                    initial={prefersReducedMotion ? false : { opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -6 }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.16,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="col-start-1 row-start-1 block truncate"
                  >
                    {route.title}
                  </motion.span>
                </AnimatePresence>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mx-4 hidden w-full max-w-md lg:block">
        <div className="relative">
          <MagnifyingGlassIcon
            className="absolute inset-s-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            readOnly
            aria-label="جست‌وجو در پنل مدیریت؛ در مرحله بعد فعال می‌شود"
            placeholder="جست‌وجو در کاربران، مطالب و برچسب‌ها..."
            className="h-10 rounded-lg ps-10 pe-14 text-[13px]"
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-1">
        <HeaderPlaceholderButton label="اعلان‌ها">
          <BellIcon className="size-5" aria-hidden="true" />
        </HeaderPlaceholderButton>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="ms-1 h-11 gap-2 rounded-lg px-2"
                  aria-label="منوی حساب مدیر"
                />
              }
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary-light text-primary">
                  {createUserInitials(user.displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-28 truncate text-[12px] font-semibold xl:block">
                {user.displayName}
              </span>
              <ChevronDownIcon
                className="hidden size-3.5 text-muted-foreground xl:block"
                aria-hidden="true"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="min-w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <span className="block text-foreground">{user.displayName}</span>
                  <span className="block font-normal" dir="ltr">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/profile" />}>
                <UserCircleIcon className="size-4" aria-hidden="true" />
                پروفایل
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </header>
  );
}

function HeaderPlaceholderButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button type="button" variant="ghost" size="icon" aria-label={label} disabled />}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom">{label} در مرحله بعد فعال می‌شود</TooltipContent>
    </Tooltip>
  );
}

export { AdminHeader };
