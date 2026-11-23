import type { SimpleIcon } from "simple-icons";
import { siGoogle } from "simple-icons";

import { Button } from "@/components/ui/button";

type OAuthButtonsProps = {
  googleLabel: string;
  onGoogleClick?: () => void;
};

function OAuthButtons({ googleLabel, onGoogleClick }: OAuthButtonsProps) {
  return (
    <div>
      <Button
        type="button"
        variant="outline"
        onClick={onGoogleClick}
        className="h-11.5 w-full justify-center gap-3 rounded-control border-line bg-surface text-ink hover:border-brand/30 hover:bg-paper"
        aria-label={googleLabel}
      >
        <BrandIcon icon={siGoogle} />
        <span>{googleLabel}</span>
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
