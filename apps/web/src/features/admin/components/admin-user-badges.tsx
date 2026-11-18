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
        role === "ADMIN" && "border-brand/25 bg-brand-soft text-brand-ink",
        role === "MODERATOR" && "border-saffron/30 bg-tint-sand text-saffron",
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
          ? "border-brand/20 bg-brand-soft text-brand-ink"
          : "border-brand/20 bg-destructive/8 text-brand-ink",
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
        verified ? "text-brand-ink" : "text-copy",
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
