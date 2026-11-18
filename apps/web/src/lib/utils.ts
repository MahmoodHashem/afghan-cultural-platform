import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge only knows Tailwind's default scales. The design system adds named radii,
 * shadows and type styles (see src/app/globals.css); registering them lets `cn()` resolve
 * conflicts such as `rounded-bubble-sm` vs `rounded-full` or `text-card-title` vs `text-ink`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      rounded: [
        {
          rounded: [
            "bubble",
            "bubble-md",
            "bubble-sm",
            "bubble-xs",
            "arch",
            "control",
            "card",
            "media",
          ],
        },
      ],
      shadow: [{ shadow: ["card", "lift", "header", "menu", "figure", "float", "focus"] }],
      "font-size": [
        {
          text: [
            "display",
            "page-title",
            "section-title",
            "card-title",
            "card-title-sm",
            "body",
            "article",
            "lead",
            "small",
            "meta",
            "micro",
            "form-label",
            "button",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
