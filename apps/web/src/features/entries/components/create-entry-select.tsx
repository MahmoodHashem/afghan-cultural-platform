"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatPersianNumber } from "@/lib/utils/formatters";
import { normalizePersianSearch } from "@/lib/utils/persian";

type SelectOption = {
  label: string;
  value: string;
  description?: string;
};

type CreateEntrySelectProps = {
  id: string;
  label: string;
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  error?: string;
  disabled?: boolean;
};

type TagMultiSelectProps = {
  label: string;
  selectedValues: string[];
  options: SelectOption[];
  onChange: (values: string[]) => void;
  error?: string;
};

function CreateEntrySelect({
  id,
  label,
  value,
  onValueChange,
  options,
  placeholder,
  error,
  disabled,
}: CreateEntrySelectProps) {
  const [searchValue, setSearchValue] = useState("");
  const isSearchable = options.length > 10;
  const orderedOptions = useOrderedOptions(options, value, searchValue);
  const filteredOptions = useFilteredOptions(orderedOptions, searchValue, isSearchable);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-small font-semibold text-foreground">
        {label}
      </label>
      <Select
        items={options}
        value={value ?? null}
        onValueChange={(nextValue) => {
          if (typeof nextValue === "string") {
            onValueChange(nextValue);
          }

          setSearchValue("");
        }}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          aria-invalid={Boolean(error)}
          className={cn("h-11 border-border bg-card", error && "border-destructive")}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent align="end" alignItemWithTrigger={false} className="max-h-80 min-w-64">
          {isSearchable ? (
            <form
              className="sticky top-0 z-10 border-b border-border bg-popover p-2"
              onKeyDown={(event) => event.stopPropagation()}
            >
              <div className="relative">
                <MagnifyingGlassIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder={`جست‌وجوی ${label}...`}
                  className="h-9 pr-9 text-small"
                  autoComplete="off"
                />
              </div>
            </form>
          ) : null}
          <SelectGroup>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className={cn(value === option.value && "bg-primary/10 text-primary")}
                >
                  <span className="flex flex-col text-right">
                    <span>{option.label}</span>
                    {option.description ? (
                      <span className="text-[11px] text-muted-foreground">
                        {option.description}
                      </span>
                    ) : null}
                  </span>
                </SelectItem>
              ))
            ) : (
              <div className="px-3 py-6 text-center text-small text-muted-foreground">
                نتیجه‌ای پیدا نشد
              </div>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
      {error ? <p className="text-small text-destructive">{error}</p> : null}
    </div>
  );
}

function TagMultiSelect({ label, selectedValues, options, onChange, error }: TagMultiSelectProps) {
  const [searchValue, setSearchValue] = useState("");
  const isSearchable = options.length > 10;
  const selectedOptions = options.filter((option) => selectedValues.includes(option.value));
  const orderedOptions = useOrderedOptions(options, selectedValues[0], searchValue).sort((a, b) => {
    if (searchValue.trim()) {
      return 0;
    }

    const aSelected = selectedValues.includes(a.value);
    const bSelected = selectedValues.includes(b.value);

    return Number(bSelected) - Number(aSelected);
  });
  const filteredOptions = useFilteredOptions(orderedOptions, searchValue, isSearchable);

  function toggleTag(value: string) {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((selectedValue) => selectedValue !== value));
      return;
    }

    onChange([...selectedValues, value]);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-small font-semibold text-foreground">{label}</span>
        <span className="text-[12px] text-muted-foreground">
          {formatPersianNumber(selectedValues.length)} انتخاب
        </span>
      </div>
      {selectedOptions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-small font-medium text-primary transition-colors hover:bg-primary/15"
              onClick={() => toggleTag(option.value)}
            >
              {option.label}
              <XMarkIcon aria-hidden="true" className="size-3.5" />
            </button>
          ))}
        </div>
      ) : null}
      {isSearchable ? (
        <div className="relative">
          <MagnifyingGlassIcon
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="جست‌وجوی برچسب..."
            className="h-10 pr-9"
            autoComplete="off"
          />
        </div>
      ) : null}
      <div
        className={cn(
          "flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-xl border border-border bg-background/70 p-3",
          error && "border-destructive",
        )}
      >
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option) => {
            const selected = selectedValues.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "rounded-full border px-3 py-1.5 text-small transition-colors",
                  selected
                    ? "border-primary/20 bg-primary/10 font-semibold text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-primary",
                )}
                aria-pressed={selected}
                onClick={() => toggleTag(option.value)}
              >
                {option.label}
              </button>
            );
          })
        ) : (
          <p className="w-full py-4 text-center text-small text-muted-foreground">
            برچسبی پیدا نشد.
          </p>
        )}
      </div>
      {error ? <p className="text-small text-destructive">{error}</p> : null}
    </div>
  );
}

function useOrderedOptions(
  options: SelectOption[],
  selectedValue: string | undefined,
  search: string,
) {
  return useMemo(() => {
    if (!selectedValue || search.trim()) {
      return options;
    }

    const selectedOption = options.find((option) => option.value === selectedValue);

    if (!selectedOption) {
      return options;
    }

    return [selectedOption, ...options.filter((option) => option.value !== selectedValue)];
  }, [options, search, selectedValue]);
}

function useFilteredOptions(options: SelectOption[], search: string, enabled: boolean) {
  return useMemo(() => {
    if (!enabled || !search.trim()) {
      return options;
    }

    const normalizedSearch = normalizePersianSearch(search);

    return options.filter((option) =>
      normalizePersianSearch(`${option.label} ${option.description ?? ""}`).includes(
        normalizedSearch,
      ),
    );
  }, [enabled, options, search]);
}

export type { SelectOption };
export { CreateEntrySelect, TagMultiSelect };
