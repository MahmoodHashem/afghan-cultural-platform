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
    <Sidebar side="right" dir="rtl" collapsible="icon" className="border-e ">
      <SidebarHeader className="h-16 justify-center px-3 group-data-[collapsible=icon]:px-2 mb-7">
        <Link
          href="/admin"
          className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <Image
            src="/images/small-logo.png"
            alt=""
            width={30}
            height={35}
            sizes="40px"
            className="h-7 w-auto shrink-0"
          />
          <AdminSidebarLabel className="block">
            <span className="block truncate text-[16px] font-bold text-primary">
              میراث افغانستان
            </span>
            <span className="block truncate text-[12px] text-muted-foreground">پنل مدیریت</span>
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
