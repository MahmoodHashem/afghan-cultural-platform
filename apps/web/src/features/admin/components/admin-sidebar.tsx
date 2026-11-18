import Image from "next/image";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AdminNavigation } from "@/features/admin/components/admin-navigation";
import { AdminSidebarLabel } from "@/features/admin/components/admin-sidebar-label";
import { AdminUserMenu } from "@/features/admin/components/admin-user-menu";

function AdminSidebar() {
  return (
    <Sidebar side="right" dir="rtl" collapsible="icon" className="border-e-0">
      <SidebarHeader className="h-16 justify-center px-3 group-data-[collapsible=icon]:px-2 mb-4 border-b border-sidebar-border">
        <Link
          href="/admin"
          className="flex min-w-0 items-center gap-3 rounded-control outline-none transition-all focus-visible:outline-2 focus-visible:outline-sidebar-ring group-data-[collapsible=icon]:justify-center"
        >
          <Image
            src="/images/small-logo.png"
            alt=""
            width={30}
            height={35}
            sizes="40px"
            className="h-7 w-auto shrink-0 brightness-0 invert"
          />
          <AdminSidebarLabel className="block">
            <span className="block truncate text-[16px] font-bold text-white">
              میراث افغانستان
            </span>
            <span className="block truncate font-hand text-[15px] text-gold">پنل مدیریت</span>
          </AdminSidebarLabel>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <AdminNavigation />
      </SidebarContent>

      <SidebarFooter className="p-2">
        <AdminUserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export { AdminSidebar };
