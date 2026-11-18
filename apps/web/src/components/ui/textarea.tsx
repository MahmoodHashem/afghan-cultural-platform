import type * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-27 w-full resize-y rounded-control border-[1.5px] border-input bg-paper px-3.5 py-2.5 text-base leading-[1.9] text-ink transition-[border-color,background-color,box-shadow] duration-200 outline-none md:text-[14px] placeholder:text-faint/70 focus-visible:border-ring focus-visible:bg-surface focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:shadow-[0_0_0_3.5px_color-mix(in_srgb,var(--destructive)_16%,transparent)]",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
