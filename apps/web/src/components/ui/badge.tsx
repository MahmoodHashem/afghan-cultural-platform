import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badges are the reference "chips": pill labels that tint red for categories (`chip`), sit on
 * photos (`glass`), mark a thumbnail corner (`corner`) or carry a count (`count`).
 */
const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-[11.5px] font-bold whitespace-nowrap transition-[color,background-color,border-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 aria-invalid:border-destructive [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary-hover",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/88",
        destructive: "bg-destructive text-destructive-foreground [a]:hover:bg-destructive/90",
        outline:
          "border-line bg-surface font-medium text-copy [a]:hover:border-brand [a]:hover:bg-brand-soft [a]:hover:text-brand-ink",
        ghost: "font-medium text-copy hover:bg-line-soft hover:text-ink",
        link: "text-brand-ink underline-offset-4 hover:underline",
        /** Category chip: red tint, red text. */
        chip: "h-auto bg-brand-soft px-3.5 py-1 text-[12.5px] leading-[1.6] text-brand-ink",
        /** Chip for photos and navy heroes. */
        glass:
          "h-auto border-white/26 bg-white/14 px-3 py-0.5 text-[12px] leading-[1.6] text-white backdrop-blur-sm",
        /** Solid corner tag on thumbnails (speech-bubble corner). */
        corner:
          "h-auto rounded-bubble-xs bg-brand px-3 py-0.5 text-[11px] leading-[1.6] text-white",
        /** Small count pill inside tabs and headings. */
        count: "h-auto bg-line-soft px-2 text-[11px] leading-[1.9] text-faint",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
