import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminHeader } from "@/features/admin/components/admin-header";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { RequireAuth, RequireRole } from "@/features/auth/components/route-gates";

export const metadata: Metadata = {
  title: { default: "پنل مدیریت میراث افغانستان", template: "%s | پنل مدیریت" },
  robots: { index: false, follow: false },
};

function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <RequireAuth>
      <RequireRole roles={["ADMIN"]}>
        <TooltipProvider delay={350}>
          <SidebarProvider dir="rtl" className="bg-background">
            <a
              href="#admin-content"
              className="fixed start-4 top-3 z-50 -translate-y-20 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-transform focus:translate-y-0"
            >
              رفتن به محتوای اصلی
            </a>
            <AdminSidebar />
            <SidebarInset className="min-h-0 min-w-0 overflow-hidden bg-background">
              <AdminHeader />
              <div id="admin-content" className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </RequireRole>
    </RequireAuth>
  );
}

export default AdminLayout;
