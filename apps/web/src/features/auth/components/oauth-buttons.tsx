import type { SimpleIcon } from "simple-icons";
import { siFacebook, siGoogle } from "simple-icons";

import { Button } from "@/components/ui/button";

type OAuthButtonsProps = {
  googleLabel: string;
  facebookLabel: string;
};

function OAuthButtons({ googleLabel, facebookLabel }: OAuthButtonsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Button
        type="button"
        variant="outline"
        className="h-11 justify-center gap-3 border-border bg-card text-foreground hover:border-primary/30 hover:bg-primary-light/30"
        aria-label={googleLabel}
      >
        <BrandIcon icon={siGoogle} />
        <span>{googleLabel}</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-11 justify-center gap-3 border-border bg-card text-foreground hover:border-primary/30 hover:bg-primary-light/30"
        aria-label={facebookLabel}
      >
        <BrandIcon icon={siFacebook} />
        <span>{facebookLabel}</span>
      </Button>
    </div>
  );
}

function BrandIcon({ icon }: { icon: SimpleIcon }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      fill={`#${icon.hex}`}
      aria-hidden="true"
      focusable="false"
    >
      <path d={icon.path} />
    </svg>
  );
}

export { OAuthButtons };
