import {
  CameraIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckBadgeIcon,
  HeartIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

import { formatPersianNumber } from "@/lib/utils/formatters";

const writingTips: { text: string; icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  {
    text: "به زبان ساده و خودتان بنویسید؛ لازم نیست نویسنده یا پژوهشگر باشید.",
    icon: ChatBubbleBottomCenterTextIcon,
  },
  {
    text: "اگر روایت را از کسی شنیده‌اید، نام راوی یا جای آن را بنویسید.",
    icon: LinkIcon,
  },
  {
    text: "عکسی که خودتان گرفته‌اید یا اجازه‌ی نشرش را دارید، مطلب را زنده‌تر می‌کند.",
    icon: CameraIcon,
  },
  {
    text: "با احترام از مردم، باورها و آیین‌ها بنویسید.",
    icon: HeartIcon,
  },
];

const nextSteps = [
  "پیش‌نویس فقط برای شما دیده می‌شود.",
  "پس از ارسال، گردانندگان مطلب را بررسی می‌کنند.",
  "اگر نکته‌ای لازم باشد، در پروفایل شما نوشته می‌شود.",
  "پس از تأیید، مطلب برای همه منتشر می‌شود.",
];

/** Side guidance for contributors: how to write well, and what happens after sending. */
function ContributionGuide() {
  return (
    <aside
      aria-label="راهنمای نوشتن"
      className="space-y-4 lg:sticky lg:top-28 lg:self-start max-lg:pb-6"
    >
      <section className="relative isolate overflow-hidden rounded-[22px_22px_22px_6px] bg-linear-155 from-hero-navy to-hero-navy-deep p-5 text-white">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -end-2 -bottom-6 -z-10 font-calli text-[80px] leading-none text-white opacity-[0.08] select-none"
        >
          روایت
        </span>
        <p className="font-hand text-[18px] text-gold">سهم شما در میراث</p>
        <p className="mt-1 text-[14px] leading-[1.95] text-white/85">
          آنچه امروز می‌نویسید، فردا کسی را با فرهنگ سرزمینش آشنا می‌کند.
        </p>
      </section>

      <section className="rounded-card border border-line-soft bg-surface p-5 shadow-card">
        <h2 className="text-[14px] font-bold text-ink">راهنمای نوشتن</h2>
        <ul className="mt-4 space-y-3.5">
          {writingTips.map((tip) => {
            const Icon = tip.icon;

            return (
              <li key={tip.text} className="flex gap-3 text-[13px] leading-[1.9] text-copy">
                <span className="grid size-8 shrink-0 place-items-center rounded-[10px_10px_10px_3px] bg-brand-soft text-brand-ink">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                {tip.text}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-card bg-tint-sand p-5">
        <h2 className="flex items-center gap-2 text-[14px] font-bold text-ink">
          <CheckBadgeIcon className="size-5 text-saffron" aria-hidden="true" />
          پس از ارسال چه می‌شود؟
        </h2>
        <ol className="mt-3 space-y-2.5">
          {nextSteps.map((step, index) => (
            <li key={step} className="flex gap-2.5 text-[13px] leading-[1.9] text-copy">
              <span className="font-hand text-[17px] leading-[1.6] text-saffron" aria-hidden="true">
                {formatPersianNumber(index + 1)}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>
    </aside>
  );
}

export { ContributionGuide };
