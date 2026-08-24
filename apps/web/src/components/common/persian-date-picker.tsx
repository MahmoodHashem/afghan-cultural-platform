"use client";

import { CalendarDaysIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const persianDateFormatter = new Intl.DateTimeFormat("fa-AF-u-ca-persian", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const afghanPersianMonthFormatter = new Intl.DateTimeFormat("fa-AF-u-ca-persian", {
  month: "long",
});

type PersianDatePickerProps = {
  id: string;
  value?: string;
  onValueChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
};

function PersianDatePicker({
  id,
  value,
  onValueChange,
  onBlur,
  disabled,
  className,
}: PersianDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = useMemo(() => parseIsoDate(value), [value]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-11 w-full justify-start border-border bg-card px-3 font-normal",
              !value && "text-muted-foreground",
              className,
            )}
            onBlur={onBlur}
          />
        }
      >
        <CalendarDaysIcon className="size-4" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-right">
          {selectedDate ? persianDateFormatter.format(selectedDate) : value || "تاریخ را انتخاب کنید"}
        </span>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-auto p-0" dir="rtl">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) {
              return;
            }

            onValueChange(toIsoDate(date));
            setIsOpen(false);
          }}
          captionLayout="dropdown"
          startMonth={new Date(1800, 0, 1)}
          endMonth={new Date()}
          disabled={{ after: new Date() }}
          formatters={{
            formatMonthDropdown: (date) => afghanPersianMonthFormatter.format(date),
          }}
        />

        {value ? (
          <div className="border-t border-border p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                onValueChange("");
                setIsOpen(false);
              }}
            >
              <XMarkIcon aria-hidden="true" />
              پاک کردن تاریخ
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function parseIsoDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function toIsoDate(date: Date) {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export { PersianDatePicker };
