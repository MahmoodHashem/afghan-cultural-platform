import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Buttons follow the reference language: always bold, red-led, with the speech-bubble corner
 * (12 12 12 4) for rectangular buttons and full pills for `pill`, `cta` and `more`.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-bubble-sm border border-transparent bg-clip-padding text-[13.5px] font-bold whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] duration-200 outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:shadow-focus [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-250 [&_svg]:ease-expo [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        /** Solid red action. */
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        /** Surface control with a hairline border; turns red-tinted on hover. */
        outline:
          "border-line bg-surface text-ink hover:border-brand hover:bg-brand-soft hover:text-brand-ink aria-expanded:border-brand aria-expanded:bg-brand-soft aria-expanded:text-brand-ink",
        /** Navy (ink) fill for secondary emphasis. */
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/88 aria-expanded:bg-secondary/88",
        ghost:
          "text-copy hover:bg-line-soft hover:text-ink aria-expanded:bg-line-soft aria-expanded:text-ink",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:outline-destructive",
        link: "text-brand-ink underline-offset-4 hover:underline",
        /** Primary pill (reference "btn-support"). */
        pill: "rounded-full bg-primary text-primary-foreground hover:bg-primary-hover",
        /** Outline call-to-action pill that fills red on hover; arrows nudge toward the reading direction. */
        cta:
          "rounded-full border-[color-mix(in_oklab,var(--brand)_42%,var(--line))] bg-transparent text-brand-ink hover:border-primary hover:bg-primary hover:text-primary-foreground hover:[&_svg]:-translate-x-1",
        /** Section "see all" link pill. */
        more:
          "rounded-full border-line bg-surface text-brand-ink hover:border-brand hover:bg-brand-soft hover:[&_svg]:-translate-x-1",
        /** Ghost control for use on navy heroes and photos. */
        glass:
          "rounded-full bg-transparent text-white/92 shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.32)] hover:bg-white/12 hover:shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.55)] focus-visible:outline-white aria-pressed:bg-white/16",
      },
      size: {
        default:
          "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pe-3 has-data-[icon=inline-start]:ps-3",
        xs:
          "h-6 gap-1 rounded-bubble-xs px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm:
          "h-8 gap-1 rounded-bubble-xs px-3 text-[12.5px] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg:
          "h-11.5 gap-2 px-6 text-[14px] has-data-[icon=inline-end]:pe-5 has-data-[icon=inline-start]:ps-5",
        icon: "size-9",
        "icon-xs":
          "size-6 rounded-bubble-xs in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-bubble-xs in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
