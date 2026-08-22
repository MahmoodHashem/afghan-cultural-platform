"use client";

import {
  ArrowLeftStartOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ChevronUpDownIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { AdminSidebarLabel } from "@/features/admin/components/admin-sidebar-label";
import { useLogout } from "@/features/auth/hooks/use-auth-mutations";
import { createUserInitials } from "@/lib/utils/user";
import { useAuthStore } from "@/stores/auth-store";

function AdminUserMenu() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const prefersReducedMotion = useReducedMotion();
  const { isMobile, state } = useSidebar();
  const showLabels = isMobile || state === "expanded";

  if (!user) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="h-14 rounded-lg data-open:bg-sidebar-accent group-data-[collapsible=icon]:size-10!"
              />
            }
          >
            <Avatar size="lg" className="size-9">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {createUserInitials(user.displayName)}
              </AvatarFallback>
            </Avatar>
            <AdminSidebarLabel className="flex-1 text-start leading-5">
              <span className="block truncate text-[13px] font-semibold">{user.displayName}</span>
              <span className="block truncate text-[11px] text-sidebar-foreground/60" dir="ltr">
                {user.email}
              </span>
            </AdminSidebarLabel>
            {showLabels ? (
              <motion.span
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.12 }}
                className="ms-auto"
              >
                <ChevronUpDownIcon className="size-4" aria-hidden="true" />
              </motion.span>
            ) : null}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "bottom" : "left"}
            align="end"
            sideOffset={8}
            className="min-w-64"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-2">
                <span className="block font-semibold text-foreground">{user.displayName}</span>
                <span className="block font-normal text-muted-foreground" dir="ltr">
                  {user.email}
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/profile" />}>
              <UserCircleIcon className="size-4" aria-hidden="true" />
              پروفایل
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/" />}>
              <ArrowTopRightOnSquareIcon className="size-4" aria-hidden="true" />
              بازگشت به سایت
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
            >
              <ArrowLeftStartOnRectangleIcon className="size-4" aria-hidden="true" />
              {logout.isPending ? "در حال خروج..." : "خروج"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export { AdminUserMenu };
