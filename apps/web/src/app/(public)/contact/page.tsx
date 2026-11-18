import { EnvelopeIcon, FlagIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { ContactForm } from "@/features/information/components/contact-form";
import {
  InformationPage,
  InformationSection,
} from "@/features/information/components/information-page";
import { createRobotsMetadata, createSocialMetadata } from "@/lib/seo/metadata";

const SUPPORT_EMAIL = "shahmahmoodhashemi132@gmail.com";
const CONTACT_DESCRIPTION =
  "برای پرسش‌ها، گزارش مشکل، پیشنهاد اصلاح محتوا یا درخواست حذف حساب و داده‌ها با ما در تماس باشید.";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: CONTACT_DESCRIPTION,
  alternates: { canonical: "/contact" },
  robots: createRobotsMetadata(),
  ...createSocialMetadata({
    title: "تماس با ما | میراث افغانستان",
    description: CONTACT_DESCRIPTION,
    canonicalPath: "/contact",
  }),
};

export default function ContactPage() {
  return (
    <InformationPage
      eyebrow="صدای شما را می‌شنویم"
      title="تماس با میراث افغانستان"
      description={CONTACT_DESCRIPTION}
      word="پیام"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-12">
        <InformationSection id="contact-form-title" title="فرم تماس">
          <ContactForm />
        </InformationSection>

        <aside className="space-y-4 lg:sticky lg:top-28">
          <div className="rounded-card border border-line-soft bg-surface p-6 shadow-card">
            <span className="grid size-11 place-items-center rounded-[14px_14px_14px_4px] bg-brand-soft text-brand-ink">
              <EnvelopeIcon className="size-5.5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-card-title text-ink">ایمیل پشتیبانی</h2>
            <Link
              href={`mailto:${SUPPORT_EMAIL}`}
              dir="ltr"
              className="mt-3 block rounded-control border border-line bg-paper px-4 py-3 text-start text-[13.5px] font-bold break-all text-brand-ink transition-colors hover:border-brand/40 hover:bg-brand-soft"
            >
              {SUPPORT_EMAIL}
            </Link>
          </div>

          <ContactNote icon={FlagIcon} title="گزارش مطلب یا پیشنهاد اصلاح">
            برای گزارش یا اصلاح یک مطلب، از گزینه‌های همان صفحه استفاده کنید تا درخواست مستقیم به بخش
            مربوطه برسد.
          </ContactNote>

          <ContactNote icon={TrashIcon} title="حذف حساب و داده‌ها">
            برای حذف حساب و داده‌های شخصی، با همان ایمیل حساب خود به نشانی پشتیبانی پیام دهید.
          </ContactNote>
        </aside>
      </div>
    </InformationPage>
  );
}

function ContactNote({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof FlagIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[18px_18px_18px_6px] bg-tint-navy p-5">
      <h2 className="flex items-center gap-2 text-[14px] font-bold text-ink">
        <Icon className="size-4.5 text-faint" aria-hidden="true" />
        {title}
      </h2>
      <p className="mt-2 text-[13px] leading-[1.95] text-copy">{children}</p>
    </section>
  );
}
