"use client";

import { FunnelIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminAuditActions } from "@/features/admin/constants/admin-audit-meta";
import { getAdminAuditActionMeta } from "@/features/admin/mappers/admin-overview-mapper";
import type { AdminAuditAction, AdminAuditQuery } from "@/features/admin/types/admin-audit";
import { formatPersianNumber } from "@/lib/utils/formatters";

const ALL = "ALL";
const actionItems = [
  { value: ALL, label: "همه فعالیت‌ها" },
  ...adminAuditActions.map((action) => ({
    value: action,
    label: getAdminAuditActionMeta(action).label,
  })),
];

function AdminAuditToolbar({
  query,
  total,
  pending,
  onChange,
  onClear,
}: {
  query: AdminAuditQuery;
  total: number;
  pending: boolean;
  onChange: (updates: Partial<AdminAuditQuery>) => void;
  onClear: () => void;
}) {
  const [search, setSearch] = useState(query.search ?? "");
  const hasFilters = Boolean(query.search || query.action || query.dateFrom || query.dateTo);
  useEffect(() => setSearch(query.search ?? ""), [query.search]);

  return (
    <div className="space-y-4 border-b p-4 md:p-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <search className="min-w-0 flex-1">
          <form
            className="flex min-w-0 gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              onChange({ search: search.trim() || undefined });
            }}
          >
            <label
              htmlFor="admin-audit-search"
              className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/35"
            >
              <MagnifyingGlassIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="sr-only">جست‌وجوی تاریخچه</span>
              <Input
                id="admin-audit-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="نام مدیر، کاربر یا عنوان مطلب..."
                className="h-auto min-w-0 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              />
            </label>
            <Button type="submit" size="sm" className="h-10" disabled={pending}>
              جست‌وجو
            </Button>
          </form>
        </search>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] text-muted-foreground" aria-live="polite">
            <strong className="text-foreground">{formatPersianNumber(total)}</strong> رویداد
          </p>
          {hasFilters ? (
            <Button type="button" variant="ghost" size="sm" onClick={onClear} disabled={pending}>
              <XMarkIcon className="size-4" aria-hidden /> حذف فیلترها
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex items-end gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
        <span className="mb-2 flex shrink-0 items-center gap-1.5 text-[12px] font-semibold text-muted-foreground">
          <FunnelIcon className="size-4" aria-hidden /> فیلترها
        </span>
        <div className="grid shrink-0 gap-1 text-[11px] text-muted-foreground">
          <span>نوع فعالیت</span>
          <Select
            items={actionItems}
            value={query.action ?? ALL}
            onValueChange={(value) =>
              onChange({
                action: !value || value === ALL ? undefined : (value as AdminAuditAction),
              })
            }
            disabled={pending}
          >
            <SelectTrigger className="h-9 w-48 text-[12px]" aria-label="نوع فعالیت">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                {actionItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <DateFilter
          id="admin-audit-date-from"
          label="از تاریخ"
          value={query.dateFrom}
          disabled={pending}
          onChange={(dateFrom) => onChange({ dateFrom })}
        />
        <DateFilter
          id="admin-audit-date-to"
          label="تا تاریخ"
          value={query.dateTo}
          disabled={pending}
          onChange={(dateTo) => onChange({ dateTo })}
        />
      </div>
    </div>
  );
}

function DateFilter({
  id,
  label,
  value,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value?: string;
  disabled: boolean;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <label htmlFor={id} className="grid shrink-0 gap-1 text-[11px] text-muted-foreground">
      {label}
      <Input
        id={id}
        type="date"
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value || undefined)}
        className="h-9 w-40 text-[12px]"
        dir="ltr"
      />
    </label>
  );
}

export { AdminAuditToolbar };
