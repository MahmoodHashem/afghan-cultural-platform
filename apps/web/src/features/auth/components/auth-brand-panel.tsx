import { BookOpenIcon, SparklesIcon, StarIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { STAR_ICON_SRC } from "../constants/auth-assets";

type BrandHighlight = {
  title: string;
  description: string;
  tone: "primary" | "terracotta" | "gold";
};

type AuthBrandPanelProps = {
  backgroundSrc: string;
  variant: "login" | "register";
  className?: string;
};

const registerHighlights: BrandHighlight[] = [
  {
    title: "یادگیری اصیل",
    description: "محتوای معتبر و با کیفیت",
    tone: "gold",
  },
  {
    title: "فرهنگ غنی",
    description: "با ریشه در تاریخ و هویت ما",
    tone: "terracotta",
  },
  {
    title: "جامعه پویا",
    description: "یادگیری و ارتباط در یک فضای سالم",
    tone: "primary",
  },
];

function AuthBrandPanel({ backgroundSrc, variant, className }: AuthBrandPanelProps) {
  return (
    <aside
      className={cn(
        "relative hidden lg:flex items-center  min-h-180 overflow-hidden rounded-[24px] ",
        className,
      )}
      aria-label="معرفی میراث افغانستان"
    >
      <Image
        src={backgroundSrc}
        alt=""
        fill
        priority
        sizes="(max-width: 1023px) 0px, 48vw"
        className="object-cover object-center opacity-80"
      />
      <div className="absolute inset-0 bg-linear-to-b from-background/70 via-background/45 to-background/95" />

      {variant === "login" ? <LoginMessage /> : <RegisterHighlights />}
    </aside>
  );
}

function LoginMessage() {
  return (
    <div className="flex relative not-last: flex-col items-start justify-end h-160 ">
      <div className="max-w-110 space-y-3">
        <div className="mb-2 flex items-center gap-3 text-gold">
          <span className="h-px w-14 bg-gold/70" />
          <SparklesIcon className="size-7" aria-hidden="true" />
        </div>
        <Image
          src={STAR_ICON_SRC}
          width={100}
          height={100}
          alt=""
          className="absolute -left-20 -bottom-15"
          aria-hidden="true"
        />

        <h2 className="text-[22px] font-bold leading-9 text-primary">
          جایی برای دانستن، یادگیری و پاسداشت
        </h2>
        <p className="max-w-95 text-[15px] leading-8 text-muted-foreground">
          با هم، میراث فرهنگی افغانستان را زنده نگه می‌داریم و به نسل‌های آینده منتقل می‌کنیم.
        </p>
      </div>
    </div>
  );
}

function RegisterHighlights() {
  return (
    <div className="h-187.5 flex items-end relative z-10">
      <div className=" grid grid-cols-3 gap-4">
        {registerHighlights.map((highlight) => (
          <div
            key={highlight.title}
            className="space-y-2 border-e border-border/80 px-4 last:border-e-0"
          >
            <HighlightIcon tone={highlight.tone} />
            <h2 className="text-[16px] font-bold text-foreground">{highlight.title}</h2>
            <p className="text-[13px] leading-7 text-muted-foreground">{highlight.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HighlightIcon({ tone }: Pick<BrandHighlight, "tone">) {
  const classes = {
    primary: "text-primary",
    terracotta: "text-terracotta",
    gold: "text-gold",
  };

  const Icon = tone === "primary" ? UserGroupIcon : tone === "terracotta" ? StarIcon : BookOpenIcon;

  return <Icon className={cn("size-7", classes[tone])} aria-hidden="true" />;
}

export { AuthBrandPanel };
