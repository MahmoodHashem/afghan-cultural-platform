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
import { adminGeographicScopeLabels } from "@/features/admin/constants/admin-entry-meta";
import type {
  AdminEntriesQuery,
  AdminEntryTaxonomyData,
} from "@/features/admin/types/admin-entries";
import { cn } from "@/lib/utils";
import { formatPersianNumber } from "@/lib/utils/formatters";

const ALL = "ALL";
const sortOptions = [
  { value: "updatedAt:desc", label: "آخرین ویرایش" },
  { value: "createdAt:desc", label: "جدیدترین" },
  { value: "createdAt:asc", label: "قدیمی‌ترین" },
  { value: "submittedAt:desc", label: "آخرین ارسال" },
  { value: "publishedAt:desc", label: "آخرین انتشار" },
  { value: "title:asc", label: "عنوان از الف تا ی" },
  { value: "viewCount:desc", label: "بیشترین بازدید" },
] as const;

function AdminEntriesToolbar({
  query,
  total,
  taxonomy,
  pending,
  onChange,
  onClear,
}: {
  query: AdminEntriesQuery;
  total: number;
  taxonomy?: AdminEntryTaxonomyData;
  pending: boolean;
  onChange: (updates: Partial<AdminEntriesQuery>) => void;
  onClear: () => void;
}) {
  const [search, setSearch] = useState(query.search ?? "");
  const reducedMotion = useReducedMotion();
  const hasFilters = Boolean(
    query.search ||
      query.categoryId ||
      query.contentTypeId ||
      query.provinceId ||
      query.geographicScope,
  );
  useEffect(() => setSearch(query.search ?? ""), [query.search]);

  return (
    <div className="space-y-4 border-b border-border p-4 md:p-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <search className="min-w-0 flex-1">
          <form
            className="flex min-w-0 flex-1 gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              onChange({ search: search.trim() || undefined });
            }}
          >
            <label
              htmlFor="admin-entry-search"
              className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/35"
            >
              <MagnifyingGlassIcon
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="sr-only">جست‌وجوی مطلب</span>
              <Input
                id="admin-entry-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جست‌وجو در عنوان، نویسنده یا نشانی مطلب..."
                dir="auto"
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
            <strong className="text-foreground">{formatPersianNumber(total)}</strong> مطلب
          </p>
          <AnimatePresence initial={false}>
            {hasFilters ? (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, width: 0 }}
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
                  <XMarkIcon className="size-4" aria-hidden="true" /> حذف فیلترها
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
        <span className="flex shrink-0 items-center gap-1.5 text-[12px] font-semibold text-muted-foreground">
          <FunnelIcon className="size-4" aria-hidden="true" /> فیلترها
        </span>
        <EntrySelect
          label="موضوع"
          placeholder="همه موضوع‌ها"
          value={query.categoryId}
          options={taxonomy?.categories}
          disabled={pending}
          onChange={(categoryId) => onChange({ categoryId })}
        />
        <EntrySelect
          label="نوع مطلب"
          placeholder="همه نوع‌ها"
          value={query.contentTypeId}
          options={taxonomy?.contentTypes}
          disabled={pending}
          onChange={(contentTypeId) => onChange({ contentTypeId })}
        />
        <EntrySelect
          label="ولایت"
          placeholder="همه ولایت‌ها"
          value={query.provinceId}
          options={taxonomy?.provinces}
          disabled={pending}
          onChange={(provinceId) => onChange({ provinceId })}
        />
        <EntrySelect
          label="محدوده جغرافیایی"
          placeholder="همه محدوده‌ها"
          value={query.geographicScope}
          options={Object.entries(adminGeographicScopeLabels).map(([value, label]) => ({
            value,
            label,
          }))}
          disabled={pending}
          onChange={(geographicScope) =>
            onChange({ geographicScope: geographicScope as AdminEntriesQuery["geographicScope"] })
          }
        />
        <EntrySelect
          label="مرتب‌سازی"
          placeholder="مرتب‌سازی"
          value={`${query.sortBy ?? "updatedAt"}:${query.sortDirection ?? "desc"}`}
          options={sortOptions}
          includeAll={false}
          disabled={pending}
          onChange={(value) => {
            const [sortBy, sortDirection] = value?.split(":") ?? [];
            onChange({
              sortBy: sortBy as AdminEntriesQuery["sortBy"],
              sortDirection: sortDirection as AdminEntriesQuery["sortDirection"],
            });
          }}
        />
      </div>
    </div>
  );
}

function EntrySelect({
  label,
  placeholder,
  value,
  options = [],
  includeAll = true,
  disabled,
  onChange,
}: {
  label: string;
  placeholder: string;
  value?: string;
  options?: ReadonlyArray<{
    id?: string;
    value?: string;
    name?: string;
    label?: string;
    isActive?: boolean;
  }>;
  includeAll?: boolean;
  disabled: boolean;
  onChange: (value: string | undefined) => void;
}) {
  const normalized = options.map((option) => ({
    value: option.value ?? option.id ?? "",
    label: `${option.label ?? option.name ?? ""}${option.isActive === false ? " (غیرفعال)" : ""}`,
  }));
  const items = includeAll ? [{ value: ALL, label: placeholder }, ...normalized] : normalized;
  return (
    <Select
      items={items}
      value={value ?? ALL}
      onValueChange={(next) => onChange(next === null || next === ALL ? undefined : next)}
    >
      <SelectTrigger
        aria-label={label}
        size="sm"
        disabled={disabled}
        className={cn(
          "h-9 w-auto min-w-36 shrink-0 bg-card text-[12px]",
          value && "border-primary/40 bg-primary/5 text-primary",
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

export { AdminEntriesToolbar };
