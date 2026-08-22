"use client";

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

function AdminNavigation() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return adminNavigation.map((group, groupIndex) => (
    <SidebarGroup key={group.label ?? `overview-${groupIndex}`}>
      {group.label ? <SidebarGroupLabel>{group.label}</SidebarGroupLabel> : null}
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => {
            const isActive = isAdminRouteActive(pathname, item.href);

            return (
              <SidebarMenuItem key={item.href} className="flex items-center justify-center">
                <SidebarMenuButton
                  render={
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setOpenMobile(false)}
                    />
                  }
                  isActive={isActive}
                  tooltip={{ children: item.title, side: "left" }}
                  className="h-10 gap-3 px-3 text-[14px] data-active:border-s-2 rounded-s-sm data-active:border-primary data-active:bg-sidebar-accent data-active:font-semibold data-active:text-sidebar-accent-foreground group-data-[collapsible=icon]:border-s-0 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:text-center "
                >
                  <item.icon className="size-5" aria-hidden="true" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  ));
}

export { AdminNavigation };
