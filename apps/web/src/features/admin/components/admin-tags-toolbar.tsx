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
import type { AdminTagsQuery } from "@/features/admin/types/admin-tags";
import { cn } from "@/lib/utils";
import { formatPersianNumber } from "@/lib/utils/formatters";

const ALL_VALUE = "ALL";
const activeOptions = [
  { value: "true", label: "فعال" },
  { value: "false", label: "غیرفعال" },
] as const;
const sortOptions = [
  { value: "name:asc", label: "نام از الف تا ی" },
  { value: "createdAt:desc", label: "جدیدترین" },
  { value: "updatedAt:desc", label: "آخرین ویرایش" },
  { value: "slug:asc", label: "نشانی لاتین" },
] as const;

function AdminTagsToolbar({
  query,
  total,
  pending,
  onChange,
  onClear,
}: {
  query: AdminTagsQuery;
  total: number;
  pending: boolean;
  onChange: (updates: Partial<AdminTagsQuery>) => void;
  onClear: () => void;
}) {
  const [search, setSearch] = useState(query.search ?? "");
  const prefersReducedMotion = useReducedMotion();
  const hasFilters = Boolean(query.search || query.isActive !== undefined);
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
              htmlFor="admin-tag-search"
              className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3 transition-shadow focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/35"
            >
              <MagnifyingGlassIcon
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="sr-only">جست‌وجوی برچسب</span>
              <Input
                id="admin-tag-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جست‌وجو با نام یا نشانی..."
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
            className="flex min-w-20 items-center justify-end gap-1 text-[13px] text-muted-foreground"
            aria-live="polite"
          >
            <span className="relative grid overflow-hidden font-semibold text-foreground">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={total}
                  className="col-start-1 row-start-1"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  {formatPersianNumber(total)}
                </motion.span>
              </AnimatePresence>
            </span>{" "}
            برچسب
          </p>
          <AnimatePresence initial={false}>
            {hasFilters ? (
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
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
        <TagToolbarSelect
          label="وضعیت"
          value={query.isActive === undefined ? undefined : String(query.isActive)}
          placeholder="همه وضعیت‌ها"
          options={activeOptions}
          disabled={pending}
          onChange={(value) =>
            onChange({ isActive: value === undefined ? undefined : value === "true" })
          }
        />
        <TagToolbarSelect
          label="مرتب‌سازی"
          value={`${query.sortBy ?? "name"}:${query.sortDirection ?? "asc"}`}
          placeholder="مرتب‌سازی"
          options={sortOptions}
          includeAll={false}
          disabled={pending}
          onChange={(value) => {
            const [sortBy, sortDirection] = value?.split(":") ?? [];
            onChange({
              sortBy: sortBy as AdminTagsQuery["sortBy"],
              sortDirection: sortDirection as AdminTagsQuery["sortDirection"],
            });
          }}
        />
      </div>
    </div>
  );
}

function TagToolbarSelect({
  label,
  value,
  placeholder,
  options,
  includeAll = true,
  disabled,
  onChange,
}: {
  label: string;
  value?: string;
  placeholder: string;
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
      onValueChange={(next) => onChange(next === null || next === ALL_VALUE ? undefined : next)}
    >
      <SelectTrigger
        aria-label={label}
        size="sm"
        disabled={disabled}
        className={cn(
          "h-9 w-auto min-w-36 shrink-0 bg-card px-3 text-[12px] shadow-none",
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

export { AdminTagsToolbar };
