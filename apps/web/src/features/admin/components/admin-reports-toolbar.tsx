"use client";

import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  adminReportReasons,
  adminReportStatusLabels,
  adminReportTargetLabels,
} from "@/features/admin/constants/admin-report-meta";
import type { AdminReportsQuery } from "@/features/admin/utils/admin-reports-url";
import { reportReasonLabels } from "@/features/moderation/utils/content-moderation-labels";
import { formatPersianNumber } from "@/lib/utils/formatters";

const ALL = "ALL";

function AdminReportsToolbar({
  query,
  total,
  pending,
  onChange,
  onClear,
}: {
  query: AdminReportsQuery;
  total: number;
  pending: boolean;
  onChange: (updates: Partial<AdminReportsQuery>) => void;
  onClear: () => void;
}) {
  const hasFilters = Boolean(query.status || query.targetType || query.reason);

  return (
    <div className="flex flex-col gap-4 border-b border-border p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground" aria-live="polite">
          <strong className="text-foreground">{formatPersianNumber(total)}</strong> گزارش
        </p>
        {hasFilters ? (
          <Button type="button" variant="ghost" size="sm" onClick={onClear} disabled={pending}>
            <XMarkIcon className="size-4" aria-hidden="true" /> حذف فیلترها
          </Button>
        ) : null}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
        <span className="flex shrink-0 items-center gap-1.5 text-[12px] font-semibold text-muted-foreground">
          <FunnelIcon className="size-4" aria-hidden="true" /> فیلترها
        </span>
        <ReportFilter
          label="وضعیت"
          value={query.status}
          placeholder="گزارش‌های فعال"
          options={Object.entries(adminReportStatusLabels)}
          disabled={pending}
          onChange={(status) => onChange({ status: status as AdminReportsQuery["status"] })}
        />
        <ReportFilter
          label="نوع گزارش"
          value={query.targetType}
          placeholder="همه محتواها"
          options={Object.entries(adminReportTargetLabels)}
          disabled={pending}
          onChange={(targetType) =>
            onChange({ targetType: targetType as AdminReportsQuery["targetType"] })
          }
        />
        <ReportFilter
          label="دلیل"
          value={query.reason}
          placeholder="همه دلیل‌ها"
          options={adminReportReasons.map((reason) => [reason, reportReasonLabels[reason]])}
          disabled={pending}
          onChange={(reason) => onChange({ reason: reason as AdminReportsQuery["reason"] })}
        />
      </div>
    </div>
  );
}

function ReportFilter({
  label,
  value,
  placeholder,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value?: string;
  placeholder: string;
  options: readonly (readonly [string, string])[];
  disabled: boolean;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <Select
      value={value ?? ALL}
      onValueChange={(next) => onChange(!next || next === ALL ? undefined : next)}
      disabled={disabled}
    >
      <SelectTrigger className="h-9 w-auto min-w-36 shrink-0 text-[12px]" aria-label={label}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent align="start">
        <SelectGroup>
          <SelectItem value={ALL}>{placeholder}</SelectItem>
          {options.map(([optionValue, optionLabel]) => (
            <SelectItem key={optionValue} value={optionValue}>
              {optionLabel}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export { AdminReportsToolbar };
