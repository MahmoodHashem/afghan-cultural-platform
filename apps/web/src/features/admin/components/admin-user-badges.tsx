import { CheckCircleIcon, ExclamationTriangleIcon, NoSymbolIcon } from "@heroicons/react/20/solid";

import { Badge } from "@/components/ui/badge";
import {
  adminUserRoleLabels,
  adminUserStatusLabels,
} from "@/features/admin/constants/admin-user-meta";
import type { AdminUserRole, AdminUserStatus } from "@/features/admin/types/admin-users";
import { cn } from "@/lib/utils";

function AdminUserRoleBadge({ role }: { role: AdminUserRole }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full",
        role === "ADMIN" && "border-primary/25 bg-primary/8 text-primary",
        role === "MODERATOR" && "border-gold/35 bg-gold/10 text-[#7A5A18]",
      )}
    >
      {adminUserRoleLabels[role]}
    </Badge>
  );
}

function AdminUserStatusBadge({ status }: { status: AdminUserStatus }) {
  const isActive = status === "ACTIVE";
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full",
        isActive
          ? "border-primary/20 bg-primary/8 text-primary"
          : "border-destructive/20 bg-destructive/8 text-destructive",
      )}
    >
      {isActive ? <CheckCircleIcon /> : <NoSymbolIcon />}
      {adminUserStatusLabels[status]}
    </Badge>
  );
}

function AdminEmailVerificationBadge({ verified }: { verified: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[12px]",
        verified ? "text-primary" : "text-muted-foreground",
      )}
    >
      {verified ? (
        <CheckCircleIcon className="size-4" />
      ) : (
        <ExclamationTriangleIcon className="size-4" />
      )}
      {verified ? "تأییدشده" : "تأییدنشده"}
    </span>
  );
}

export { AdminEmailVerificationBadge, AdminUserRoleBadge, AdminUserStatusBadge };
