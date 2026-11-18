import { Input as InputPrimitive } from "@base-ui/react/input";
import type * as React from "react";

import { cn } from "@/lib/utils";

/** Recessed field on `paper` that lifts onto `surface` with a red border and halo when focused. */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11.5 w-full min-w-0 rounded-control border-[1.5px] border-input bg-paper px-3.5 py-2 text-base text-ink md:text-[14px] transition-[border-color,background-color,box-shadow] duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-faint/70 focus-visible:border-ring focus-visible:bg-surface focus-visible:shadow-focus disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:shadow-[0_0_0_3.5px_color-mix(in_srgb,var(--destructive)_16%,transparent)]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
