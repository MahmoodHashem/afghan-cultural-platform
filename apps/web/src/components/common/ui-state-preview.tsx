"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";

function UiStatePreview() {
  const isMobileNavOpen = useUiStore((state) => state.isMobileNavOpen);
  const isDashboardSidebarOpen = useUiStore((state) => state.isDashboardSidebarOpen);
  const toggleMobileNav = useUiStore((state) => state.toggleMobileNav);
  const toggleDashboardSidebar = useUiStore((state) => state.toggleDashboardSidebar);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant={isMobileNavOpen ? "default" : "outline"}>
          منوی موبایل: {isMobileNavOpen ? "باز" : "بسته"}
        </Badge>
        <Badge variant={isDashboardSidebarOpen ? "default" : "outline"}>
          نوار کناری: {isDashboardSidebarOpen ? "باز" : "بسته"}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={toggleMobileNav}>
          تغییر منوی موبایل
        </Button>
        <Button type="button" variant="outline" onClick={toggleDashboardSidebar}>
          تغییر نوار کناری
        </Button>
      </div>
    </div>
  );
}

export { UiStatePreview };
