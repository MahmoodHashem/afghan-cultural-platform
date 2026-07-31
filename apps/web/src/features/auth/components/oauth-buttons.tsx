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
        <span className="text-[22px] font-bold leading-none text-[#4285F4]" aria-hidden="true">
          G
        </span>
        <span>{googleLabel}</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-11 justify-center gap-3 border-border bg-card text-foreground hover:border-primary/30 hover:bg-primary-light/30"
        aria-label={facebookLabel}
      >
        <span
          className="grid size-6 place-items-center rounded-full bg-[#1877F2] text-sm font-bold leading-none text-white"
          aria-hidden="true"
        >
          f
        </span>
        <span>{facebookLabel}</span>
      </Button>
    </div>
  );
}

export { OAuthButtons };
