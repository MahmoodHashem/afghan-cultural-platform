"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { adminNavigation } from "@/features/admin/constants/admin-navigation";
import { isAdminRouteActive } from "@/features/admin/utils/admin-routes";
import { useAnimatedIcon } from "@/hooks/use-animated-icon";

function AdminNavigation() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const { isMobile, setOpenMobile, state } = useSidebar();
  const showLabels = isMobile || state === "expanded";

  return adminNavigation.map((group, groupIndex) => (
    <SidebarGroup key={group.label ?? `overview-${groupIndex}`}>
      {group.label ? (
        <SidebarGroupLabel>
          <AnimatePresence initial={false}>
            {showLabels ? (
              <motion.span
                initial={prefersReducedMotion ? false : { opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.1, ease: "easeOut" }}
              >
                {group.label}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </SidebarGroupLabel>
      ) : null}
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => {
            const isActive = isAdminRouteActive(pathname, item.href);

            return (
              <AdminNavigationItem
                key={item.href}
                item={item}
                isActive={isActive}
                showLabels={showLabels}
                prefersReducedMotion={Boolean(prefersReducedMotion)}
                onNavigate={() => setOpenMobile(false)}
              />
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  ));
}

function AdminNavigationItem({
  item,
  isActive,
  showLabels,
  prefersReducedMotion,
  onNavigate,
}: {
  item: (typeof adminNavigation)[number]["items"][number];
  isActive: boolean;
  showLabels: boolean;
  prefersReducedMotion: boolean;
  onNavigate: () => void;
}) {
  const { iconRef, triggerProps } = useAnimatedIcon();

  return (
    <SidebarMenuItem className="flex items-center justify-center">
      <SidebarMenuButton
        render={
          <Link
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            onClick={onNavigate}
            {...triggerProps}
          />
        }
        isActive={isActive}
        tooltip={{ children: item.title, side: "left" }}
        className="relative isolate h-10 gap-3 rounded-md px-3 text-[14px] data-active:bg-transparent data-active:font-semibold data-active:text-sidebar-accent-foreground group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:text-center hover:bg-sidebar-accent/30"
      >
        {isActive ? (
          <motion.span
            layoutId="admin-active-navigation"
            className="absolute inset-0 z-0 rounded-md rounded-s-none border-s-2 border-primary bg-sidebar-accent group-data-[collapsible=icon]:border-s-0"
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 420, damping: 34 }
            }
            aria-hidden="true"
          />
        ) : null}
        <item.icon ref={iconRef} size={20} className="relative z-10" aria-hidden="true" />
        <AnimatePresence initial={false}>
          {showLabels ? (
            <motion.span
              initial={prefersReducedMotion ? false : { opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 4 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative z-10 truncate"
            >
              {item.title}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export { AdminNavigation };
