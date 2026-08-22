import { Badge } from "@/components/ui/badge";
import { adminEntryStatusMeta } from "@/features/admin/constants/admin-entry-meta";
import type { AdminEntryStatus } from "@/features/admin/types/admin-users";
import { cn } from "@/lib/utils";

function AdminEntryStatusBadge({ status }: { status: AdminEntryStatus }) {
  const meta = adminEntryStatusMeta[status];
  return (
    <Badge variant="outline" className={cn("rounded-full border-0 ring-1", meta.className)}>
      {meta.label}
    </Badge>
  );
}

export { AdminEntryStatusBadge };
