"use client";

import {
  MagnifyingGlassIcon,
  MapPinIcon,
  Squares2X2Icon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import {
  type ReactNode,
  type SubmitEvent,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { Button, buttonVariants } from "@/components/ui/button";
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
import type { TaxonomyItem } from "../types/public-entry";
import { createExploreHref, type NormalizedExploreQuery } from "../utils/explore-query";

type ExploreFilterFormProps = {
  taxonomy: {
    provinces: TaxonomyItem[];
    categories: TaxonomyItem[];
    contentTypes: TaxonomyItem[];
    tags: TaxonomyItem[];
  };
  query: NormalizedExploreQuery;
  variant?: "bar" | "sheet";
  autoApply?: boolean;
  onApplied?: () => void;
};

const ALL_VALUE = "__all__";

type FilterState = {
  provinceSlug?: string;
  categorySlug?: string;
  contentTypeSlug?: string;
  tagSlug?: string;
};

function ExploreFilterForm({
  taxonomy,
  query,
  variant = "bar",
  autoApply = false,
  onApplied,
}: ExploreFilterFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<FilterState>(() => getInitialFilters(query));

  useEffect(() => {
    setFilters({
      provinceSlug: query.provinceSlug,
      categorySlug: query.categorySlug,
      contentTypeSlug: query.contentTypeSlug,
      tagSlug: query.tagSlug,
    });
  }, [query.provinceSlug, query.categorySlug, query.contentTypeSlug, query.tagSlug]);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextHref = createExploreHref(query, {
      page: 1,

      provinceSlug: filters.provinceSlug,
      categorySlug: filters.categorySlug,
      contentTypeSlug: filters.contentTypeSlug,
      tagSlug: filters.tagSlug,
    });

    startTransition(() => {
      router.push(nextHref, { scroll: false });
      onApplied?.();
    });
  }

  function handleReset() {
    startTransition(() => {
      router.push("/explore", { scroll: false });
      onApplied?.();
    });
  }

  function handleFilterChange(key: keyof FilterState, value: string | undefined) {
    const nextFilters = {
      ...filters,
      [key]: value,
    };

    setFilters(nextFilters);

    if (!autoApply) {
      return;
    }

    const nextHref = createExploreHref(query, {
      page: 1,
      provinceSlug: nextFilters.provinceSlug,
      categorySlug: nextFilters.categorySlug,
      contentTypeSlug: nextFilters.contentTypeSlug,
      tagSlug: nextFilters.tagSlug,
    });

    startTransition(() => {
      router.push(nextHref, { scroll: false });
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "border border-border bg-card shadow-[0_6px_24px_rgba(31,41,55,0.035)]",
        variant === "bar"
          ? "grid w-full grid-cols-2 gap-1 rounded-2xl p-2 lg:grid-cols-4"
          : "space-y-2 rounded-2xl p-4",
      )}
    >
      <SelectField
        icon={<MapPinIcon className="size-5" aria-hidden="true" />}
        label="ولایت"
        name="provinceSlug"
        value={filters.provinceSlug}
        onValueChange={(value) => handleFilterChange("provinceSlug", value)}
        options={taxonomy.provinces.map(toOption)}
        placeholder="همه ولایت‌ها"
      />
      <SelectField
        icon={<Squares2X2Icon className="size-5" aria-hidden="true" />}
        label="موضوع"
        name="categorySlug"
        value={filters.categorySlug}
        onValueChange={(value) => handleFilterChange("categorySlug", value)}
        options={taxonomy.categories.map(toOption)}
        placeholder="همه موضوع‌ها"
      />
      <SelectField
        icon={<Squares2X2Icon className="size-5" aria-hidden="true" />}
        label="نوع محتوا"
        name="contentTypeSlug"
        value={filters.contentTypeSlug}
        onValueChange={(value) => handleFilterChange("contentTypeSlug", value)}
        options={taxonomy.contentTypes.map(toOption)}
        placeholder="همه انواع محتوا"
      />
      <SelectField
        icon={<TagIcon className="size-5" aria-hidden="true" />}
        label="برچسب"
        name="tagSlug"
        value={filters.tagSlug}
        onValueChange={(value) => handleFilterChange("tagSlug", value)}
        options={taxonomy.tags.map(toOption)}
        placeholder="همه برچسب‌ها"
      />

      {variant === "sheet" ? (
        <div className="mt-5 grid gap-3">
          <Button type="submit" className="rounded-full" disabled={isPending}>
            {isPending ? "در حال نمایش..." : "نمایش نتایج"}
          </Button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isPending}
            className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
          >
            حذف همه فیلترها
          </button>
        </div>
      ) : null}
    </form>
  );
}

type SelectOption = {
  label: string;
  value: string;
};

