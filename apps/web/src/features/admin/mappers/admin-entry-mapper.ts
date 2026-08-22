import type { AdminEntryDetail, AdminEntryListItem } from "@/features/admin/types/admin-entries";

function mapAdminEntryListItem(entry: AdminEntryListItem): AdminEntryListItem {
  return entry;
}

function mapAdminEntryDetail(entry: AdminEntryDetail): AdminEntryDetail {
  return entry;
}

export { mapAdminEntryDetail, mapAdminEntryListItem };
