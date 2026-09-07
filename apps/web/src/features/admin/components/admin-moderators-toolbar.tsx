"use client";

import { MagnifyingGlassIcon, UserPlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
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
import type { AdminModeratorsQuery } from "@/features/admin/utils/admin-moderators-url";
import { formatPersianNumber } from "@/lib/utils/formatters";

const ALL_VALUE = "ALL";

function AdminModeratorsToolbar({
  query,
  total,
  pending,
  onChange,
  onClear,
  onAdd,
}: {
  query: AdminModeratorsQuery;
  total: number;
  pending: boolean;
  onChange: (updates: Partial<AdminModeratorsQuery>) => void;
  onClear: () => void;
  onAdd: () => void;
}) {
  const [search, setSearch] = useState(query.search ?? "");
  const hasFilters = Boolean(query.search || query.status || query.emailVerified !== undefined);

  useEffect(() => setSearch(query.search ?? ""), [query.search]);

  return (
    <div className="space-y-4 border-b border-border p-4 md:p-5">
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
              htmlFor="admin-moderator-search"
              className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/35"
            >
              <MagnifyingGlassIcon className="size-4 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">جست‌وجوی ناظر</span>
              <Input
                id="admin-moderator-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جست‌وجو با نام یا ایمیل..."
                dir="auto"
                className="h-auto min-w-0 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              />
            </label>
            <Button type="submit" size="sm" className="h-10 px-4" disabled={pending}>
              جست‌وجو
            </Button>
          </form>
        </search>

        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] text-muted-foreground" aria-live="polite">
            <strong className="text-foreground">{formatPersianNumber(total)}</strong> ناظر
          </p>
          <Button type="button" onClick={onAdd}>
            <UserPlusIcon className="size-4" aria-hidden="true" />
            افزودن ناظر
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <ToolbarSelect
          label="وضعیت"
          placeholder="همه وضعیت‌ها"
          value={query.status}
          options={[
            { value: "ACTIVE", label: "فعال" },
            { value: "SUSPENDED", label: "تعلیق‌شده" },
          ]}
          disabled={pending}
          onChange={(value) => onChange({ status: value as AdminModeratorsQuery["status"] })}
        />
        <ToolbarSelect
          label="تأیید ایمیل"
          placeholder="همه ایمیل‌ها"
          value={query.emailVerified === undefined ? undefined : String(query.emailVerified)}
          options={[
            { value: "true", label: "تأییدشده" },
            { value: "false", label: "تأییدنشده" },
          ]}
          disabled={pending}
          onChange={(value) =>
            onChange({ emailVerified: value === undefined ? undefined : value === "true" })
          }
        />
        <ToolbarSelect
          label="مرتب‌سازی"
          placeholder="مرتب‌سازی"
          value={`${query.sortBy ?? "createdAt"}:${query.sortDirection ?? "desc"}`}
          options={[
            { value: "createdAt:desc", label: "جدیدترین" },
            { value: "createdAt:asc", label: "قدیمی‌ترین" },
            { value: "displayName:asc", label: "نام از الف تا ی" },
            { value: "lastLoginAt:desc", label: "آخرین ورود" },
          ]}
          includeAll={false}
          disabled={pending}
          onChange={(value) => {
            const [sortBy, sortDirection] = value?.split(":") ?? [];
            onChange({
              sortBy: sortBy as AdminModeratorsQuery["sortBy"],
              sortDirection: sortDirection as AdminModeratorsQuery["sortDirection"],
            });
          }}
        />
        {hasFilters ? (
          <Button type="button" variant="ghost" size="sm" onClick={onClear} disabled={pending}>
            <XMarkIcon className="size-4" aria-hidden="true" />
            حذف فیلترها
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ToolbarSelect({
  label,
  placeholder,
  value,
  options,
  includeAll = true,
  disabled,
  onChange,
}: {
  label: string;
  placeholder: string;
  value?: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  includeAll?: boolean;
  disabled: boolean;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <Select
      value={value ?? ALL_VALUE}
      disabled={disabled}
      onValueChange={(next) => onChange(!next || next === ALL_VALUE ? undefined : next)}
    >
      <SelectTrigger size="sm" className="w-auto min-w-36" aria-label={label}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {includeAll ? <SelectItem value={ALL_VALUE}>{placeholder}</SelectItem> : null}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export { AdminModeratorsToolbar };
