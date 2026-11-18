"use client";

import { CheckIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { type ReactNode, useMemo, useState } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();

  if (options.length > 10) {
    if (isMobile) {
      return (
        <MobileCreateEntrySelect
          id={id}
          label={label}
          value={value}
          onValueChange={onValueChange}
          options={options}
          placeholder={placeholder}
          error={error}
          disabled={disabled}
        />
      );
    }

    return (
      <SearchableCreateEntrySelect
        id={id}
        label={label}
        value={value}
        onValueChange={onValueChange}
        options={options}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
      />
    );
  }

  return (
    <CreateEntrySelectField label={label} id={id} error={error}>
      <Select
        items={options}
        value={value ?? null}
        onValueChange={(nextValue) => {
          if (typeof nextValue === "string") {
            onValueChange(nextValue);
          }
        }}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          aria-invalid={Boolean(error)}
          className={cn("h-11 border-line-soft bg-surface", error && "border-destructive")}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent align="end" alignItemWithTrigger={false} className="max-h-80 min-w-64">
          <SelectGroup>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className={cn(value === option.value && "bg-brand-soft text-brand-ink")}
              >
                <span className="flex flex-col text-right">
                  <span>{option.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </CreateEntrySelectField>
  );
}

function MobileCreateEntrySelect({
  id,
  label,
  value,
  onValueChange,
  options,
  placeholder,
  error,
  disabled,
}: CreateEntrySelectProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const selectedOption = options.find((option) => option.value === value);
  const orderedOptions = useOrderedOptions(options, value, searchValue);
  const filteredOptions = useFilteredOptions(orderedOptions, searchValue, true);

  return (
    <CreateEntrySelectField label={label} id={id} error={error}>
      <Drawer
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setSearchValue("");
        }}
        showSwipeHandle
      >
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-haspopup="dialog"
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-control border border-line bg-surface px-3 text-start text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-50",
            !selectedOption && "text-faint",
            error && "border-destructive",
          )}
          onClick={() => setOpen(true)}
        >
          <span className="truncate">{selectedOption?.label ?? placeholder}</span>
          <span aria-hidden="true">⌄</span>
        </button>
        <DrawerContent dir="rtl" className="max-h-[82dvh] border-line-soft">
          <DrawerHeader className="px-5 text-start">
            <DrawerTitle>{label}</DrawerTitle>
            <DrawerDescription>{placeholder}</DrawerDescription>
          </DrawerHeader>
          <div className="px-5 pt-3">
            <div className="relative">
              <MagnifyingGlassIcon
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-faint"
              />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={`جست‌وجوی ${label}...`}
                className="h-11 pr-9"
                autoFocus
                autoComplete="off"
              />
            </div>
          </div>
          <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {filteredOptions.length > 0 ? (
              <div className="divide-y divide-line-soft rounded-control border border-line-soft">
                {filteredOptions.map((option) => {
                  const selected = option.value === value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-start text-[14px] outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/40",
                        selected && "bg-brand-soft font-semibold text-brand-ink",
                      )}
                      aria-pressed={selected}
                      onClick={() => {
                        onValueChange(option.value);
                        setOpen(false);
                      }}
                    >
                      <span>{option.label}</span>
                      {selected ? <CheckIcon className="size-5" aria-hidden="true" /> : null}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="py-10 text-center text-small text-faint">
                نتیجه‌ای پیدا نشد.
              </p>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </CreateEntrySelectField>
  );
}

function SearchableCreateEntrySelect({
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
  const orderedOptions = useOrderedOptions(options, value, searchValue);
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  return (
    <CreateEntrySelectField label={label} id={id} error={error}>
      <Combobox
        items={orderedOptions}
        value={selectedOption}
        inputValue={searchValue}
        onInputValueChange={setSearchValue}
        onOpenChange={(open) => {
          if (!open) {
            setSearchValue("");
          }
        }}
        onValueChange={(nextOption) => {
          if (nextOption) {
            onValueChange(nextOption.value);
          }
          setSearchValue("");
        }}
        disabled={disabled}
        itemToStringLabel={(option) => option.label}
        isItemEqualToValue={(option, selected) => option.value === selected.value}
        filter={(option, query) => optionMatchesSearch(option, query)}
      >
        <ComboboxTrigger
          id={id}
          aria-invalid={Boolean(error)}
          className={cn("h-11 border-line-soft bg-surface", error && "border-destructive")}
        >
          <span className="flex min-w-0 flex-1 text-start">
            <ComboboxValue placeholder={placeholder} />
          </span>
        </ComboboxTrigger>
        <ComboboxContent aria-label={label} align="end" className="max-h-80 min-w-64">
          <div className="border-b border-line-soft bg-popover p-2">
            <div className="relative">
              <MagnifyingGlassIcon
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-faint"
              />
              <ComboboxInput
                placeholder={`جست‌وجوی ${label}...`}
                aria-label={`جست‌وجوی ${label}`}
                className="pr-9 text-small"
                autoComplete="off"
              />
            </div>
          </div>
          <ComboboxEmpty>نتیجه‌ای پیدا نشد</ComboboxEmpty>
          <ComboboxList>
            {(option: SelectOption) => (
              <ComboboxItem key={option.value} value={option}>
                <span>{option.label}</span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </CreateEntrySelectField>
  );
}

function CreateEntrySelectField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-small font-semibold text-ink">
        {label}
      </label>
      {children}
      {error ? <p className="text-small text-brand-ink">{error}</p> : null}
    </div>
  );
}

function optionMatchesSearch(option: SelectOption, search: string) {
  const normalizedSearch = normalizePersianSearch(search);

  if (!normalizedSearch) {
    return true;
  }

  return normalizePersianSearch(`${option.label} ${option.description ?? ""}`).includes(
    normalizedSearch,
  );
}

function TagMultiSelect({ label, selectedValues, options, onChange, error }: TagMultiSelectProps) {
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
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

  if (isMobile) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-small font-semibold text-ink">{label}</span>
          <span className="text-[12px] text-faint">
            {formatPersianNumber(selectedValues.length)} انتخاب
          </span>
        </div>
        {selectedOptions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-small font-medium text-brand-ink"
                onClick={() => toggleTag(option.value)}
              >
                {option.label}
                <XMarkIcon aria-hidden="true" className="size-3.5" />
              </button>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-control border border-line bg-surface px-3 text-small text-faint outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
            error && "border-destructive",
          )}
          onClick={() => setMobileOpen(true)}
        >
          انتخاب برچسب‌ها
          <span>{formatPersianNumber(selectedValues.length)}</span>
        </button>
        {error ? <p className="text-small text-brand-ink">{error}</p> : null}
        <Drawer
          open={mobileOpen}
          onOpenChange={(open) => {
            setMobileOpen(open);
            if (!open) setSearchValue("");
          }}
          showSwipeHandle
        >
          <DrawerContent dir="rtl" className="max-h-[84dvh] border-line-soft">
            <DrawerHeader className="px-5 text-start">
              <DrawerTitle>برچسب‌ها</DrawerTitle>
              <DrawerDescription>یک یا چند برچسب مرتبط را انتخاب کنید.</DrawerDescription>
            </DrawerHeader>
            {isSearchable ? (
              <div className="px-5 pt-3">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
                  <Input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="جست‌وجوی برچسب..."
                    className="h-11 pr-9"
                    autoFocus
                  />
                </div>
              </div>
            ) : null}
            <div className="min-h-0 overflow-y-auto px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex flex-wrap gap-2">
                {filteredOptions.map((option) => {
                  const selected = selectedValues.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      className={cn(
                        "rounded-full border px-3 py-2 text-small",
                        selected
                          ? "border-brand/20 bg-brand-soft font-semibold text-brand-ink"
                          : "border-line-soft bg-surface text-faint",
                      )}
                      onClick={() => toggleTag(option.value)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-small font-semibold text-ink">{label}</span>
        <span className="text-[12px] text-faint">
          {formatPersianNumber(selectedValues.length)} انتخاب
        </span>
      </div>
      {selectedOptions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-small font-medium text-brand-ink transition-colors hover:bg-brand-soft"
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
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-faint"
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
          "flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-control border border-line-soft bg-paper/70 p-3",
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
                    ? "border-brand/20 bg-brand-soft font-semibold text-brand-ink"
                    : "border-line-soft bg-surface text-faint hover:border-primary/30 hover:text-brand-ink",
                )}
                aria-pressed={selected}
                onClick={() => toggleTag(option.value)}
              >
                {option.label}
              </button>
            );
          })
        ) : (
          <p className="w-full py-4 text-center text-small text-faint">
            برچسبی پیدا نشد.
          </p>
        )}
      </div>
      {error ? <p className="text-small text-brand-ink">{error}</p> : null}
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
