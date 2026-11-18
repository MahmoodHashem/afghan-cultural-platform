"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";

import { cn } from "@/lib/utils";

const Combobox = ComboboxPrimitive.Root;
const ComboboxValue = ComboboxPrimitive.Value;

function ComboboxTrigger({ className, children, ...props }: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn(
        "flex h-10 w-full items-center justify-between gap-1.5 rounded-control border-[1.5px] border-input bg-paper py-2 pe-2.5 ps-3.5 text-[13.5px] whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:bg-surface focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.Icon className="text-muted-foreground">
        <ChevronDownIcon className="size-4" aria-hidden="true" />
      </ComboboxPrimitive.Icon>
    </ComboboxPrimitive.Trigger>
  );
}

function ComboboxContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<ComboboxPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50 outline-none"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cn(
            "relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-64 origin-(--transform-origin) overflow-hidden rounded-[14px] bg-popover text-popover-foreground border border-line shadow-menu duration-100 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0",
            className,
          )}
          {...props}
        >
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

function ComboboxInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-input"
      className={cn(
        "h-10 w-full rounded-control border-[1.5px] border-input bg-paper px-3 text-[13.5px] text-ink outline-none placeholder:text-faint/70 focus:border-ring focus:bg-surface focus:shadow-focus",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        "max-h-64 overflow-y-auto overscroll-contain p-1 scroll-py-1 outline-none data-empty:p-0",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxItem({ className, children, ...props }: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-[9px] py-2 pe-8 ps-2 text-[13.5px] outline-hidden select-none data-highlighted:bg-muted data-highlighted:text-foreground data-selected:bg-primary/10 data-selected:text-brand-ink data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="flex min-w-0 flex-1 flex-col text-right">{children}</span>
      <ComboboxPrimitive.ItemIndicator className="pointer-events-none absolute inset-e-2 flex size-4 items-center justify-center">
        <CheckIcon className="size-4" aria-hidden="true" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  );
}

function ComboboxEmpty({ className, children, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty data-slot="combobox-empty" {...props}>
      <div className={cn("px-3 py-6 text-center text-sm text-muted-foreground", className)}>
        {children}
      </div>
    </ComboboxPrimitive.Empty>
  );
}

export {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
};