function SelectField({
  icon,
  label,
  name,
  value,
  onValueChange,
  options,
  placeholder = "همه",
}: {
  icon: ReactNode;
  label: string;
  name: string;
  value?: string;
  onValueChange: (value: string | undefined) => void;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
}) {
  const selectOptions = [{ label: placeholder, value: ALL_VALUE }, ...options];
  const [searchValue, setSearchValue] = useState("");

  const isSearchable = options.length > 10;

  const filteredOptions = useMemo(() => {
    if (!isSearchable || !searchValue.trim()) {
      return options;
    }

    const normalizedSearch = normalizeOptionSearch(searchValue);

    return options.filter((option) =>
      normalizeOptionSearch(option.label).includes(normalizedSearch),
    );
  }, [isSearchable, options, searchValue]);

  const displayedOptions = useMemo<SelectOption[]>(() => {
    // Search mode
    if (searchValue.trim()) {
      return filteredOptions;
    }

    // Nothing selected
    if (!value) {
      return [
        { label: placeholder, value: ALL_VALUE },
        ...filteredOptions,
      ];
    }

    const selectedOption = filteredOptions.find(
      (option) => option.value === value,
    );

    const remainingOptions = filteredOptions.filter(
      (option) => option.value !== value,
    );

    return [
      ...(selectedOption ? [selectedOption] : []),
      { label: placeholder, value: ALL_VALUE },
      ...remainingOptions,
    ];
  }, [filteredOptions, placeholder, searchValue, value]);
  return (
    <Select
      name={name}
      items={selectOptions}
      value={value ?? ALL_VALUE}
      onValueChange={(nextValue) => {
        onValueChange(nextValue === ALL_VALUE || nextValue === null ? undefined : nextValue);

        setSearchValue("");
      }}
    >
      <SelectTrigger
        aria-label={label}
        className="
        group h-auto w-full min-w-0
        rounded-xl border-0 bg-transparent
        px-3 py-3 shadow-none
        transition-colors
        hover:bg-muted/50
        focus-visible:ring-2 focus-visible:ring-primary/20
        data-[state=open]:bg-muted/60
      "
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 text-right">
          <span
            className="
            shrink-0 text-muted-foreground
            transition-colors
            group-hover:text-primary
            group-data-[state=open]:text-primary
          "
          >
            {icon}
          </span>

          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-foreground">{label}</p>

            <p
              className={cn(
                "mt-0.5 truncate text-[12px] text-muted-foreground",
                value && "font-medium text-primary",
              )}
            >
              {findOptionLabel(options, value) ?? placeholder}
            </p>
          </div>
        </div>

        <SelectValue className="sr-only" />
      </SelectTrigger>

      <SelectContent align="end" alignItemWithTrigger={false} className="min-w-64 max-h-80">
        {isSearchable ? (
          <form
            className="sticky top-0 z-10 border-b border-border bg-popover p-2"
            onKeyDown={(event) => event.stopPropagation()}
          >
            <div className="relative">
              <MagnifyingGlassIcon
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />

              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={`جست‌وجوی ${label}...`}
                className="   h-9 rounded-lgborder-border bg-background  pr-9 text-[13px] shadow-none focus-visible:ring-2 focus-visible:ring-primary/20
          "
                autoComplete="off"
              />
            </div>
          </form>
        ) : null}

        <SelectGroup>
          <SelectItem className="data-[selected]:bg-primary/10
          data-[selected]:font-semibold
          data-[selected]:text-primary
  " value={ALL_VALUE}>{placeholder}</SelectItem>

          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <SelectItem
                className="data-[selected]:bg-primary/10
          data-[selected]:font-semibold
          data-[selected]:text-primary
  "
                key={option.value}
                value={option.value}
              >
                {option.label}
              </SelectItem>
            ))
          ) : (
            <div className="px-3 py-6 text-center text-[13px] text-muted-foreground">
              نتیجه‌ای پیدا نشد
            </div>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function normalizeOptionSearch(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("fa-AF")
    .replaceAll("ي", "ی")
    .replaceAll("ك", "ک")
    .replace(/\u200c/g, " ")
    .replace(/\s+/g, " ");
}

function getInitialFilters(query: ExploreFilterFormProps["query"]): FilterState {
  return {
    provinceSlug: query.provinceSlug,
    categorySlug: query.categorySlug,
    contentTypeSlug: query.contentTypeSlug,
    tagSlug: query.tagSlug,
  };
}

function toOption(item: TaxonomyItem) {
  return {
    label: item.name,
    value: item.slug,
  };
}

function findOptionLabel(
  options: Array<{ label: string; value: string }>,
  value: string | undefined,
) {
  return options.find((option) => option.value === value)?.label;
}

export { ExploreFilterForm };
