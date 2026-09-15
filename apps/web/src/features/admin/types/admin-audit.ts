import type { AdminAuditAction } from "@/features/admin/types/admin-overview";

type AdminAuditPerson = {
  id: string;
  displayName: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  profileImageUrl: string | null;
};

type AdminAuditItem = {
  id: string;
  action: AdminAuditAction;
  actor: AdminAuditPerson | null;
  targetUser: AdminAuditPerson | null;
  entry: { id: string; title: string; slug: string | null } | null;
  report: { id: string; reason: string; status: string } | null;
  correctionSuggestion: { id: string; section: string; status: string } | null;
  entryRevision: { id: string; status: string } | null;
  metadata: Record<string, string | number | boolean | null> | null;
  createdAt: string;
};

type AdminAuditQuery = {
  page: number;
  limit: number;
  search?: string;
  action?: AdminAuditAction;
  dateFrom?: string;
  dateTo?: string;
};

type AdminAuditResponse = {
  data: AdminAuditItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type { AdminAuditAction } from "@/features/admin/types/admin-overview";
export type { AdminAuditItem, AdminAuditPerson, AdminAuditQuery, AdminAuditResponse };
