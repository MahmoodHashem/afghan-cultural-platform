"use client";

import { FunnelIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
import type { AdminUsersQuery } from "@/features/admin/types/admin-users";
import { cn } from "@/lib/utils";
import { formatPersianNumber } from "@/lib/utils/formatters";

const ALL_VALUE = "ALL";

const roleOptions = [
  { value: "USER", label: "کاربر" },
  { value: "MODERATOR", label: "ناظر" },
  { value: "ADMIN", label: "مدیر" },
] as const;
const statusOptions = [
  { value: "ACTIVE", label: "فعال" },
  { value: "SUSPENDED", label: "تعلیق‌شده" },
] as const;
const verificationOptions = [
  { value: "true", label: "ایمیل تأییدشده" },
  { value: "false", label: "ایمیل تأییدنشده" },
] as const;
const authMethodOptions = [
  { value: "PASSWORD", label: "رمز عبور" },
  { value: "GOOGLE", label: "گوگل" },
  { value: "FACEBOOK", label: "فیسبوک" },
] as const;
const sortOptions = [
  { value: "createdAt:desc", label: "جدیدترین کاربران" },
  { value: "createdAt:asc", label: "قدیمی‌ترین کاربران" },
  { value: "displayName:asc", label: "نام از الف تا ی" },
  { value: "lastLoginAt:desc", label: "آخرین ورود" },
] as const;

function AdminUsersToolbar({
  query,
  total,
  pending,
  onChange,
  onClear,
}: {
  query: AdminUsersQuery;
  total: number;
  pending: boolean;
  onChange: (updates: Partial<AdminUsersQuery>) => void;
  onClear: () => void;
}) {
  const [search, setSearch] = useState(query.search ?? "");
  const prefersReducedMotion = useReducedMotion();
  const hasFilters = Boolean(
    query.search ||
      query.role ||
      query.status ||
      query.authMethod ||
      query.emailVerified !== undefined,
  );
  const activeFilters = getActiveFilters(query);

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
              htmlFor="admin-user-search"
              className="group flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3 transition-shadow focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/35"
            >
              <MagnifyingGlassIcon
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="sr-only">جست‌وجوی کاربر</span>
              <Input
                id="admin-user-search"
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

        <div className="flex items-center justify-between gap-3 xl:justify-end">
          <p
            className="flex min-w-16 items-center justify-end gap-1 text-[13px] text-muted-foreground"
            aria-live="polite"
          >
            <span className="relative grid overflow-hidden font-semibold text-foreground">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={total}
                  className="col-start-1 row-start-1"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
                >
                  {formatPersianNumber(total)}
                </motion.span>
              </AnimatePresence>
            </span>
            کاربر
          </p>
          <AnimatePresence initial={false}>
            {hasFilters ? (
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, width: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
                className="overflow-hidden"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClear}
                  disabled={pending}
                  className="whitespace-nowrap"
                >
                  <XMarkIcon className="size-4" aria-hidden="true" />
                  حذف فیلترها
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
        <span className="flex shrink-0 items-center gap-1.5 text-[12px] font-semibold text-muted-foreground">
          <FunnelIcon className="size-4" aria-hidden="true" />
          فیلترها
        </span>
        <ToolbarSelect
          label="نقش"
          placeholder="همه نقش‌ها"
          value={query.role}
          options={roleOptions}
          disabled={pending}
          onChange={(value) => onChange({ role: value as AdminUsersQuery["role"] })}
        />
        <ToolbarSelect
          label="وضعیت"
          placeholder="همه وضعیت‌ها"
          value={query.status}
          options={statusOptions}
          disabled={pending}
          onChange={(value) => onChange({ status: value as AdminUsersQuery["status"] })}
        />
        <ToolbarSelect
          label="تأیید ایمیل"
          placeholder="همه ایمیل‌ها"
          value={query.emailVerified === undefined ? undefined : String(query.emailVerified)}
          options={verificationOptions}
          disabled={pending}
          onChange={(value) =>
            onChange({ emailVerified: value === undefined ? undefined : value === "true" })
          }
        />
        <ToolbarSelect
          label="روش ورود"
          placeholder="همه روش‌ها"
          value={query.authMethod}
          options={authMethodOptions}
          disabled={pending}
          onChange={(value) => onChange({ authMethod: value as AdminUsersQuery["authMethod"] })}
        />
        <ToolbarSelect
          label="مرتب‌سازی"
          placeholder="مرتب‌سازی"
          value={`${query.sortBy ?? "createdAt"}:${query.sortDirection ?? "desc"}`}
          options={sortOptions}
          includeAll={false}
          disabled={pending}
          onChange={(value) => {
            const [sortBy, sortDirection] = value?.split(":") ?? [];
            onChange({
              sortBy: sortBy as AdminUsersQuery["sortBy"],
              sortDirection: sortDirection as AdminUsersQuery["sortDirection"],
            });
          }}
        />
      </div>

      <AnimatePresence initial={false}>
        {activeFilters.length > 0 ? (
          <motion.div
            layout
            initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
            className="flex flex-wrap gap-2 overflow-hidden"
            aria-label="فیلترهای فعال"
          >
            <AnimatePresence initial={false} mode="popLayout">
              {activeFilters.map((filter) => (
                <motion.div
                  layout
                  key={filter.key}
                  initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.94, y: -3 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: -3 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
                >
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={pending}
                    onClick={() => onChange(filter.clear)}
                    aria-label={`حذف فیلتر ${filter.label}`}
                    className="h-7 rounded-full px-2.5 text-[11px] font-medium"
                  >
                    {filter.label}
                    <XMarkIcon className="size-3.5" aria-hidden="true" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
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
  const items = includeAll ? [{ value: ALL_VALUE, label: placeholder }, ...options] : [...options];

  return (
    <Select
      items={items}
      value={value ?? ALL_VALUE}
      onValueChange={(nextValue) =>
        onChange(nextValue === null || nextValue === ALL_VALUE ? undefined : nextValue)
      }
    >
      <SelectTrigger
        aria-label={label}
        size="sm"
        disabled={disabled}
        className={cn(
          "h-9 w-auto min-w-36 shrink-0 bg-card px-3 text-[12px] shadow-none transition-[border-color,box-shadow,background-color] duration-200",
          value !== undefined && "border-primary/40 bg-primary/5 text-primary",
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end" alignItemWithTrigger={false}>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

type ActiveFilter = {
  key: string;
  label: string;
  clear: Partial<AdminUsersQuery>;
};

function getActiveFilters(query: AdminUsersQuery): ActiveFilter[] {
  const filters: ActiveFilter[] = [];

  if (query.search) {
    filters.push({ key: "search", label: `جست‌وجو: ${query.search}`, clear: { search: undefined } });
  }
  if (query.role) {
    filters.push({
      key: "role",
      label: `نقش: ${findOptionLabel(roleOptions, query.role)}`,
      clear: { role: undefined },
    });
  }
  if (query.status) {
    filters.push({
      key: "status",
      label: `وضعیت: ${findOptionLabel(statusOptions, query.status)}`,
      clear: { status: undefined },
    });
  }
  if (query.emailVerified !== undefined) {
    const value = String(query.emailVerified);
    filters.push({
      key: "emailVerified",
      label: findOptionLabel(verificationOptions, value),
      clear: { emailVerified: undefined },
    });
  }
  if (query.authMethod) {
    filters.push({
      key: "authMethod",
      label: `ورود: ${findOptionLabel(authMethodOptions, query.authMethod)}`,
      clear: { authMethod: undefined },
    });
  }

  return filters;
}

function findOptionLabel(options: ReadonlyArray<{ value: string; label: string }>, value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export { AdminUsersToolbar };
