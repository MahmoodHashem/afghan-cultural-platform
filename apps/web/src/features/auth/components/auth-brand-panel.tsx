import {
  BookOpenIcon,
  CheckBadgeIcon,
  PencilSquareIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import type { ComponentType, SVGProps } from "react";

import { cn } from "@/lib/utils";

type Highlight = {
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

type AuthBrandPanelProps = {
  backgroundSrc: string;
  variant: "login" | "register";
  className?: string;
};

const panelCopy = {
  login: {
    eyebrow: "خوش برگشتید",
    title: "روایت‌های تازه منتظر شما هستند",
    description:
      "وارد شوید تا مطالب خود را ادامه دهید، دیدگاه بنویسید و آنچه را دوست دارید برای بعد نگه دارید.",
  },
  register: {
    eyebrow: "به جمع نگهبانان میراث بپیوندید",
    title: "دانسته‌ی شما بخشی از حافظه‌ی مردم ماست",
    description:
      "با ساختن حساب، می‌توانید قصه‌ها، رسم‌ها، جاها و هنرهایی را که می‌شناسید برای نسل‌های بعد ثبت کنید.",
  },
} as const;

const highlights: Highlight[] = [
  { title: "بنویسید", description: "به زبان ساده و خودتان", icon: PencilSquareIcon },
  { title: "بازبینی می‌شود", description: "با دقت و احترام", icon: CheckBadgeIcon },
  { title: "می‌ماند", description: "برای خوانندگان فردا", icon: BookOpenIcon },
];

/** Illustrated end panel of the auth card: a pale mosque drawing with a short invitation. */
function AuthBrandPanel({ backgroundSrc, variant, className }: AuthBrandPanelProps) {
  const copy = panelCopy[variant];

  return (
    <aside
      className={cn(
        "relative isolate hidden min-h-150 flex-col justify-end overflow-hidden bg-leaf p-10 lg:flex",
        className,
      )}
      aria-label="معرفی میراث افغانستان"
    >
      <Image
        src={backgroundSrc}
        alt=""
        fill
        priority
        sizes="(max-width: 1023px) 0px, 46vw"
        className="-z-10 object-cover object-top dark:opacity-20"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-b from-transparent via-leaf/40 to-leaf dark:via-surface/70 dark:to-surface"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 -z-10 rounded-[24px_24px_24px_6px] border border-ink/8"
      />

      <div className="space-y-3">
        <p className="font-hand text-[19px] text-saffron">{copy.eyebrow}</p>
        <h2 className="max-w-[22ch] text-[24px] leading-[1.6] font-bold text-ink">{copy.title}</h2>
        <p className="max-w-[44ch] text-[14px] leading-[2] text-copy">{copy.description}</p>
      </div>

      <ul className="mt-7 grid grid-cols-3 gap-3">
        {highlights.map((item) => {
          const Icon = item.icon;

          return (
            <li
              key={item.title}
              className="rounded-[16px_16px_16px_5px] border border-line-soft bg-surface/85 p-3.5 backdrop-blur-sm"
            >
              <Icon className="size-5 text-brand" aria-hidden="true" />
              <p className="mt-2 text-[13px] font-bold text-ink">{item.title}</p>
              <p className="mt-0.5 text-[11.5px] leading-[1.8] text-faint">{item.description}</p>
            </li>
          );
        })}
      </ul>

      {variant === "register" ? (
        <p className="mt-5 flex items-center gap-2 text-[12.5px] text-copy">
          <UserGroupIcon className="size-4.5 text-saffron" aria-hidden="true" />
          ثبت‌نام رایگان است و تنها چند دقیقه طول می‌کشد.
        </p>
      ) : null}
    </aside>
  );
}

export { AuthBrandPanel };
