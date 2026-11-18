import {
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  FlagIcon,
  MagnifyingGlassIcon,
  MapIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  InformationPage,
  InformationSection,
} from "@/features/information/components/information-page";
import { createRobotsMetadata, createSocialMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";

const ABOUT_DESCRIPTION =
  "میراث افغانستان یک پلتفرم مشارکتی برای گردآوری، حفظ و دسترسی بهتر به دانش فرهنگی افغانستان است.";

export const metadata: Metadata = {
  title: "درباره ما",
  description: ABOUT_DESCRIPTION,
  alternates: { canonical: "/about" },
  robots: createRobotsMetadata(),
  ...createSocialMetadata({
    title: "درباره ما | میراث افغانستان",
    description: ABOUT_DESCRIPTION,
    canonicalPath: "/about",
  }),
};

const capabilities: { label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { label: "مطالب فرهنگی را جست‌وجو و مطالعه کنند.", icon: MagnifyingGlassIcon },
  { label: "بر اساس ولایت، موضوع و نوع مطلب به کشف محتوا بپردازند.", icon: MapIcon },
  { label: "معلومات و دانش فرهنگی خود را ثبت کنند.", icon: PencilSquareIcon },
  { label: "برای مطالب موجود پیشنهاد اصلاح بفرستند.", icon: ArrowPathIcon },
  {
    label: "در بخش دیدگاه‌ها گفت‌وگو کنند و مطالب مورد علاقه خود را ذخیره کنند.",
    icon: ChatBubbleLeftRightIcon,
  },
  { label: "محتوای نادرست یا نامناسب را گزارش دهند.", icon: FlagIcon },
];

export default function AboutPage() {
  return (
    <InformationPage
      eyebrow="درباره‌ی میراث"
      title="دانش فرهنگی افغانستان، با مشارکت مردم"
      description={ABOUT_DESCRIPTION}
      word="میراث"
      actions={
        <>
          <Link href="/entries/new" className={buttonVariants({ variant: "pill", size: "lg" })}>
            <PencilSquareIcon className="size-5" aria-hidden="true" />
            ثبت مطلب
          </Link>
          <Link href="/explore" className={cn(buttonVariants({ variant: "glass" }), "h-11.5")}>
            گشتی در بایگانی
          </Link>
        </>
      }
      withContributeBand
      className="max-w-(--container-article)"
    >
      <div className="space-y-14">
        <InformationSection id="about-together" title="فرهنگ افغانستان را با هم ثبت می‌کنیم">
          <p>
            فرهنگ افغانستان تنها در کتاب‌ها و اسناد رسمی خلاصه نمی‌شود. بخش بزرگی از آن در خاطرات
            مردم، روایت‌های محلی، رسم‌ها و آیین‌ها، غذاها، موسیقی، صنایع دستی، مکان‌های تاریخی و
            تجربه‌های نسل‌های مختلف زنده مانده است.
          </p>
          <p>
            هدف میراث افغانستان این است که این دانش پراکنده در یک مکان قابل دسترس، قابل جست‌وجو و
            قابل تکمیل باشد؛ مکانی که در آن روایت‌های گوناگون با احترام و دقت ثبت شوند.
          </p>
        </InformationSection>

        <InformationSection id="about-mission" title="مأموریت ما">
          <p>
            مأموریت ما کمک به ثبت و حفظ دانش فرهنگی افغانستان و فراهم‌کردن زمینه برای مشارکت مردم
            در این فرایند است. در میراث، همه می‌توانند:
          </p>
          <ul className="grid gap-3 pt-2 sm:grid-cols-2">
            {capabilities.map((item) => {
              const Icon = item.icon;

              return (
                <li
                  key={item.label}
                  className="flex items-start gap-3 rounded-[16px_16px_16px_5px] border border-line-soft bg-surface p-4 text-[14px] leading-[1.9] shadow-card"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-[12px_12px_12px_4px] bg-brand-soft text-brand-ink">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  {item.label}
                </li>
              );
            })}
          </ul>
        </InformationSection>

        <InformationSection id="about-why" title="چرا یک پلتفرم مشارکتی؟">
          <p>
            بخش بزرگی از دانش فرهنگی در اختیار خود مردم است. گاهی یک رسم محلی، یک روایت قدیمی یا
            معلومات مربوط به یک مکان تاریخی در منابع آنلاین ثبت نشده است، اما مردم همان منطقه آن را
            می‌شناسند.
          </p>
          <blockquote className="rounded-[18px_18px_18px_6px] border-s-4 border-brand bg-tint-rose px-5 py-4 text-[16px] leading-[2] font-bold text-ink">
            میراث افغانستان تلاش می‌کند این دانش را از حالت پراکنده خارج کند و زمینه‌ای فراهم سازد
            تا مردم در ثبت آن سهم بگیرند.
          </blockquote>
        </InformationSection>

        <InformationSection id="about-quality" title="چگونه کیفیت مطالب حفظ می‌شود؟">
          <p>
            مشارکتی‌بودن به این معنا نیست که هر مطلب بدون بررسی منتشر می‌شود. مطالب ارسال‌شده پیش از
            انتشار بررسی می‌شوند و کاربران می‌توانند برای مطالب منتشرشده پیشنهاد اصلاح بفرستند یا
            محتوای مشکل‌دار را گزارش دهند.
          </p>
          <p>
            منابع و مآخذ نیز بخش مهمی از هر مطلب هستند و در صورت موجود بودن، همراه محتوا نمایش داده
            می‌شوند. روایت‌های محلی و تجربه‌های شخصی نیز با مشخص‌شدن ماهیت آن‌ها، جای خود را در این
            مجموعه دارند.
          </p>
        </InformationSection>

        <InformationSection id="about-vision" title="چشم‌انداز ما">
          <p>
            ما می‌خواهیم میراث افغانستان به یک مرجع باز و قابل اعتماد برای شناخت فرهنگ افغانستان
            تبدیل شود؛ مرجعی که با مشارکت مردم رشد کند و دانش فرهنگی را برای نسل‌های آینده حفظ
            نماید.
          </p>
          <p className="border-s-2 border-brand ps-4 text-ink">
            میراث افغانستان توسط شاه محمود هاشمی توسعه داده می‌شود و با مشارکت جامعه رشد خواهد کرد.
          </p>
        </InformationSection>
      </div>
    </InformationPage>
  );
}
